import { Router, Request, Response } from 'express';
import { DealInputSchema, runRehash, type RehashResult } from '@salesapexai/shared';

const router = Router();

// POST /api/rehash
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parseResult = DealInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid deal input',
        details: parseResult.error.errors,
      });
    }

    const dealInput = parseResult.data;

    // Run rehash calculations
    const result: RehashResult = runRehash(dealInput);

    res.json(result);
  } catch (error) {
    console.error('Error running rehash:', error);
    res.status(500).json({
      error: 'Failed to run rehash calculations',
    });
  }
});

export default router;
