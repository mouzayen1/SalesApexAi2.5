import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    const results = await db
      .select()
      .from(schema.vehicles)
      .where(eq(schema.vehicles.id, id))
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
    return res.status(500).json({
      error: 'Failed to fetch vehicle',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
