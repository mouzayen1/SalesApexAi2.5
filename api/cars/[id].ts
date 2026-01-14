import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import vehicles from index (they share the same data)
// For Vercel serverless, we inline a minimal lookup
const vehicleIds = new Map([
  ['v-toyota-camry-2022-se', { id: 'v-toyota-camry-2022-se', year: 2022, make: 'Toyota', model: 'Camry', trim: 'SE', price: 26500, mileage: 28000, bodyStyle: 'Sedan', seats: 5, color: 'White', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD', features: ['Bluetooth', 'Backup Camera'], description: 'Well-maintained Toyota Camry SE', imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', isAvailable: true }],
  ['v-toyota-rav4-2021-xle', { id: 'v-toyota-rav4-2021-xle', year: 2021, make: 'Toyota', model: 'RAV4', trim: 'XLE', price: 32000, mileage: 35000, bodyStyle: 'SUV', seats: 5, color: 'Blue', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD', features: ['Sunroof', 'Heated Seats'], description: 'Popular RAV4 XLE AWD', imageUrl: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800', isAvailable: true }],
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    // For single vehicle lookup, we return from the list endpoint
    // This endpoint exists for API completeness but redirects to main list
    const vehicle = vehicleIds.get(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    return res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
}
