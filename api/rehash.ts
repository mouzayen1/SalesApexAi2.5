import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// VSC Tier
const VSCTierSchema = z.enum(['basic', 'standard', 'premium']);

// DealInput Schema
const DealInputSchema = z.object({
  vehicleId: z.string().optional(),
  vehicleYear: z.number().int().min(1990).max(2100),
  vehicleMake: z.string(),
  vehicleModel: z.string().optional(),
  vehicleMileage: z.number().int().min(0),
  vehicleRetailPrice: z.number().positive(),
  vehicleCost: z.number().positive(),
  state: z.string().length(2).toUpperCase(),
  customerFico: z.number().int().min(300).max(850),
  monthlyIncome: z.number().positive(),
  downPayment: z.number().min(0).default(0),
  tradeAllowance: z.number().min(0).default(0),
  tradePayoff: z.number().min(0).default(0),
  targetPayment: z.number().positive(),
  paymentTolerance: z.number().min(0).default(50),
  gapInsuranceSelected: z.boolean().default(false),
  vscSelected: z.boolean().default(false),
  vscTier: VSCTierSchema.default('standard'),
  dealerTier: z.number().int().min(1).max(5).default(3),
  monthlyDebt: z.number().min(0).optional(),
});

type DealInput = z.infer<typeof DealInputSchema>;
type VSCTier = z.infer<typeof VSCTierSchema>;

// Lender configurations
const lenders = {
  westlake: {
    id: 'westlake' as const,
    name: 'Westlake Financial',
    programs: [
      { name: 'Standard', minFico: 500, maxFico: 850, baseApr: 18.99, terms: [48, 60, 72], maxLtv: 140, ptiCap: 20 },
      { name: 'Subprime', minFico: 400, maxFico: 550, baseApr: 24.99, terms: [36, 48, 60], maxLtv: 125, ptiCap: 18 },
    ],
    advanceMultiplier: 1.1,
    originationFee: 595,
    acquisitionFee: 0,
    holdback: 0,
  },
  western: {
    id: 'western' as const,
    name: 'Western Funding',
    programs: [
      { name: 'Prime', minFico: 600, maxFico: 850, baseApr: 12.99, terms: [48, 60, 72, 84], maxLtv: 150, ptiCap: 22 },
      { name: 'Near Prime', minFico: 550, maxFico: 620, baseApr: 16.99, terms: [48, 60, 72], maxLtv: 135, ptiCap: 20 },
    ],
    advanceMultiplier: 1.15,
    originationFee: 495,
    acquisitionFee: 150,
    holdback: 200,
  },
  uac: {
    id: 'uac' as const,
    name: 'United Auto Credit',
    programs: [
      { name: 'Standard', minFico: 450, maxFico: 850, baseApr: 21.99, terms: [36, 48, 60], maxLtv: 130, ptiCap: 18 },
      { name: 'Deep Subprime', minFico: 350, maxFico: 500, baseApr: 28.99, terms: [24, 36, 48], maxLtv: 110, ptiCap: 15 },
    ],
    advanceMultiplier: 1.05,
    originationFee: 695,
    acquisitionFee: 0,
    holdback: 100,
  },
};

// State tax rates
const stateTaxRates: Record<string, number> = {
  AL: 4.0, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35, DE: 0, FL: 6.0, GA: 4.0,
  HI: 4.0, ID: 6.0, IL: 6.25, IN: 7.0, IA: 6.0, KS: 6.5, KY: 6.0, LA: 4.45, ME: 5.5, MD: 6.0,
  MA: 6.25, MI: 6.0, MN: 6.875, MS: 7.0, MO: 4.225, MT: 0, NE: 5.5, NV: 6.85, NH: 0, NJ: 6.625,
  NM: 5.125, NY: 8.0, NC: 4.75, ND: 5.0, OH: 5.75, OK: 4.5, OR: 0, PA: 6.0, RI: 7.0, SC: 6.0,
  SD: 4.5, TN: 7.0, TX: 6.25, UT: 5.95, VT: 6.0, VA: 5.3, WA: 6.5, WV: 6.0, WI: 5.0, WY: 4.0,
  DC: 6.0,
};

// VSC pricing
const vscPricing: Record<VSCTier, { cost: number; price: number }> = {
  basic: { cost: 400, price: 1295 },
  standard: { cost: 600, price: 1795 },
  premium: { cost: 900, price: 2495 },
};

