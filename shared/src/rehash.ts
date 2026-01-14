import type { DealInput, DealCandidate, RehashResult, LenderId, VSCTier } from './types';
import {
  AGE_FACTORS,
  MAKE_MULTIPLIERS,
  STATE_TAX_RATES,
  STATE_FEES,
  STATE_APR_CAPS,
  STATE_DOC_FEE_CAPS,
  PRODUCT_PRICING_2026,
  VEHICLE_RISK_DATABASE,
  WESTLAKE_PROGRAMS,
  WESTERN_PROGRAMS,
  UAC_CONFIG,
  LENDER_NAMES,
} from './lenders';

// Utility to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Round to cents
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 7.2.1 Book Value (advanced depreciation model)
 */
export function calculateBookValue(
  vehicleRetailPrice: number,
  vehicleYear: number,
  vehicleMileage: number,
  vehicleMake: string,
  currentDate: Date = new Date()
): number {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const age = currentYear - vehicleYear;
  const annualMileageRate = vehicleMileage / Math.max(1, age);

  // Age factor
  const ageFactor = AGE_FACTORS[Math.min(10, age)] ?? 0.38;

  // Mileage multiplier
  let mileageMultiplier = 0.98;
  if (annualMileageRate > 18000) {
    mileageMultiplier = 0.92;
  } else if (annualMileageRate < 10000) {
    mileageMultiplier = 1.05;
  }

  // Make multiplier
  const normalizedMake = vehicleMake.toLowerCase().trim();
  const makeMultiplier = MAKE_MULTIPLIERS[normalizedMake] ?? 1.00;

  // Seasonal multiplier (June, July, August = months 5, 6, 7 in 0-indexed)
  let seasonalMultiplier = 0.98;
  if (currentMonth >= 5 && currentMonth <= 7) {
    seasonalMultiplier = 1.02;
  }

  const bookValue = vehicleRetailPrice * ageFactor * mileageMultiplier * makeMultiplier * seasonalMultiplier;
  return roundToCents(bookValue);
}

/**
 * Get state fees with fallback
 */
export function getStateFees(state: string): { doc: number; registration: number; delivery: number } {
  return STATE_FEES[state.toUpperCase()] ?? { doc: 450, registration: 250, delivery: 300 };
}

/**
 * Get state tax rate with fallback
 */
export function getStateTaxRate(state: string): number {
  return STATE_TAX_RATES[state.toUpperCase()] ?? 0.07;
}

/**
 * Get state APR cap with fallback
 */
export function getStateAprCap(state: string): number {
  return STATE_APR_CAPS[state.toUpperCase()] ?? STATE_APR_CAPS.DEFAULT ?? 0.36;
}

/**
 * Get state doc fee cap with fallback
 */
export function getStateDocFeeCap(state: string): number {
  const stateFees = getStateFees(state);
  return STATE_DOC_FEE_CAPS[state.toUpperCase()] ?? STATE_DOC_FEE_CAPS.DEFAULT ?? stateFees.doc;
}

/**
 * Get product pricing for a lender
 */
export function getProductPricing(lenderId: LenderId): {
  gap: number;
  vsc_basic: number;
  vsc_standard: number;
  vsc_premium: number;
} {
  return PRODUCT_PRICING_2026[lenderId] ?? PRODUCT_PRICING_2026.westlake;
}

/**
 * Get acquisition fee by lender
 */
export function getAcquisitionFee(lenderId: LenderId): number {
  switch (lenderId) {
    case 'western':
      return 495;
    case 'uac':
      return 325;
    case 'westlake':
    default:
      return 0;
  }
}

/**
 * 7.2.2 Amount Financed (itemized by state + lender)
 */
