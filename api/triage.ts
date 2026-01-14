import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Schemas
const LenderIdSchema = z.enum(['westlake', 'western', 'uac']);

const DealCandidateSchema = z.object({
  id: z.string(),
  lenderId: LenderIdSchema,
  lenderName: z.string(),
  programName: z.string(),
  term: z.number().int(),
  apr: z.number(),
  aprPercent: z.number(),
  amountFinanced: z.number(),
  monthlyPayment: z.number(),
  bookValue: z.number(),
  ltv: z.number(),
  ltvCap: z.number(),
  advanceGross: z.number(),
  advanceNet: z.number(),
  advanceMultiplier: z.number(),
  netCheckToDealer: z.number(),
  dealerFrontGross: z.number(),
  dealerBackendGross: z.number(),
  dealerReserve: z.number(),
  totalDealerProfit: z.number(),
  ptiPercent: z.number(),
  ptiValid: z.boolean(),
  ptiCap: z.number(),
  dtiPercent: z.number().optional(),
  dtiValid: z.boolean(),
  approved: z.boolean(),
  approvalProbability: z.number(),
  rejectionReasons: z.array(z.string()),
  docFee: z.number(),
  registrationFee: z.number(),
  deliveryFee: z.number(),
  gapPrice: z.number(),
  vscPrice: z.number(),
  tax: z.number(),
  taxRate: z.number(),
  originationFee: z.number(),
  acquisitionFee: z.number(),
  holdback: z.number(),
  vehicleRiskMultiplier: z.number(),
  riskScore: z.number().optional(),
});

const TriageRequestSchema = z.object({
  validDeals: z.array(DealCandidateSchema),
  targetPayment: z.number(),
  mandatoryProducts: z.array(z.string()).default([]),
});

type DealCandidate = z.infer<typeof DealCandidateSchema>;

interface TriageResponse {
  mode: 'profit' | 'survival';
  bestDealId: string | null;
  reason: string;
  badge: string;
}

function triageDeals(
  validDeals: DealCandidate[],
  targetPayment: number,
  _mandatoryProducts: string[] = []
): TriageResponse {
  if (validDeals.length === 0) {
    return {
      mode: 'survival',
      bestDealId: null,
      reason: 'No valid deals available',
      badge: '❌ No Deals',
    };
  }

  // Filter for approved deals
  const approvedDeals = validDeals.filter(d => d.approved);

  if (approvedDeals.length === 0) {
    return {
      mode: 'survival',
      bestDealId: validDeals[0]?.id || null,
      reason: 'No approved deals - restructuring needed',
      badge: '⚠️ Restructure',
    };
  }

  // Check for profit mode deals (within payment target and good profit)
  const profitDeals = approvedDeals.filter(d =>
    d.monthlyPayment <= targetPayment * 1.1 && // Within 10% of target
    d.totalDealerProfit >= 1500
  );

  if (profitDeals.length > 0) {
    // Sort by profit descending
    profitDeals.sort((a, b) => b.totalDealerProfit - a.totalDealerProfit);
    return {
      mode: 'profit',
      bestDealId: profitDeals[0].id,
      reason: `${profitDeals.length} profitable deal(s) within payment target`,
      badge: '💰 Profit Mode',
    };
  }

  // Survival mode - find deal closest to target payment
  const sortedByPayment = [...approvedDeals].sort(
    (a, b) => Math.abs(a.monthlyPayment - targetPayment) - Math.abs(b.monthlyPayment - targetPayment)
  );

  return {
    mode: 'survival',
    bestDealId: sortedByPayment[0].id,
    reason: 'Approved deals available but may not meet profit targets',
    badge: '⚠️ Survival Mode',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        badge: '❌ Error',
      });
    }

    const { validDeals, targetPayment, mandatoryProducts } = parseResult.data;

    // Use the triage function
    const result = triageDeals(validDeals, targetPayment, mandatoryProducts);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error triaging deals:', error);
    return res.status(500).json({
      mode: 'survival',
      bestDealId: null,
      reason: 'An error occurred during triage',
      badge: '❌ Error',
    });
  }
}
