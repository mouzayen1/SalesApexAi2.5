import { z } from 'zod';

// Vehicle (inventory record)
export const VehicleSchema = z.object({
  id: z.string(),
  year: z.number().int().min(1900).max(2100),
  make: z.string(),
  model: z.string(),
  trim: z.string().optional(),
  price: z.number().positive(),
  mileage: z.number().int().min(0),
  bodyStyle: z.string(),
  seats: z.number().int().min(1).max(12).optional(),
  color: z.string(),
  fuelType: z.string(),
  transmission: z.string(),
  drivetrain: z.string(),
  mpgCity: z.number().int().optional(),
  mpgHighway: z.number().int().optional(),
  features: z.array(z.string()).default([]),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

// Filters (inventory filtering)
export const SortOptionSchema = z.enum(['price_asc', 'price_desc', 'year_desc', 'miles_asc']);
export type SortOption = z.infer<typeof SortOptionSchema>;

export const FiltersSchema = z.object({
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  minYear: z.number().int().optional(),
  maxYear: z.number().int().optional(),
  maxMiles: z.number().int().optional(),
  minMiles: z.number().int().optional(),
  make: z.array(z.string()).optional(),
  model: z.array(z.string()).optional(),
  bodyStyle: z.array(z.string()).optional(),
  drivetrain: z.array(z.string()).optional(),
  fuel: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  seats: z.number().int().optional(),
  features: z.array(z.string()).optional(),
  sort: SortOptionSchema.optional(),
  search: z.string().optional(),
});

export type Filters = z.infer<typeof FiltersSchema>;

// VSC Tier
export const VSCTierSchema = z.enum(['basic', 'standard', 'premium']);
export type VSCTier = z.infer<typeof VSCTierSchema>;

// DealInput (Rehash input)
export const DealInputSchema = z.object({
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

export type DealInput = z.infer<typeof DealInputSchema>;

// Lender type
export const LenderIdSchema = z.enum(['westlake', 'western', 'uac']);
export type LenderId = z.infer<typeof LenderIdSchema>;

// DealCandidate (Rehash output)
export const DealCandidateSchema = z.object({
  id: z.string(),
  lenderId: LenderIdSchema,
  lenderName: z.string(),
  programName: z.string(),
  term: z.number().int(),
  apr: z.number(),
  aprPercent: z.number(),

  // Core financials
  amountFinanced: z.number(),
  monthlyPayment: z.number(),
  bookValue: z.number(),
  ltv: z.number(),
  ltvCap: z.number(),

  // Advance
  advanceGross: z.number(),
  advanceNet: z.number(),
  advanceMultiplier: z.number(),

  // Dealer profit
  netCheckToDealer: z.number(),
  dealerFrontGross: z.number(),
  dealerBackendGross: z.number(),
  dealerReserve: z.number(),
  totalDealerProfit: z.number(),

  // Validation
  ptiPercent: z.number(),
  ptiValid: z.boolean(),
  ptiCap: z.number(),
  dtiPercent: z.number().optional(),
  dtiValid: z.boolean(),

  // Approval
  approved: z.boolean(),
  approvalProbability: z.number(),
  rejectionReasons: z.array(z.string()),

  // Fee breakdown
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

  // Risk
  vehicleRiskMultiplier: z.number(),
  riskScore: z.number().optional(),
});

export type DealCandidate = z.infer<typeof DealCandidateSchema>;

// Rehash result
export const RehashResultSchema = z.object({
  deals: z.array(DealCandidateSchema),
  bestDeal: DealCandidateSchema.nullable(),
  triage: z.object({
    mode: z.enum(['profit', 'survival']),
    bestDealId: z.string().nullable(),
    reason: z.string(),
    badge: z.string(),
  }),
  bookValue: z.number(),
  totalDown: z.number(),
  tradeEquity: z.number(),
});

export type RehashResult = z.infer<typeof RehashResultSchema>;

// API Schemas
export const AnalyzeDealRequestSchema = z.object({
  dealInput: DealInputSchema,
  dealCandidates: z.array(DealCandidateSchema),
  selectedCandidateId: z.string().optional(),
});

export type AnalyzeDealRequest = z.infer<typeof AnalyzeDealRequestSchema>;

export const AnalyzeDealResponseSchema = z.object({
  status: z.enum(['good', 'difficult', 'impossible', 'error']),
  analysis: z.string(),
  strategy: z.string(),
});

export type AnalyzeDealResponse = z.infer<typeof AnalyzeDealResponseSchema>;

export const TriageRequestSchema = z.object({
  validDeals: z.array(DealCandidateSchema),
  targetPayment: z.number(),
  mandatoryProducts: z.array(z.string()).default([]),
});

export type TriageRequest = z.infer<typeof TriageRequestSchema>;

export const TriageResponseSchema = z.object({
  mode: z.enum(['profit', 'survival']),
  bestDealId: z.string().nullable(),
  reason: z.string(),
  badge: z.string(),
});

export type TriageResponse = z.infer<typeof TriageResponseSchema>;

// Payment calculator input
export const PaymentCalculatorInputSchema = z.object({
  price: z.number().positive(),
  downPayment: z.number().min(0).default(0),
  apr: z.number().min(0).max(100).default(7),
  termMonths: z.number().int().positive().default(60),
});

export type PaymentCalculatorInput = z.infer<typeof PaymentCalculatorInputSchema>;