export function calculateAmountFinanced(
  vehicleRetailPrice: number,
  state: string,
  lenderId: LenderId,
  downPayment: number,
  tradeAllowance: number,
  tradePayoff: number,
  gapInsuranceSelected: boolean,
  vscSelected: boolean,
  vscTier: VSCTier
): {
  amountFinanced: number;
  tax: number;
  taxRate: number;
  docFee: number;
  registrationFee: number;
  deliveryFee: number;
  gapPrice: number;
  vscPrice: number;
  acquisitionFee: number;
  tradeEquity: number;
  totalDown: number;
  gross: number;
} {
  const taxRate = getStateTaxRate(state);
  const tax = roundToCents(vehicleRetailPrice * taxRate);

  const stateFees = getStateFees(state);
  const docFeeCap = getStateDocFeeCap(state);
  const docFee = Math.min(stateFees.doc, docFeeCap);
  const registrationFee = stateFees.registration;
  const deliveryFee = stateFees.delivery;

  const pricing = getProductPricing(lenderId);
  const gapPrice = gapInsuranceSelected ? pricing.gap : 0;
  const vscKey = `vsc_${vscTier}` as keyof typeof pricing;
  const vscPrice = vscSelected ? pricing[vscKey] : 0;

  const acquisitionFee = getAcquisitionFee(lenderId);

  const gross = vehicleRetailPrice + tax + docFee + registrationFee + deliveryFee + gapPrice + vscPrice + acquisitionFee;

  const tradeEquity = Math.max(0, tradeAllowance - tradePayoff);
  const totalDown = downPayment + tradeEquity;

  const amountFinanced = roundToCents(gross - totalDown);

  return {
    amountFinanced,
    tax,
    taxRate,
    docFee,
    registrationFee,
    deliveryFee,
    gapPrice,
    vscPrice,
    acquisitionFee,
    tradeEquity,
    totalDown,
    gross,
  };
}

/**
 * 7.2.3 Dynamic APR
 */
export function calculateDynamicAPR(
  customerFico: number,
  ltv: number,
  totalDown: number,
  vehicleRetailPrice: number,
  lenderId: LenderId,
  state: string
): { aprPercent: number; aprDecimal: number } {
  // Base APR by FICO bands
  let baseApr: number;
  let ficoMin: number;

  if (customerFico >= 750) {
    baseApr = 6;
    ficoMin = 750;
  } else if (customerFico >= 650) {
    baseApr = 10;
    ficoMin = 650;
  } else if (customerFico >= 550) {
    baseApr = 18;
    ficoMin = 550;
  } else {
    baseApr = 24;
    ficoMin = 300;
  }

  // FICO micro-adjustment within band
  const ficoAdjustment = -((customerFico - ficoMin) / 100) * 2;

  // LTV adjustment
  let ltvAdjustment = 0;
  if (ltv > 140) {
    ltvAdjustment = 3;
  } else if (ltv > 120) {
    ltvAdjustment = 2;
  } else if (ltv > 100) {
    ltvAdjustment = 1;
  }

  // Down payment adjustment
  const downPercent = (totalDown / vehicleRetailPrice) * 100;
  let downAdjustment = 0;
  if (downPercent >= 20) {
    downAdjustment = -2;
  } else if (downPercent >= 10) {
    downAdjustment = -1;
  } else if (downPercent < 5) {
    downAdjustment = 1;
  }

  // Lender adjustment
  let lenderAdjustment = 0;
  switch (lenderId) {
    case 'western':
      lenderAdjustment = 0.5;
      break;
    case 'uac':
      lenderAdjustment = -0.25;
      break;
    case 'westlake':
    default:
      lenderAdjustment = 0;
  }

  const aprPercent = baseApr + ficoAdjustment + ltvAdjustment + downAdjustment + lenderAdjustment;
  let aprDecimal = aprPercent / 100;

  // State cap
  const stateCap = getStateAprCap(state);
  aprDecimal = Math.min(aprDecimal, stateCap);

  // Clamp final APR between 4% and 35%
  aprDecimal = clamp(aprDecimal, 0.04, 0.35);

  return {
    aprPercent: roundToCents(aprDecimal * 100),
    aprDecimal: roundToCents(aprDecimal * 10000) / 10000, // Round to 4 decimal places
  };
}

/**
 * 7.2.4 Payment (amortization)
 */
