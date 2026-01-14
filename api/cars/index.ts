import type { VercelRequest, VercelResponse } from '@vercel/node';
import { staticVehicles, type Vehicle } from '../data/vehicles';

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

/**
 * Filter and sort vehicles based on query parameters.
 * Works entirely in-memory with the static dataset.
 */
function filterVehicles(vehicles: Vehicle[], filters: Filters): Vehicle[] {
  let result = vehicles.filter(v => v.isAvailable !== false);

  // Price filters
  if (filters.minPrice !== undefined) {
    result = result.filter(v => v.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter(v => v.price <= filters.maxPrice!);
  }

  // Year filters
  if (filters.minYear !== undefined) {
    result = result.filter(v => v.year >= filters.minYear!);
  }
  if (filters.maxYear !== undefined) {
    result = result.filter(v => v.year <= filters.maxYear!);
  }

  // Mileage filters
  if (filters.minMiles !== undefined) {
    result = result.filter(v => v.mileage >= filters.minMiles!);
  }
  if (filters.maxMiles !== undefined) {
    result = result.filter(v => v.mileage <= filters.maxMiles!);
  }

  // Seats filter
  if (filters.seats !== undefined) {
    result = result.filter(v => (v.seats ?? 5) >= filters.seats!);
  }

  // Make filter (case-insensitive partial match)
  if (filters.make && filters.make.length > 0) {
    const makes = filters.make.map(m => m.toLowerCase());
    result = result.filter(v =>
      makes.some(m => v.make.toLowerCase().includes(m))
    );
  }

  // Model filter
  if (filters.model && filters.model.length > 0) {
    const models = filters.model.map(m => m.toLowerCase());
    result = result.filter(v =>
      models.some(m => v.model.toLowerCase().includes(m))
    );
  }

  // Body style filter
  if (filters.bodyStyle && filters.bodyStyle.length > 0) {
    const styles = filters.bodyStyle.map(b => b.toLowerCase());
    result = result.filter(v =>
      styles.some(b => v.bodyStyle.toLowerCase().includes(b))
    );
  }

  // Drivetrain filter
  if (filters.drivetrain && filters.drivetrain.length > 0) {
    const drives = filters.drivetrain.map(d => d.toLowerCase());
    result = result.filter(v =>
      drives.some(d => v.drivetrain.toLowerCase().includes(d))
    );
  }

  // Fuel type filter
  if (filters.fuel && filters.fuel.length > 0) {
    const fuels = filters.fuel.map(f => f.toLowerCase());
    result = result.filter(v =>
      fuels.some(f => v.fuelType.toLowerCase().includes(f))
    );
  }

  // Transmission filter
  if (filters.transmission && filters.transmission.length > 0) {
    const trans = filters.transmission.map(t => t.toLowerCase());
    result = result.filter(v =>
      trans.some(t => v.transmission.toLowerCase().includes(t))
    );
  }

  // Color filter
  if (filters.color && filters.color.length > 0) {
    const colors = filters.color.map(c => c.toLowerCase());
    result = result.filter(v =>
      colors.some(c => v.color.toLowerCase().includes(c))
    );
  }

  // Search filter (searches make, model, trim, description)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(v =>
      v.make.toLowerCase().includes(searchTerm) ||
      v.model.toLowerCase().includes(searchTerm) ||
      (v.trim?.toLowerCase().includes(searchTerm) ?? false) ||
      (v.description?.toLowerCase().includes(searchTerm) ?? false)
    );
  }

  // Sorting
  switch (filters.sort) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'year_desc':
      result.sort((a, b) => b.year - a.year);
      break;
    case 'miles_asc':
      result.sort((a, b) => a.mileage - b.mileage);
      break;
    default:
      // Default: newest first
      result.sort((a, b) => b.year - a.year);
  }

  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse query params into filters
    const filters: Filters = {};

    if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
    if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
    if (req.query.minYear) filters.minYear = Number(req.query.minYear);
    if (req.query.maxYear) filters.maxYear = Number(req.query.maxYear);
    if (req.query.maxMiles) filters.maxMiles = Number(req.query.maxMiles);
    if (req.query.minMiles) filters.minMiles = Number(req.query.minMiles);
    if (req.query.seats) filters.seats = Number(req.query.seats);
    if (req.query.sort) filters.sort = String(req.query.sort);
    if (req.query.search) filters.search = String(req.query.search);

    // Handle array params
    const arrayParams = ['make', 'model', 'bodyStyle', 'drivetrain', 'fuel', 'transmission', 'color'] as const;
    for (const param of arrayParams) {
      if (req.query[param]) {
        const value = req.query[param];
        if (Array.isArray(value)) {
          filters[param] = value.filter((v): v is string => typeof v === 'string');
        } else if (typeof value === 'string') {
          filters[param] = [value];
        }
      }
    }

    // Use static vehicles data - no database needed
    const vehicles = filterVehicles(staticVehicles, filters);

    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Even on error, return empty array instead of 500
    // This ensures the UI never breaks
    return res.status(200).json([]);
  }
}
