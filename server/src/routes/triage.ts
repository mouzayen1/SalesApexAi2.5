import { Router, Request, Response } from 'express';
import { TriageRequestSchema, triageDeals, type TriageResponse } from '@salesapexai/shared';

const router = Router();

// POST /api/triage
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parseResult = TriageRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        mode: 'survival',
        bestDealId: null,
        reason: 'Invalid request data',
        badge: '❌ Error',
      } satisfies TriageResponse);
    }

    const { validDeals, targetPayment, mandatoryProducts } = parseResult.data;

    // Use the shared triage function
    const result = triageDeals(validDeals, targetPayment, mandatoryProducts);

    res.json(result);
  } catch (error) {
    console.error('Error triaging deals:', error);
    res.status(500).json({
      mode: 'survival',
      bestDealId: null,
      reason: 'An error occurred during triage',
      badge: '❌ Error',
    } satisfies TriageResponse);
  }
});

export default router;
