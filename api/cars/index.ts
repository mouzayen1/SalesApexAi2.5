import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db';

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
    const sql = getDb();

    // Simple query to get all cars
    const cars = await sql`SELECT * FROM cars ORDER BY id`;

    return res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);

    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      error: 'Failed to fetch cars',
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
}