// GAP pricing
const gapPricing = { cost: 150, price: 795 };

// Doc fee by state
const docFeeByState: Record<string, number> = {
  CA: 85, FL: 699, TX: 150, NY: 175, default: 499,
};

function getDocFee(state: string): number {
  return docFeeByState[state] || docFeeByState.default;
}

function getBookValue(retailPrice: number, mileage: number, year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const mileageDepreciation = mileage * 0.05;
  const ageDepreciation = age * 500;
  return Math.max(retailPrice * 0.6, retailPrice - mileageDepreciation - ageDepreciation);
}

function getVehicleRiskMultiplier(mileage: number, year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  let multiplier = 1.0;
  if (mileage > 100000) multiplier += 0.1;
  if (mileage > 150000) multiplier += 0.15;
  if (age > 10) multiplier += 0.1;
  if (age > 15) multiplier += 0.15;
  return multiplier;
}

function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
}

interface DealCandidate {
  id: string;
  lenderId: 'westlake' | 'western' | 'uac';
  lenderName: string;
  programName: string;
  term: number;
  apr: number;
  aprPercent: number;
  amountFinanced: number;
  monthlyPayment: number;
  bookValue: number;
  ltv: number;
  ltvCap: number;
  advanceGross: number;
  advanceNet: number;
  advanceMultiplier: number;
  netCheckToDealer: number;
  dealerFrontGross: number;
  dealerBackendGross: number;
  dealerReserve: number;
  totalDealerProfit: number;
  ptiPercent: number;
  ptiValid: boolean;
  ptiCap: number;
  dtiPercent?: number;
  dtiValid: boolean;
  approved: boolean;
  approvalProbability: number;
  rejectionReasons: string[];
  docFee: number;
  registrationFee: number;
  deliveryFee: number;
  gapPrice: number;
  vscPrice: number;
  tax: number;
  taxRate: number;
  originationFee: number;
  acquisitionFee: number;
  holdback: number;
  vehicleRiskMultiplier: number;
  riskScore?: number;
}

