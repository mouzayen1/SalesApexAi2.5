import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, vehicles } from '../_lib/db';
import { eq } from 'drizzle-orm';

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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Vehicle ID is required' });
    }

    const results = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id))
      .limit(1);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const v = results[0];
    const vehicle = {
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
    };

    return res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
}