export function calculatePayment(
  amountFinanced: number,
  aprDecimal: number,
  termMonths: number
): number {
  if (aprDecimal === 0) {
    return roundToCents(amountFinanced / termMonths);
  }

  const monthlyRate = aprDecimal / 12;
  const payment = (amountFinanced * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  return roundToCents(payment);
}

/**
 * Simple payment calculator for inventory browsing
 */
export function calculateSimplePayment(
  price: number,
  downPayment: number,
  aprPercent: number,
  termMonths: number
): number {
  const principal = price - downPayment;
  if (principal <= 0) return 0;
  if (aprPercent === 0) return roundToCents(principal / termMonths);

  const monthlyRate = (aprPercent / 100) / 12;
  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  return roundToCents(payment);
}

/**
 * 7.2.5 Vehicle risk multiplier
 */
export function getVehicleRiskMultiplier(
  make: string,
  model: string | undefined,
  lenderName: string
): number {
  const normalizedMake = make.toLowerCase().trim();
  const normalizedModel = model?.toLowerCase().trim();
  const normalizedLender = lenderName.charAt(0).toUpperCase() + lenderName.slice(1).toLowerCase();

  // Try exact match first
  let entry = VEHICLE_RISK_DATABASE.find(
    (v) =>
      v.make.toLowerCase() === normalizedMake &&
      v.model.toLowerCase() === normalizedModel
  );

  // Try "Any" model for the make
  if (!entry) {
    entry = VEHICLE_RISK_DATABASE.find(
      (v) =>
        v.make.toLowerCase() === normalizedMake &&
        v.model.toLowerCase() === 'any'
    );
  }

  if (entry && entry.lenderAdjustments[normalizedLender]) {
    return entry.lenderAdjustments[normalizedLender]!;
  }

  return 1.0;
}

/**
 * Calculate dealer profit components
 */
function calculateDealerProfit(
  vehicleRetailPrice: number,
  vehicleCost: number,
  gapPrice: number,
  vscPrice: number,
  amountFinanced: number
): {
  dealerFrontGross: number;
  dealerBackendGross: number;
  dealerReserve: number;
  totalDealerProfit: number;
} {
  const dealerFrontGross = roundToCents(vehicleRetailPrice - vehicleCost);
  const dealerBackendGross = roundToCents((gapPrice + vscPrice) * 0.68);
  const dealerReserve = roundToCents((amountFinanced * 0.02) * 0.65);
  const totalDealerProfit = roundToCents(dealerFrontGross + dealerBackendGross + dealerReserve);

  return { dealerFrontGross, dealerBackendGross, dealerReserve, totalDealerProfit };
}

/**
 * Westlake lender evaluation
 */
function evaluateWestlake(
  input: DealInput,
  bookValue: number,
  currentDate: Date = new Date()
): DealCandidate | null {
  const currentYear = currentDate.getFullYear();
  const age = currentYear - input.vehicleYear;

  // Vehicle restrictions
  if (age > 18 || input.vehicleMileage > 180000) {
    return createDeclinedCandidate(
      'westlake',
      input,
      bookValue,
      age > 18 ? 'Vehicle too old (max 18 years)' : 'Vehicle mileage too high (max 180,000)'
    );
  }

  // Choose program based on FICO
  let program = WESTLAKE_PROGRAMS[2]; // Standard
  if (input.customerFico >= 680) {
    program = WESTLAKE_PROGRAMS[0]; // Platinum
  } else if (input.customerFico >= 620) {
    program = WESTLAKE_PROGRAMS[1]; // Gold
  }

  // Check additional program restrictions
  if (age > program.maxAge) {
    program = WESTLAKE_PROGRAMS.find(p => age <= p.maxAge) ?? WESTLAKE_PROGRAMS[2];
  }
  if (input.vehicleMileage > program.maxMiles) {
    program = WESTLAKE_PROGRAMS.find(p => input.vehicleMileage <= p.maxMiles) ?? WESTLAKE_PROGRAMS[2];
  }

  // Calculate amount financed
  const financials = calculateAmountFinanced(
    input.vehicleRetailPrice,
    input.state,
    'westlake',
    input.downPayment,
    input.tradeAllowance,
    input.tradePayoff,
    input.gapInsuranceSelected,
    input.vscSelected,
    input.vscTier
  );

  const ltv = (financials.amountFinanced / bookValue) * 100;

  // Calculate APR
  const apr = calculateDynamicAPR(
    input.customerFico,
    ltv,
    financials.totalDown,
    input.vehicleRetailPrice,
    'westlake',
    input.state
  );

  // Term is always 72 for Westlake
  const term = 72;

  // Calculate payment
  const monthlyPayment = calculatePayment(financials.amountFinanced, apr.aprDecimal, term);

  // PTI validation
  const ptiPercent = (monthlyPayment / input.monthlyIncome) * 100;
  const ptiCap = 18;
  const ptiValid = ptiPercent <= ptiCap;

  // DTI validation
  const monthlyDebt = input.monthlyDebt ?? 0;
  const dtiPercent = ((monthlyPayment + monthlyDebt) / input.monthlyIncome) * 100;
  const dtiValid = dtiPercent <= 50;

  // Advance calculation
  const advanceMultiplier = program.baseAdvancePct + (input.dealerTier - 1) * 0.005;
  const vehicleRiskMultiplier = getVehicleRiskMultiplier(input.vehicleMake, input.vehicleModel, 'Westlake');
  const advanceGross = roundToCents(input.vehicleCost * advanceMultiplier * vehicleRiskMultiplier);
  const fees = financials.docFee + financials.registrationFee + financials.deliveryFee + 200;
  const advanceNet = roundToCents(advanceGross - fees);

  // Net check to dealer
  const netCheckToDealer = roundToCents(advanceNet - input.tradePayoff);

  // Dealer profit
  const profit = calculateDealerProfit(
    input.vehicleRetailPrice,
    input.vehicleCost,
    financials.gapPrice,
    financials.vscPrice,
    financials.amountFinanced
  );

  // Additional fees
  const originationFee = roundToCents(financials.amountFinanced * 0.0075);
  const holdback = roundToCents(advanceGross * 0.018);

  // Approval logic
  const rejectionReasons: string[] = [];
  if (ltv > program.ltvCap * 100) {
    rejectionReasons.push(`LTV ${ltv.toFixed(1)}% exceeds cap ${(program.ltvCap * 100).toFixed(0)}%`);
  }
  if (!ptiValid) {
    rejectionReasons.push(`PTI ${ptiPercent.toFixed(1)}% exceeds ${ptiCap}%`);
  }
  if (!dtiValid) {
    rejectionReasons.push(`DTI ${dtiPercent.toFixed(1)}% exceeds 50%`);
  }

  const approved = rejectionReasons.length === 0;
  const approvalProbability = approved ? 0.95 : 0.15;

  return {
    id: generateId(),
    lenderId: 'westlake',
    lenderName: LENDER_NAMES.westlake,
    programName: program.name,
    term,
    apr: apr.aprDecimal,
    aprPercent: apr.aprPercent,
l    monthlyPayment,
    bookValue,
    ltv: roundToCents(ltv),
    ltvCap: program.ltvCap * 100,
    advanceGross,
    advanceNet,
    advanceMultiplier,
    netCheckToDealer,
    ...profit,
    ptiPercent: roundToCents(ptiPercent),
    ptiValid,
    ptiCap,
    dtiPercent: roundToCents(dtiPercent),
    dtiValid,
    approved,
    approvalProbability,
    rejectionReasons,
    ...financials,
    originationFee,
    holdback,
    vehicleRiskMultiplier,
  };
}

/**
 * Western Funding lender evaluation
 */
function evaluateWestern(
  input: DealInput,
  bookValue: number
): DealCandidate | null {
  // Choose program based on FICO (from highest to lowest)
  let program = WESTERN_PROGRAMS[3]; // DeepSubprime (default)
  if (input.customerFico >= 650) {
    program = WESTERN_PROGRAMS[0]; // NearPrime
  } else if (input.customerFico >= 600) {
    program = WESTERN_PROGRAMS[1]; // SubprimeB
  } else if (input.customerFico >= 550) {
    program = WESTERN_PROGRAMS[2]; // SubprimeA
  }

  // Calculate amount financed
  const financials = calculateAmountFinanced(
    input.vehicleRetailPrice,
    input.state,
    'western',
    input.downPayment,
    input.tradeAllowance,
    input.tradePayoff,
    input.gapInsuranceSelected,
    input.vscSelected,
    input.vscTier
  );

  const ltv = (financials.amountFinanced / bookValue) * 100;

  // Calculate APR
  const apr = calculateDynamicAPR(
    input.customerFico,
    ltv,
    financials.totalDown,
    input.vehicleRetailPrice,
    'western',
    input.state
  );

  // Term from program
  const term = program.term;

  // Calculate payment
  const monthlyPayment = calculatePayment(financials.amountFinanced, apr.aprDecimal, term);

  // PTI validation (25% for Western)
  const ptiPercent = (monthlyPayment / input.monthlyIncome) * 100;
  const ptiCap = 25;
  const ptiValid = ptiPercent <= ptiCap;

  // DTI validation
  const monthlyDebt = input.monthlyDebt ?? 0;
  const dtiPercent = ((monthlyPayment + monthlyDebt) / input.monthlyIncome) * 100;
  const dtiValid = dtiPercent <= 50;

  // Advance calculation
  const advanceMultiplier = program.baseAdvancePct;
  const vehicleRiskMultiplier = getVehicleRiskMultiplier(input.vehicleMake, input.vehicleModel, 'Western');
  const advanceGross = roundToCents(input.vehicleCost * advanceMultiplier * vehicleRiskMultiplier);
  const fees = financials.docFee + financials.registrationFee + financials.deliveryFee + 200;
  const advanceNet = roundToCents(advanceGross - fees);

  // Net check to dealer
  const netCheckToDealer = roundToCents(advanceNet - input.tradePayoff);

  // Dealer profit
  const profit = calculateDealerProfit(
    input.vehicleRetailPrice,
    input.vehicleCost,
    financials.gapPrice,
    financials.vscPrice,
    financials.amountFinanced
  );

  // Additional fees
  const originationFee = roundToCents(financials.amountFinanced * 0.0075);
  const holdback = roundToCents(advanceGross * 0.018);

  // Approval logic
  const rejectionReasons: string[] = [];
  if (ltv > program.ltvCap * 100) {
    rejectionReasons.push(`LTV ${ltv.toFixed(1)}% exceeds cap ${(program.ltvCap * 100).toFixed(0)}%`);
  }
  if (!ptiValid) {
    rejectionReasons.push(`PTI ${ptiPercent.toFixed(1)}% exceeds ${ptiCap}%`);
  }
  if (!dtiValid) {
    rejectionReasons.push(`DTI ${dtiPercent.toFixed(1)}% exceeds 50%`);
  }

  const approved = rejectionReasons.length === 0;
  const approvalProbability = approved ? 0.88 : 0.20;

  return {
    id: generateId(),
    lenderId: 'western',
    lenderName: LENDER_NAMES.western,
    programName: program.name,
    term,
    apr: apr.aprDecimal,
    aprPercent: apr.aprPercent,

    monthlyPayment,
    bookValue,
    ltv: roundToCents(ltv),
    ltvCap: program.ltvCap * 100,
    advanceGross,
    advanceNet,
    advanceMultiplier,
    netCheckToDealer,
    ...profit,
    ptiPercent: roundToCents(ptiPercent),
    ptiValid,
    ptiCap,
    dtiPercent: roundToCents(dtiPercent),
    dtiValid,
    approved,
    approvalProbability,
    rejectionReasons,
    ...financials,
    originationFee,
    holdback,
    vehicleRiskMultiplier,
  };
}

/**
 * UAC lender evaluation
 */
function evaluateUAC(
  input: DealInput,
  bookValue: number,
  currentDate: Date = new Date()
): DealCandidate | null {
  const currentYear = currentDate.getFullYear();

  // LTV cap based on dealer tier
  const ltvCap = UAC_CONFIG.tierLtvCaps[input.dealerTier] ?? 1.31;

  // Calculate risk score (10..90)
  let riskScore = 50;
  if (input.customerFico >= 700) {
    riskScore += 30;
  } else if (input.customerFico >= 650) {
    riskScore += 20;
  } else if (input.customerFico >= 600) {
    riskScore += 10;
  }

  const downPercent = ((input.downPayment + Math.max(0, input.tradeAllowance - input.tradePayoff)) / input.vehicleRetailPrice) * 100;
  if (downPercent >= 20) {
    riskScore += 15;
  }

  if (input.vehicleMileage > 150000) {
    riskScore -= 10;
  }

  if (input.vehicleYear < 2015) {
    riskScore -= 15;
  }

  riskScore = clamp(riskScore, 10, 90);

  // Risk adjustment for advance multiplier
  const riskAdjustment = -0.10 + (riskScore / 100) * 0.20;
  const advanceMultiplier = UAC_CONFIG.baseMultiplier + riskAdjustment;

  // Calculate amount financed
  const financials = calculateAmountFinanced(
    input.vehicleRetailPrice,
    input.state,
    'uac',
    input.downPayment,
    input.tradeAllowance,
    input.tradePayoff,
    input.gapInsuranceSelected,
    input.vscSelected,
    input.vscTier
  );

  const ltv = (financials.amountFinanced / bookValue) * 100;

  // Calculate APR
  const apr = calculateDynamicAPR(
    input.customerFico,
    ltv,
    financials.totalDown,
    input.vehicleRetailPrice,
    'uac',
    input.state
  );

  // Term is 72 for UAC
  const term = 72;

  // Calculate payment
  const monthlyPayment = calculatePayment(financials.amountFinanced, apr.aprDecimal, term);

  // PTI validation (20% for UAC)
  const ptiPercent = (monthlyPayment / input.monthlyIncome) * 100;
  const ptiCap = 20;
  const ptiValid = ptiPercent <= ptiCap;

  // DTI validation
  const monthlyDebt = input.monthlyDebt ?? 0;
  const dtiPercent = ((monthlyPayment + monthlyDebt) / input.monthlyIncome) * 100;
  const dtiValid = dtiPercent <= 50;

  // Advance calculation
  const vehicleRiskMultiplier = getVehicleRiskMultiplier(input.vehicleMake, input.vehicleModel, 'UAC');
  const advanceGross = roundToCents(input.vehicleCost * advanceMultiplier * vehicleRiskMultiplier);
  const fees = financials.docFee + financials.registrationFee + financials.deliveryFee + 200;
  const advanceNet = roundToCents(advanceGross - fees);

  // Net check to dealer
  const netCheckToDealer = roundToCents(advanceNet - input.tradePayoff);

  // Dealer profit
  const profit = calculateDealerProfit(
    input.vehicleRetailPrice,
    input.vehicleCost,
    financials.gapPrice,
    financials.vscPrice,
    financials.amountFinanced
  );

  // Additional fees
  const originationFee = roundToCents(financials.amountFinanced * 0.0075);
  const holdback = roundToCents(advanceGross * 0.018);

  // Approval logic
  const rejectionReasons: string[] = [];
  if (ltv > ltvCap * 100) {
    rejectionReasons.push(`LTV ${ltv.toFixed(1)}% exceeds cap ${(ltvCap * 100).toFixed(0)}%`);
  }
  if (!ptiValid) {
    rejectionReasons.push(`PTI ${ptiPercent.toFixed(1)}% exceeds ${ptiCap}%`);
  }
  if (!dtiValid) {
    rejectionReasons.push(`DTI ${dtiPercent.toFixed(1)}% exceeds 50%`);
  }

  const approved = rejectionReasons.length === 0;
  const approvalProbability = approved ? 0.92 : 0.25;

  return {
    id: generateId(),
    lenderId: 'uac',
    lenderName: LENDER_NAMES.uac,
    programName: `Tier ${input.dealerTier}`,
    term,
    apr: apr.aprDecimal,
    aprPercent: apr.aprPercent,

    monthlyPayment,
    bookValue,
    ltv: roundToCents(ltv),
    ltvCap: ltvCap * 100,
    advanceGross,
    advanceNet,
    advanceMultiplier,
    netCheckToDealer,
    ...profit,
    ptiPercent: roundToCents(ptiPercent),
    ptiValid,
    ptiCap,
    dtiPercent: roundToCents(dtiPercent),
    dtiValid,
    approved,
    approvalProbability,
    rejectionReasons,
    ...financials,
    originationFee,
    holdback,
    vehicleRiskMultiplier,
    riskScore,
  };
}

/**
 * Create a declined candidate template
 */
function createDeclinedCandidate(
  lenderId: LenderId,
  input: DealInput,
  bookValue: number,
  reason: string
): DealCandidate {
  const financials = calculateAmountFinanced(
    input.vehicleRetailPrice,
    input.state,
    lenderId,
    input.downPayment,
    input.tradeAllowance,
    input.tradePayoff,
    input.gapInsuranceSelected,
    input.vscSelected,
    input.vscTier
  );

  return {
    id: generateId(),
    lenderId,
    lenderName: LENDER_NAMES[lenderId],
    programName: 'N/A',
    term: 0,
    apr: 0,
    aprPercent: 0,

    monthlyPayment: 0,
    bookValue,
    ltv: 0,
    ltvCap: 0,
    advanceGross: 0,
    advanceNet: 0,
    advanceMultiplier: 0,
    netCheckToDealer: 0,
    dealerFrontGross: 0,
    dealerBackendGross: 0,
    dealerReserve: 0,
    totalDealerProfit: 0,
    ptiPercent: 0,
    ptiValid: false,
    ptiCap: 0,
    dtiPercent: 0,
    dtiValid: false,
    approved: false,
    approvalProbability: 0,
    rejectionReasons: [reason],
    ...financials,
    originationFee: 0,
    holdback: 0,
    vehicleRiskMultiplier: 1,
  };
}

/**
 * 7.4 Rehash orchestration (runRehash)
 */
export function runRehash(input: DealInput, currentDate: Date = new Date()): RehashResult {
  // Calculate book value
  const bookValue = calculateBookValue(
    input.vehicleRetailPrice,
    input.vehicleYear,
    input.vehicleMileage,
    input.vehicleMake,
    currentDate
  );

  // Calculate trade equity and total down
  const tradeEquity = Math.max(0, input.tradeAllowance - input.tradePayoff);
  const totalDown = input.downPayment + tradeEquity;

  // Evaluate all lenders
  const deals: DealCandidate[] = [];

  const westlakeDeal = evaluateWestlake(input, bookValue, currentDate);
  if (westlakeDeal) deals.push(westlakeDeal);

  const westernDeal = evaluateWestern(input, bookValue);
  if (westernDeal) deals.push(westernDeal);

  const uacDeal = evaluateUAC(input, bookValue, currentDate);
  if (uacDeal) deals.push(uacDeal);

  // Get approved deals
  const approvedDeals = deals.filter(d => d.approved);

  // Sort by profit then by closeness to target payment
  const sortedDeals = [...approvedDeals].sort((a, b) => {
    // Primary: highest profit
    if (b.totalDealerProfit !== a.totalDealerProfit) {
      return b.totalDealerProfit - a.totalDealerProfit;
    }
    // Secondary: closest to target payment
    const aDiff = Math.abs(a.monthlyPayment - input.targetPayment);
    const bDiff = Math.abs(b.monthlyPayment - input.targetPayment);
    return aDiff - bDiff;
  });

  // Best deal for profit mode
  const profitBestDeal = sortedDeals[0] || null;

  // Survival mode: best approval probability under target payment
  const survivalCandidates = deals
    .filter(d => d.monthlyPayment <= input.targetPayment + input.paymentTolerance)
    .sort((a, b) => b.approvalProbability - a.approvalProbability);
  const survivalBestDeal = survivalCandidates[0] || null;

  // Determine triage mode and best deal
  let mode: 'profit' | 'survival' = 'profit';
  let bestDeal = profitBestDeal;
  let reason = '';
  let badge = '';

  if (approvedDeals.length === 0) {
    mode = 'survival';
    bestDeal = survivalBestDeal;
    reason = 'No approved deals found. Showing best survival option.';
    badge = '⚠️ Survival Mode';
  } else if (profitBestDeal && profitBestDeal.monthlyPayment > input.targetPayment + input.paymentTolerance) {
    // Check if survival deal has significantly better payment fit
    if (survivalBestDeal && survivalBestDeal.approved) {
      mode = 'survival';
      bestDeal = survivalBestDeal;
      reason = 'Best profit deal exceeds payment tolerance. Recommending deal within budget.';
      badge = '💰 Budget-Friendly';
    } else {
      reason = 'Best profit deal exceeds target payment but no better alternatives.';
      badge = '📈 Max Profit';
    }
  } else {
    reason = 'Deal optimizes dealer profit within payment tolerance.';
    badge = '🎯 Optimal Deal';
  }

  return {
    deals,
    bestDeal,
    triage: {
      mode,
      bestDealId: bestDeal?.id || null,
      reason,
      badge,
    },
    bookValue,
    totalDown,
    tradeEquity,
  };
}

/**
 * Triage function for API endpoint
 */
export function triageDeals(
  validDeals: DealCandidate[],
  targetPayment: number,
  mandatoryProducts: string[] = []
): { mode: 'profit' | 'survival'; bestDealId: string | null; reason: string; badge: string } {
  if (validDeals.length === 0) {
    return {
      mode: 'survival',
      bestDealId: null,
      reason: 'No valid deals available.',
      badge: '❌ No Options',
    };
  }

  // Filter deals with mandatory products if specified
  let filteredDeals = validDeals;
  if (mandatoryProducts.length > 0) {
    filteredDeals = validDeals.filter(d => {
      const hasGap = mandatoryProducts.includes('gap') ? d.gapPrice > 0 : true;
      const hasVsc = mandatoryProducts.includes('vsc') ? d.vscPrice > 0 : true;
      return hasGap && hasVsc;
    });

    if (filteredDeals.length === 0) {
      filteredDeals = validDeals; // Fall back to all deals
    }
  }

  // Sort by profit
  const byProfit = [...filteredDeals].sort((a, b) => b.totalDealerProfit - a.totalDealerProfit);
  const profitBest = byProfit[0];

  // Sort by payment closeness to target
  const byPayment = [...filteredDeals].sort((a, b) => {
    const aDiff = Math.abs(a.monthlyPayment - targetPayment);
    const bDiff = Math.abs(b.monthlyPayment - targetPayment);
    return aDiff - bDiff;
  });
  const paymentBest = byPayment[0];

  // Check if profit deal is within tolerance
  const tolerance = targetPayment * 0.15; // 15% tolerance
  if (profitBest.monthlyPayment <= targetPayment + tolerance) {
    return {
      mode: 'profit',
      bestDealId: profitBest.id,
      reason: `Maximizes profit at $${profitBest.totalDealerProfit.toLocaleString()} with payment of $${profitBest.monthlyPayment.toFixed(2)}/mo`,
      badge: '📈 Max Profit',
    };
  }

  // Survival mode
  if (paymentBest.approved) {
    return {
      mode: 'survival',
      bestDealId: paymentBest.id,
      reason: `Closest to target payment at $${paymentBest.monthlyPayment.toFixed(2)}/mo with profit of $${paymentBest.totalDealerProfit.toLocaleString()}`,
      badge: '💰 Budget Match',
    };
  }

  // Best available option
  return {
    mode: 'survival',
    bestDealId: byProfit[0]?.id || null,
    reason: 'Best available option under current constraints.',
    badge: '⚠️ Limited Options',
  };
}