function runRehash(input: DealInput): {
  deals: DealCandidate[];
  bestDeal: DealCandidate | null;
  triage: { mode: 'profit' | 'survival'; bestDealId: string | null; reason: string; badge: string };
  bookValue: number;
  totalDown: number;
  tradeEquity: number;
} {
  const taxRate = (stateTaxRates[input.state] || 6.0) / 100;
  const docFee = getDocFee(input.state);
  const registrationFee = 250;
  const deliveryFee = 0;

  const bookValue = getBookValue(input.vehicleRetailPrice, input.vehicleMileage, input.vehicleYear);
  const vehicleRiskMultiplier = getVehicleRiskMultiplier(input.vehicleMileage, input.vehicleYear);
  const tradeEquity = Math.max(0, input.tradeAllowance - input.tradePayoff);
  const totalDown = input.downPayment + tradeEquity;

  const gapPrice = input.gapInsuranceSelected ? gapPricing.price : 0;
  const vscPrice = input.vscSelected ? vscPricing[input.vscTier].price : 0;
  const gapCost = input.gapInsuranceSelected ? gapPricing.cost : 0;
  const vscCost = input.vscSelected ? vscPricing[input.vscTier].cost : 0;

  const taxableAmount = input.vehicleRetailPrice + docFee + gapPrice + vscPrice;
  const tax = taxableAmount * taxRate;

  const frontGross = input.vehicleRetailPrice - input.vehicleCost;
  const backendGross = (gapPrice - gapCost) + (vscPrice - vscCost);

  const deals: DealCandidate[] = [];

  for (const [lenderId, lender] of Object.entries(lenders)) {
    for (const program of lender.programs) {
      if (input.customerFico < program.minFico || input.customerFico > program.maxFico) {
        continue;
      }

      for (const term of program.terms) {
        const ficoAdjustment = (700 - input.customerFico) * 0.02;
        const adjustedApr = Math.max(0, program.baseApr + ficoAdjustment);

        const amountFinanced =
          input.vehicleRetailPrice +
          docFee +
          registrationFee +
          deliveryFee +
          gapPrice +
          vscPrice +
          tax +
          lender.originationFee +
          lender.acquisitionFee -
          totalDown;

        const monthlyPayment = calculateMonthlyPayment(amountFinanced, adjustedApr, term);
        const ltv = (amountFinanced / bookValue) * 100;
        const pti = (monthlyPayment / input.monthlyIncome) * 100;

        const advanceGross = bookValue * lender.advanceMultiplier;
        const advanceNet = advanceGross - lender.originationFee - lender.acquisitionFee;

        const dealerReserve = amountFinanced * 0.02;
        const netCheck = advanceNet - input.vehicleCost + totalDown;
        const totalProfit = frontGross + backendGross + dealerReserve;

        const rejectionReasons: string[] = [];
        if (ltv > program.maxLtv) {
          rejectionReasons.push(`LTV ${ltv.toFixed(1)}% exceeds cap of ${program.maxLtv}%`);
        }
        if (pti > program.ptiCap) {
          rejectionReasons.push(`PTI ${pti.toFixed(1)}% exceeds cap of ${program.ptiCap}%`);
        }

        const approved = rejectionReasons.length === 0;
        let approvalProb = approved ? 0.85 : 0.15;
        if (input.customerFico >= 650) approvalProb += 0.1;
        if (ltv < 100) approvalProb += 0.05;

        deals.push({
          id: `${lenderId}-${program.name.toLowerCase().replace(/\s+/g, '-')}-${term}`,
          lenderId: lenderId as 'westlake' | 'western' | 'uac',
          lenderName: lender.name,
          programName: program.name,
          term,
          apr: adjustedApr / 100,
          aprPercent: adjustedApr,
          amountFinanced,
          monthlyPayment,
          bookValue,
          ltv,
          ltvCap: program.maxLtv,
          advanceGross,
          advanceNet,
          advanceMultiplier: lender.advanceMultiplier,
          netCheckToDealer: netCheck,
          dealerFrontGross: frontGross,
          dealerBackendGross: backendGross,
          dealerReserve,
          totalDealerProfit: totalProfit,
          ptiPercent: pti,
          ptiValid: pti <= program.ptiCap,
          ptiCap: program.ptiCap,
          dtiValid: true,
          approved,
          approvalProbability: Math.min(0.95, approvalProb),
          rejectionReasons,
          docFee,
          registrationFee,
          deliveryFee,
          gapPrice,
          vscPrice,
          tax,
          taxRate: taxRate * 100,
          originationFee: lender.originationFee,
          acquisitionFee: lender.acquisitionFee,
          holdback: lender.holdback,
          vehicleRiskMultiplier,
        });
      }
    }
  }

  // Sort deals: approved first, then by profit
  deals.sort((a, b) => {
    if (a.approved !== b.approved) return a.approved ? -1 : 1;
    return b.totalDealerProfit - a.totalDealerProfit;
  });

  const approvedDeals = deals.filter(d => d.approved);
  const bestDeal = approvedDeals.length > 0 ? approvedDeals[0] : null;

  // Triage logic
  let triage: { mode: 'profit' | 'survival'; bestDealId: string | null; reason: string; badge: string };
  const profitDeals = approvedDeals.filter(d =>
    d.monthlyPayment <= input.targetPayment + input.paymentTolerance &&
    d.totalDealerProfit >= 1500
  );

  if (profitDeals.length > 0) {
    triage = {
      mode: 'profit',
      bestDealId: profitDeals[0].id,
      reason: `${profitDeals.length} profitable deal(s) within payment target`,
      badge: '💰 Profit Mode',
    };
  } else if (approvedDeals.length > 0) {
    triage = {
      mode: 'survival',
      bestDealId: approvedDeals[0].id,
      reason: 'Deals available but may not meet profit or payment targets',
      badge: '⚠️ Survival Mode',
    };
  } else {
    triage = {
      mode: 'survival',
      bestDealId: null,
      reason: 'No approved deals available - consider restructuring',
      badge: '❌ No Deals',
    };
  }

  return {
    deals,
    bestDeal,
    triage,
    bookValue,
    totalDown,
    tradeEquity,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = DealInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid deal input',
        details: parseResult.error.errors,
      });
    }

    const dealInput = parseResult.data;
    const result = runRehash(dealInput);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error running rehash:', error);
    return res.status(500).json({
      error: 'Failed to run rehash calculations',
    });
  }
}
