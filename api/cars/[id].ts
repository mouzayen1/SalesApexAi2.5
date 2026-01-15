import type { VercelRequest, VercelResponse } from '@vercel/node';
const { getDb } = require('../_lib/db');

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
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
      return res.status(400).json({ error: 'Car ID is required' });
    }

    const sql = getDb();

    const cars = await sql`SELECT * FROM cars WHERE id = ${id} LIMIT 1`;

    if (cars.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    return res.status(200).json(cars[0]);
  } catch (error) {
    console.error('Error fetching car:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      error: 'Failed to fetch car',
      message: errorMessage
    });
  }
};
