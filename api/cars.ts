import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, and, gte, lte, ilike, or, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, vehicles } from './lib/db';

// Filters schema
const SortOptionSchema = z.enum(['price_asc', 'price_desc', 'year_desc', 'miles_asc']);

const FiltersSchema = z.object({
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  minYear: z.number().int().optional(),
  maxYear: z.number().int().optional(),
  maxMiles: z.number().int().optional(),
  minMiles: z.number().int().optional(),
  make: z.array(z.string()).optional(),
  model: z.array(z.string()).optional(),
  bodyStyle: z.array(z.string()).optional(),
  drivetrain: z.array(z.string()).optional(),
  fuel: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  seats: z.number().int().optional(),
  features: z.array(z.string()).optional(),
  sort: SortOptionSchema.optional(),
  search: z.string().optional(),
});

type Filters = z.infer<typeof FiltersSchema>;

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  bodyStyle: string;
  seats?: number;
  color: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  mpgCity?: number;
  mpgHighway?: number;
  features: string[];
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const query = req.query;

    // Parse query params
    const rawFilters: Record<string, unknown> = {};

    if (query.maxPrice) rawFilters.maxPrice = Number(query.maxPrice);
    if (query.minPrice) rawFilters.minPrice = Number(query.minPrice);
    if (query.minYear) rawFilters.minYear = Number(query.minYear);
    if (query.maxYear) rawFilters.maxYear = Number(query.maxYear);
    if (query.maxMiles) rawFilters.maxMiles = Number(query.maxMiles);
    if (query.minMiles) rawFilters.minMiles = Number(query.minMiles);
    if (query.seats) rawFilters.seats = Number(query.seats);
    if (query.sort) rawFilters.sort = query.sort;
    if (query.search) rawFilters.search = query.search;

    // Handle array params
    const arrayParams = ['make', 'model', 'bodyStyle', 'drivetrain', 'fuel', 'transmission', 'color', 'features'];
    for (const param of arrayParams) {
      if (query[param]) {
        const value = query[param];
        if (Array.isArray(value)) {
          rawFilters[param] = value.filter(v => typeof v === 'string');
        } else if (typeof value === 'string') {
          rawFilters[param] = [value];
        }
      }
    }

    const parseResult = FiltersSchema.safeParse(rawFilters);
    const filters: Filters = parseResult.success ? parseResult.data : {};

    // Build query conditions
    const conditions = [];

    // Price filters
    if (filters.maxPrice) {
      conditions.push(lte(vehicles.price, filters.maxPrice));
    }
    if (filters.minPrice) {
      conditions.push(gte(vehicles.price, filters.minPrice));
    }

    // Year filters
    if (filters.minYear) {
      conditions.push(gte(vehicles.year, filters.minYear));
    }
    if (filters.maxYear) {
      conditions.push(lte(vehicles.year, filters.maxYear));
    }

    // Mileage filters
    if (filters.maxMiles) {
      conditions.push(lte(vehicles.mileage, filters.maxMiles));
    }
    if (filters.minMiles) {
      conditions.push(gte(vehicles.mileage, filters.minMiles));
    }

    // Make filter
    if (filters.make && filters.make.length > 0) {
      const makeConditions = filters.make.map(m => ilike(vehicles.make, `%${m}%`));
      conditions.push(or(...makeConditions));
    }

    // Model filter
    if (filters.model && filters.model.length > 0) {
      const modelConditions = filters.model.map(m => ilike(vehicles.model, `%${m}%`));
      conditions.push(or(...modelConditions));
    }

    // Body style filter
    if (filters.bodyStyle && filters.bodyStyle.length > 0) {
      const bodyConditions = filters.bodyStyle.map(b => ilike(vehicles.bodyStyle, `%${b}%`));
      conditions.push(or(...bodyConditions));
    }

    // Drivetrain filter
    if (filters.drivetrain && filters.drivetrain.length > 0) {
      const driveConditions = filters.drivetrain.map(d => ilike(vehicles.drivetrain, `%${d}%`));
      conditions.push(or(...driveConditions));
    }

    // Fuel type filter
    if (filters.fuel && filters.fuel.length > 0) {
      const fuelConditions = filters.fuel.map(f => ilike(vehicles.fuelType, `%${f}%`));
      conditions.push(or(...fuelConditions));
    }

    // Transmission filter
    if (filters.transmission && filters.transmission.length > 0) {
      const transConditions = filters.transmission.map(t => ilike(vehicles.transmission, `%${t}%`));
      conditions.push(or(...transConditions));
    }

    // Color filter
    if (filters.color && filters.color.length > 0) {
      const colorConditions = filters.color.map(c => ilike(vehicles.color, `%${c}%`));
      conditions.push(or(...colorConditions));
    }

    // Seats filter
    if (filters.seats) {
      conditions.push(gte(vehicles.seats, filters.seats));
    }

    // Search filter (searches make, model, trim, description)
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(vehicles.make, searchTerm),
          ilike(vehicles.model, searchTerm),
          ilike(vehicles.trim, searchTerm),
          ilike(vehicles.description, searchTerm)
        )
      );
    }

    // Only show available vehicles
    conditions.push(eq(vehicles.isAvailable, true));

    // Build query with sorting
    let orderBy;
    switch (filters.sort) {
      case 'price_asc':
        orderBy = asc(vehicles.price);
        break;
      case 'price_desc':
        orderBy = desc(vehicles.price);
        break;
      case 'year_desc':
        orderBy = desc(vehicles.year);
        break;
      case 'miles_asc':
        orderBy = asc(vehicles.mileage);
        break;
      default:
        orderBy = desc(vehicles.createdAt);
    }

    const results = await db
      .select()
      .from(vehicles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy);

    // Transform to Vehicle type
    const vehicleList: Vehicle[] = results.map(v => ({
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

    return res.status(200).json(vehicleList);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({
      error: 'Failed to fetch vehicles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
