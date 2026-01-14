import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, and, gte, lte, ilike, or, asc, desc } from 'drizzle-orm';
import { getDb, schema } from '../_lib/db';

interface Filters {
  maxPrice?: number;
  minPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMiles?: number;
  minMiles?: number;
  seats?: number;
  sort?: string;
  search?: string;
  make?: string[];
  model?: string[];
  bodyStyle?: string[];
  drivetrain?: string[];
  fuel?: string[];
  transmission?: string[];
  color?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getDb();

    // Parse query params
    const rawFilters: Filters = {};

    if (req.query.maxPrice) rawFilters.maxPrice = Number(req.query.maxPrice);
    if (req.query.minPrice) rawFilters.minPrice = Number(req.query.minPrice);
    if (req.query.minYear) rawFilters.minYear = Number(req.query.minYear);
    if (req.query.maxYear) rawFilters.maxYear = Number(req.query.maxYear);
    if (req.query.maxMiles) rawFilters.maxMiles = Number(req.query.maxMiles);
    if (req.query.minMiles) rawFilters.minMiles = Number(req.query.minMiles);
    if (req.query.seats) rawFilters.seats = Number(req.query.seats);
    if (req.query.sort) rawFilters.sort = String(req.query.sort);
    if (req.query.search) rawFilters.search = String(req.query.search);

    // Handle array params
    const arrayParams = ['make', 'model', 'bodyStyle', 'drivetrain', 'fuel', 'transmission', 'color'];
    for (const param of arrayParams) {
      if (req.query[param]) {
        const value = req.query[param];
        if (Array.isArray(value)) {
          (rawFilters as Record<string, unknown>)[param] = value.filter(v => typeof v === 'string');
        } else if (typeof value === 'string') {
          (rawFilters as Record<string, unknown>)[param] = [value];
        }
      }
    }

    const filters = rawFilters;

    // Build query conditions
    const conditions = [];

    // Price filters
    if (filters.maxPrice) {
      conditions.push(lte(schema.vehicles.price, filters.maxPrice));
    }
    if (filters.minPrice) {
      conditions.push(gte(schema.vehicles.price, filters.minPrice));
    }

    // Year filters
    if (filters.minYear) {
      conditions.push(gte(schema.vehicles.year, filters.minYear));
    }
    if (filters.maxYear) {
      conditions.push(lte(schema.vehicles.year, filters.maxYear));
    }

    // Mileage filters
    if (filters.maxMiles) {
      conditions.push(lte(schema.vehicles.mileage, filters.maxMiles));
    }
    if (filters.minMiles) {
      conditions.push(gte(schema.vehicles.mileage, filters.minMiles));
    }

    // Make filter
    if (filters.make && filters.make.length > 0) {
      const makeConditions = filters.make.map(m =>
        ilike(schema.vehicles.make, `%${m}%`)
      );
      conditions.push(or(...makeConditions));
    }

    // Model filter
    if (filters.model && filters.model.length > 0) {
      const modelConditions = filters.model.map(m =>
        ilike(schema.vehicles.model, `%${m}%`)
      );
      conditions.push(or(...modelConditions));
    }

    // Body style filter
    if (filters.bodyStyle && filters.bodyStyle.length > 0) {
      const bodyConditions = filters.bodyStyle.map(b =>
        ilike(schema.vehicles.bodyStyle, `%${b}%`)
      );
      conditions.push(or(...bodyConditions));
    }

    // Drivetrain filter
    if (filters.drivetrain && filters.drivetrain.length > 0) {
      const driveConditions = filters.drivetrain.map(d =>
        ilike(schema.vehicles.drivetrain, `%${d}%`)
      );
      conditions.push(or(...driveConditions));
    }

    // Fuel type filter
    if (filters.fuel && filters.fuel.length > 0) {
      const fuelConditions = filters.fuel.map(f =>
        ilike(schema.vehicles.fuelType, `%${f}%`)
      );
      conditions.push(or(...fuelConditions));
    }

    // Transmission filter
    if (filters.transmission && filters.transmission.length > 0) {
      const transConditions = filters.transmission.map(t =>
        ilike(schema.vehicles.transmission, `%${t}%`)
      );
      conditions.push(or(...transConditions));
    }

    // Color filter
    if (filters.color && filters.color.length > 0) {
      const colorConditions = filters.color.map(c =>
        ilike(schema.vehicles.color, `%${c}%`)
      );
      conditions.push(or(...colorConditions));
    }

    // Seats filter
    if (filters.seats) {
      conditions.push(gte(schema.vehicles.seats, filters.seats));
    }

    // Search filter (searches make, model, trim, description)
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(schema.vehicles.make, searchTerm),
          ilike(schema.vehicles.model, searchTerm),
          ilike(schema.vehicles.trim, searchTerm),
          ilike(schema.vehicles.description, searchTerm)
        )
      );
    }

    // Only show available vehicles
    conditions.push(eq(schema.vehicles.isAvailable, true));

    // Build query with sorting
    let orderBy;
    switch (filters.sort) {
      case 'price_asc':
        orderBy = asc(schema.vehicles.price);
        break;
      case 'price_desc':
        orderBy = desc(schema.vehicles.price);
        break;
      case 'year_desc':
        orderBy = desc(schema.vehicles.year);
        break;
      case 'miles_asc':
        orderBy = asc(schema.vehicles.mileage);
        break;
      default:
        orderBy = desc(schema.vehicles.createdAt);
    }

    const results = await db
      .select()
      .from(schema.vehicles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy);

    // Transform to Vehicle type
    const vehicles = results.map(v => ({
      id: v.id,
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim || undefined,
      price: v.price,
      mileage: v.mileage,
      bodyStyle: v.bodyStyle,
      seats: v.seats || undefined,
      color: v.color,
      fuelType: v.fuelType,
      transmission: v.transmission,
      drivetrain: v.drivetrain,
      mpgCity: v.mpgCity || undefined,
      mpgHighway: v.mpgHighway || undefined,
      features: (v.features as string[]) || [],
      description: v.description || undefined,
      imageUrl: v.imageUrl || undefined,
      isAvailable: v.isAvailable ?? true,
    }));

    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({
      error: 'Failed to fetch vehicles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
