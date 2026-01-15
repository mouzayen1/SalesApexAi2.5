import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, vehicles } from '../_lib/db';
import { eq, and, gte, lte, ilike, or, asc, desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
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
    // Parse query parameters for filtering
    const {
      maxPrice,
      minPrice,
      minYear,
      maxYear,
      maxMiles,
      minMiles,
      make,
      bodyStyle,
      drivetrain,
      fuel,
      transmission,
      color,
      search,
      sort
    } = req.query;

    // Build query conditions
    const conditions = [];

    // Price filters
    if (maxPrice) {
      conditions.push(lte(vehicles.price, Number(maxPrice)));
    }
    if (minPrice) {
      conditions.push(gte(vehicles.price, Number(minPrice)));
    }

    // Year filters
    if (minYear) {
      conditions.push(gte(vehicles.year, Number(minYear)));
    }
    if (maxYear) {
      conditions.push(lte(vehicles.year, Number(maxYear)));
    }

    // Mileage filters
    if (maxMiles) {
      conditions.push(lte(vehicles.mileage, Number(maxMiles)));
    }
    if (minMiles) {
      conditions.push(gte(vehicles.mileage, Number(minMiles)));
    }

    // Make filter
    if (make) {
      const makes = Array.isArray(make) ? make : [make];
      const makeConditions = makes.map(m =>
        ilike(vehicles.make, `%${m}%`)
      );
      if (makeConditions.length > 0) {
        conditions.push(or(...makeConditions));
      }
    }

    // Body style filter
    if (bodyStyle) {
      const styles = Array.isArray(bodyStyle) ? bodyStyle : [bodyStyle];
      const styleConditions = styles.map(s =>
        ilike(vehicles.bodyStyle, `%${s}%`)
      );
      if (styleConditions.length > 0) {
        conditions.push(or(...styleConditions));
      }
    }

    // Drivetrain filter
    if (drivetrain) {
      const drivetrains = Array.isArray(drivetrain) ? drivetrain : [drivetrain];
      const driveConditions = drivetrains.map(d =>
        ilike(vehicles.drivetrain, `%${d}%`)
      );
      if (driveConditions.length > 0) {
        conditions.push(or(...driveConditions));
      }
    }

    // Fuel type filter
    if (fuel) {
      const fuels = Array.isArray(fuel) ? fuel : [fuel];
      const fuelConditions = fuels.map(f =>
        ilike(vehicles.fuelType, `%${f}%`)
      );
      if (fuelConditions.length > 0) {
        conditions.push(or(...fuelConditions));
      }
    }

    // Transmission filter
    if (transmission) {
      const transmissions = Array.isArray(transmission) ? transmission : [transmission];
      const transConditions = transmissions.map(t =>
        ilike(vehicles.transmission, `%${t}%`)
      );
      if (transConditions.length > 0) {
        conditions.push(or(...transConditions));
      }
    }

    // Color filter
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      const colorConditions = colors.map(c =>
        ilike(vehicles.color, `%${c}%`)
      );
      if (colorConditions.length > 0) {
        conditions.push(or(...colorConditions));
      }
    }

    // Search filter (searches make, model, trim, description)
    if (search && typeof search === 'string') {
      const searchTerm = `%${search}%`;
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
    switch (sort) {
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

    // Transform to clean Vehicle type
    const vehicleList = results.map(v => ({
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
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
}
