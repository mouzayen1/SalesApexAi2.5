import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TriageRequestSchema, triageDeals, type TriageResponse } from '../shared/src';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const parseResult = TriageRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        mode: 'survival',
        bestDealId: null,
        reason: 'Invalid request data',
        badge: 'Error',
      } satisfies TriageResponse);
    }

    const { validDeals, targetPayment, mandatoryProducts } = parseResult.data;

    // Use the shared triage function
    const result = triageDeals(validDeals, targetPayment, mandatoryProducts);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error triaging deals:', error);
    return res.status(500).json({
      mode: 'survival',
      bestDealId: null,
      reason: 'An error occurred during triage',
      badge: 'Error',
    } satisfies TriageResponse);
  }
}
