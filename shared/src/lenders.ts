import type { LenderId } from './types';

// Product Pricing 2026 by Lender
export const PRODUCT_PRICING_2026: Record<LenderId, {
  gap: number;
  vsc_basic: number;
  vsc_standard: number;
  vsc_premium: number;
}> = {
  westlake: { gap: 625, vsc_basic: 950, vsc_standard: 1400, vsc_premium: 1900 },
  western: { gap: 595, vsc_basic: 899, vsc_standard: 1299, vsc_premium: 1799 },
  uac: { gap: 600, vsc_basic: 900, vsc_standard: 1300, vsc_premium: 1800 },
};

// Age Factors (depreciation)
export const AGE_FACTORS: Record<number, number> = {
  0: 1.00,
  1: 0.85,
  2: 0.78,
  3: 0.70,
  4: 0.66,
  5: 0.60,
  6: 0.55,
  7: 0.50,
  8: 0.46,
  9: 0.42,
  10: 0.38,
};

// Make Multipliers
export const MAKE_MULTIPLIERS: Record<string, number> = {
  toyota: 1.06,
  honda: 1.05,
  lexus: 1.08,
  acura: 1.04,
  mazda: 1.02,
  subaru: 1.03,
  nissan: 0.95,
  hyundai: 0.92,
  kia: 0.92,
  genesis: 0.98,
  bmw: 0.98,
  mercedes: 0.96,
  'mercedes-benz': 0.96,
  audi: 0.97,
  volkswagen: 0.94,
  vw: 0.94,
  porsche: 1.02,
  dodge: 0.88,
  chrysler: 0.85,
  jeep: 0.93,
  ram: 0.91,
  ford: 0.92,
  chevrolet: 0.90,
  chevy: 0.90,
  gmc: 0.91,
  buick: 0.88,
  cadillac: 0.90,
  lincoln: 0.89,
  infiniti: 0.91,
  volvo: 0.95,
  jaguar: 0.88,
  'land rover': 0.86,
  landrover: 0.86,
  mini: 0.90,
  fiat: 0.82,
  alfa: 0.84,
  'alfa romeo': 0.84,
  tesla: 0.94,
  rivian: 0.92,
  lucid: 0.91,
  mitsubishi: 0.85,
};

// State Tax Rates
export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04, AK: 0.00, AZ: 0.056, AR: 0.065, CA: 0.0725,
  CO: 0.029, CT: 0.0635, DE: 0.00, FL: 0.06, GA: 0.04,
  HI: 0.04, ID: 0.06, IL: 0.0625, IN: 0.07, IA: 0.06,
  KS: 0.065, KY: 0.06, LA: 0.0445, ME: 0.055, MD: 0.06,
  MA: 0.0625, MI: 0.06, MN: 0.06875, MS: 0.07, MO: 0.04225,
  MT: 0.00, NE: 0.055, NV: 0.0685, NH: 0.00, NJ: 0.06625,
  NM: 0.05125, NY: 0.04, NC: 0.0475, ND: 0.05, OH: 0.0575,
  OK: 0.045, OR: 0.00, PA: 0.06, RI: 0.07, SC: 0.06,
  SD: 0.045, TN: 0.07, TX: 0.0625, UT: 0.0485, VT: 0.06,
  VA: 0.053, WA: 0.065, WV: 0.06, WI: 0.05, WY: 0.04,
  DC: 0.06,
};

// State Fees
export const STATE_FEES: Record<string, { doc: number; registration: number; delivery: number }> = {
  CA: { doc: 450, registration: 250, delivery: 300 },
  TX: { doc: 350, registration: 160, delivery: 220 },
  FL: { doc: 350, registration: 225, delivery: 200 },
  NY: { doc: 500, registration: 300, delivery: 350 },
  PA: { doc: 400, registration: 200, delivery: 250 },
  IL: { doc: 375, registration: 275, delivery: 275 },
  OH: { doc: 350, registration: 150, delivery: 200 },
  GA: { doc: 400, registration: 200, delivery: 225 },
  NC: { doc: 350, registration: 175, delivery: 200 },
  MI: { doc: 375, registration: 200, delivery: 225 },
  NJ: { doc: 450, registration: 275, delivery: 275 },
  VA: { doc: 400, registration: 225, delivery: 250 },
  WA: { doc: 400, registration: 200, delivery: 250 },
  AZ: { doc: 350, registration: 175, delivery: 200 },
  MA: { doc: 425, registration: 250, delivery: 275 },
  TN: { doc: 325, registration: 150, delivery: 175 },
  IN: { doc: 300, registration: 150, delivery: 175 },
  MO: { doc: 325, registration: 150, delivery: 175 },
  MD: { doc: 400, registration: 225, delivery: 250 },
  WI: { doc: 350, registration: 175, delivery: 200 },
  CO: { doc: 375, registration: 200, delivery: 225 },
  MN: { doc: 375, registration: 200, delivery: 225 },
  SC: { doc: 325, registration: 150, delivery: 175 },
  AL: { doc: 300, registration: 150, delivery: 175 },
  LA: { doc: 350, registration: 175, delivery: 200 },
  KY: { doc: 325, registration: 150, delivery: 175 },
  OR: { doc: 375, registration: 200, delivery: 225 },
  OK: { doc: 300, registration: 125, delivery: 150 },
  CT: { doc: 425, registration: 250, delivery: 275 },
  UT: { doc: 350, registration: 175, delivery: 200 },
  IA: { doc: 325, registration: 150, delivery: 175 },
  NV: { doc: 400, registration: 200, delivery: 225 },
  AR: { doc: 300, registration: 125, delivery: 150 },
  MS: { doc: 300, registration: 125, delivery: 150 },
  KS: { doc: 325, registration: 150, delivery: 175 },
  NM: { doc: 325, registration: 150, delivery: 175 },
  NE: { doc: 325, registration: 150, delivery: 175 },
  ID: { doc: 325, registration: 150, delivery: 175 },
  WV: { doc: 300, registration: 125, delivery: 150 },
  HI: { doc: 400, registration: 200, delivery: 250 },
  NH: { doc: 350, registration: 175, delivery: 200 },
  ME: { doc: 350, registration: 175, delivery: 200 },
  MT: { doc: 300, registration: 125, delivery: 150 },
  RI: { doc: 375, registration: 200, delivery: 225 },
  DE: { doc: 375, registration: 200, delivery: 225 },
  SD: { doc: 300, registration: 125, delivery: 150 },
  ND: { doc: 300, registration: 125, delivery: 150 },
  AK: { doc: 350, registration: 175, delivery: 225 },
  VT: { doc: 350, registration: 175, delivery: 200 },
  WY: { doc: 300, registration: 125, delivery: 150 },
  DC: { doc: 450, registration: 250, delivery: 275 },
};

// State APR Caps
export const STATE_APR_CAPS: Record<string, number> = {
  NY: 0.16,
  CA: 0.30,
  FL: 0.30,
  TX: 0.36,
  PA: 0.24,
  IL: 0.36,
  OH: 0.25,
  GA: 0.36,
  NC: 0.30,
  MI: 0.25,
  NJ: 0.30,
  VA: 0.36,
  WA: 0.25,
  AZ: 0.36,
  MA: 0.21,
  TN: 0.24,
  IN: 0.36,
  MO: 0.36,
  MD: 0.24,
  WI: 0.36,
  CO: 0.21,
  MN: 0.36,
  SC: 0.36,
  AL: 0.36,
  LA: 0.36,
  KY: 0.36,
  OR: 0.36,
  OK: 0.36,
  CT: 0.36,
  UT: 0.36,
  DEFAULT: 0.36,
};

// State Doc Fee Caps
export const STATE_DOC_FEE_CAPS: Record<string, number> = {
  CA: 500,
  TX: 425,
  FL: 400,
  NY: 550,
  PA: 450,
  IL: 400,
  OH: 375,
  GA: 425,
  NC: 375,
  MI: 400,
  NJ: 500,
  VA: 450,
  WA: 425,
  AZ: 375,
  MA: 475,
  TN: 350,
  IN: 325,
  MO: 350,
  MD: 450,
  WI: 375,
  DEFAULT: 500,
};

// Vehicle Risk Database
export interface VehicleRiskEntry {
  make: string;
  model: string;
  reliabilityScore: number;
  issues?: string[];
  lenderAdjustments: Partial<Record<string, number>>;
}

export const VEHICLE_RISK_DATABASE: VehicleRiskEntry[] = [
  // Toyota
  { make: 'Toyota', model: 'Camry', reliabilityScore: 92, lenderAdjustments: { Westlake: 1.04, Western: 1.06, UAC: 1.05 } },
  { make: 'Toyota', model: 'Corolla', reliabilityScore: 94, lenderAdjustments: { Westlake: 1.05, Western: 1.07, UAC: 1.06 } },
  { make: 'Toyota', model: 'RAV4', reliabilityScore: 90, lenderAdjustments: { Westlake: 1.03, Western: 1.05, UAC: 1.04 } },
  { make: 'Toyota', model: 'Highlander', reliabilityScore: 89, lenderAdjustments: { Westlake: 1.03, Western: 1.04, UAC: 1.03 } },
  { make: 'Toyota', model: 'Tacoma', reliabilityScore: 88, lenderAdjustments: { Westlake: 1.02, Western: 1.04, UAC: 1.03 } },
  { make: 'Toyota', model: '4Runner', reliabilityScore: 87, lenderAdjustments: { Westlake: 1.02, Western: 1.03, UAC: 1.02 } },
  { make: 'Toyota', model: 'Any', reliabilityScore: 88, lenderAdjustments: { Westlake: 1.02, Western: 1.04, UAC: 1.03 } },

  // Honda
  { make: 'Honda', model: 'Accord', reliabilityScore: 91, lenderAdjustments: { Westlake: 1.05, Western: 1.06, UAC: 1.05 } },
  { make: 'Honda', model: 'Civic', reliabilityScore: 93, lenderAdjustments: { Westlake: 1.05, Western: 1.07, UAC: 1.06 } },
  { make: 'Honda', model: 'CR-V', reliabilityScore: 89, lenderAdjustments: { Westlake: 1.03, Western: 1.05, UAC: 1.04 } },
  { make: 'Honda', model: 'Pilot', reliabilityScore: 86, lenderAdjustments: { Westlake: 1.02, Western: 1.03, UAC: 1.02 } },
  { make: 'Honda', model: 'Any', reliabilityScore: 88, lenderAdjustments: { Westlake: 1.03, Western: 1.05, UAC: 1.04 } },

  // Nissan
  { make: 'Nissan', model: 'Altima', reliabilityScore: 72, issues: ['transmission', 'cvt'], lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },
  { make: 'Nissan', model: 'Sentra', reliabilityScore: 70, issues: ['cvt', 'suspension'], lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Nissan', model: 'Rogue', reliabilityScore: 71, issues: ['cvt'], lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Nissan', model: 'Maxima', reliabilityScore: 74, issues: ['cvt'], lenderAdjustments: { Westlake: 0.96, Western: 0.94, UAC: 0.95 } },
  { make: 'Nissan', model: 'Any', reliabilityScore: 72, issues: ['cvt'], lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },

  // Hyundai
  { make: 'Hyundai', model: 'Elantra', reliabilityScore: 68, issues: ['engine'], lenderAdjustments: { Westlake: 0.90, Western: 0.88, UAC: 0.89 } },
  { make: 'Hyundai', model: 'Sonata', reliabilityScore: 70, issues: ['engine'], lenderAdjustments: { Westlake: 0.92, Western: 0.90, UAC: 0.91 } },
  { make: 'Hyundai', model: 'Tucson', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Hyundai', model: 'Santa Fe', reliabilityScore: 74, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Hyundai', model: 'Any', reliabilityScore: 70, lenderAdjustments: { Westlake: 0.92, Western: 0.90, UAC: 0.91 } },

  // Kia
  { make: 'Kia', model: 'Optima', reliabilityScore: 69, issues: ['engine'], lenderAdjustments: { Westlake: 0.91, Western: 0.89, UAC: 0.90 } },
  { make: 'Kia', model: 'Forte', reliabilityScore: 68, lenderAdjustments: { Westlake: 0.90, Western: 0.88, UAC: 0.89 } },
  { make: 'Kia', model: 'Sorento', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Kia', model: 'Sportage', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Kia', model: 'Any', reliabilityScore: 70, lenderAdjustments: { Westlake: 0.92, Western: 0.90, UAC: 0.91 } },

  // Ford
  { make: 'Ford', model: 'F-150', reliabilityScore: 78, lenderAdjustments: { Westlake: 0.98, Western: 0.97, UAC: 0.97 } },
  { make: 'Ford', model: 'Escape', reliabilityScore: 74, lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },
  { make: 'Ford', model: 'Explorer', reliabilityScore: 72, issues: ['transmission'], lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Ford', model: 'Mustang', reliabilityScore: 76, lenderAdjustments: { Westlake: 0.97, Western: 0.95, UAC: 0.96 } },
  { make: 'Ford', model: 'Any', reliabilityScore: 74, lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },

  // Chevrolet
  { make: 'Chevrolet', model: 'Silverado', reliabilityScore: 77, lenderAdjustments: { Westlake: 0.97, Western: 0.96, UAC: 0.96 } },
  { make: 'Chevrolet', model: 'Equinox', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Chevrolet', model: 'Malibu', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Chevrolet', model: 'Traverse', reliabilityScore: 71, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Chevrolet', model: 'Any', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },

  // BMW
  { make: 'BMW', model: '3 Series', reliabilityScore: 75, issues: ['electronics'], lenderAdjustments: { Westlake: 0.96, Western: 0.94, UAC: 0.95 } },
  { make: 'BMW', model: '5 Series', reliabilityScore: 73, issues: ['electronics'], lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },
  { make: 'BMW', model: 'X3', reliabilityScore: 74, lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },
  { make: 'BMW', model: 'X5', reliabilityScore: 72, issues: ['electronics', 'suspension'], lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'BMW', model: 'Any', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.95, Western: 0.93, UAC: 0.94 } },

  // Mercedes
  { make: 'Mercedes-Benz', model: 'C-Class', reliabilityScore: 72, issues: ['electronics'], lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Mercedes-Benz', model: 'E-Class', reliabilityScore: 71, issues: ['electronics'], lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Mercedes-Benz', model: 'GLC', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Mercedes-Benz', model: 'Any', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },

  // Dodge
  { make: 'Dodge', model: 'Charger', reliabilityScore: 70, issues: ['transmission'], lenderAdjustments: { Westlake: 0.92, Western: 0.90, UAC: 0.91 } },
  { make: 'Dodge', model: 'Challenger', reliabilityScore: 71, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Dodge', model: 'Durango', reliabilityScore: 69, issues: ['transmission'], lenderAdjustments: { Westlake: 0.91, Western: 0.89, UAC: 0.90 } },
  { make: 'Dodge', model: 'Any', reliabilityScore: 69, lenderAdjustments: { Westlake: 0.91, Western: 0.89, UAC: 0.90 } },

  // Jeep
  { make: 'Jeep', model: 'Wrangler', reliabilityScore: 74, lenderAdjustments: { Westlake: 0.96, Western: 0.94, UAC: 0.95 } },
  { make: 'Jeep', model: 'Grand Cherokee', reliabilityScore: 71, issues: ['electronics'], lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Jeep', model: 'Cherokee', reliabilityScore: 68, issues: ['transmission'], lenderAdjustments: { Westlake: 0.90, Western: 0.88, UAC: 0.89 } },
  { make: 'Jeep', model: 'Any', reliabilityScore: 70, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },

  // Lexus
  { make: 'Lexus', model: 'ES', reliabilityScore: 94, lenderAdjustments: { Westlake: 1.06, Western: 1.08, UAC: 1.07 } },
  { make: 'Lexus', model: 'RX', reliabilityScore: 92, lenderAdjustments: { Westlake: 1.05, Western: 1.07, UAC: 1.06 } },
  { make: 'Lexus', model: 'IS', reliabilityScore: 90, lenderAdjustments: { Westlake: 1.04, Western: 1.06, UAC: 1.05 } },
  { make: 'Lexus', model: 'Any', reliabilityScore: 91, lenderAdjustments: { Westlake: 1.05, Western: 1.07, UAC: 1.06 } },

  // Mazda
  { make: 'Mazda', model: 'CX-5', reliabilityScore: 88, lenderAdjustments: { Westlake: 1.02, Western: 1.04, UAC: 1.03 } },
  { make: 'Mazda', model: 'Mazda3', reliabilityScore: 89, lenderAdjustments: { Westlake: 1.03, Western: 1.05, UAC: 1.04 } },
  { make: 'Mazda', model: 'Mazda6', reliabilityScore: 87, lenderAdjustments: { Westlake: 1.02, Western: 1.03, UAC: 1.02 } },
  { make: 'Mazda', model: 'Any', reliabilityScore: 87, lenderAdjustments: { Westlake: 1.02, Western: 1.04, UAC: 1.03 } },

  // Subaru
  { make: 'Subaru', model: 'Outback', reliabilityScore: 85, lenderAdjustments: { Westlake: 1.01, Western: 1.03, UAC: 1.02 } },
  { make: 'Subaru', model: 'Forester', reliabilityScore: 86, lenderAdjustments: { Westlake: 1.02, Western: 1.04, UAC: 1.03 } },
  { make: 'Subaru', model: 'Crosstrek', reliabilityScore: 87, lenderAdjustments: { Westlake: 1.02, Western: 1.04, UAC: 1.03 } },
  { make: 'Subaru', model: 'Any', reliabilityScore: 85, lenderAdjustments: { Westlake: 1.01, Western: 1.03, UAC: 1.02 } },

  // Volkswagen
  { make: 'Volkswagen', model: 'Jetta', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Volkswagen', model: 'Passat', reliabilityScore: 71, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'Volkswagen', model: 'Tiguan', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },
  { make: 'Volkswagen', model: 'Any', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },

  // GMC
  { make: 'GMC', model: 'Sierra', reliabilityScore: 76, lenderAdjustments: { Westlake: 0.96, Western: 0.95, UAC: 0.95 } },
  { make: 'GMC', model: 'Terrain', reliabilityScore: 72, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'GMC', model: 'Acadia', reliabilityScore: 71, lenderAdjustments: { Westlake: 0.93, Western: 0.91, UAC: 0.92 } },
  { make: 'GMC', model: 'Any', reliabilityScore: 73, lenderAdjustments: { Westlake: 0.94, Western: 0.92, UAC: 0.93 } },

  // Tesla
  { make: 'Tesla', model: 'Model 3', reliabilityScore: 78, issues: ['build quality'], lenderAdjustments: { Westlake: 0.98, Western: 0.96, UAC: 0.97 } },
  { make: 'Tesla', model: 'Model Y', reliabilityScore: 76, issues: ['build quality'], lenderAdjustments: { Westlake: 0.97, Western: 0.95, UAC: 0.96 } },
  { make: 'Tesla', model: 'Model S', reliabilityScore: 74, issues: ['electronics'], lenderAdjustments: { Westlake: 0.96, Western: 0.94, UAC: 0.95 } },
  { make: 'Tesla', model: 'Any', reliabilityScore: 76, lenderAdjustments: { Westlake: 0.97, Western: 0.95, UAC: 0.96 } },
];

// Lender Programs 2026
export interface WestlakeProgram {
  name: string;
  minFico: number;
  baseAdvancePct: number;
  ltvCap: number;
  maxAge: number;
  maxMiles: number;
}

export const WESTLAKE_PROGRAMS: WestlakeProgram[] = [
  { name: 'Platinum', minFico: 680, baseAdvancePct: 1.14, ltvCap: 1.25, maxAge: 12, maxMiles: 120000 },
  { name: 'Gold', minFico: 620, baseAdvancePct: 1.13, ltvCap: 1.30, maxAge: 15, maxMiles: 150000 },
  { name: 'Standard', minFico: 0, baseAdvancePct: 1.11, ltvCap: 1.35, maxAge: 18, maxMiles: 180000 },
];

export interface WesternProgram {
  name: string;
  minFico: number;
  baseAdvancePct: number;
  ltvCap: number;
  term: number;
}

export const WESTERN_PROGRAMS: WesternProgram[] = [
  { name: 'NearPrime', minFico: 650, baseAdvancePct: 1.40, ltvCap: 1.30, term: 72 },
  { name: 'SubprimeB', minFico: 600, baseAdvancePct: 1.38, ltvCap: 1.40, term: 84 },
  { name: 'SubprimeA', minFico: 550, baseAdvancePct: 1.32, ltvCap: 1.45, term: 84 },
  { name: 'DeepSubprime', minFico: 300, baseAdvancePct: 1.25, ltvCap: 1.50, term: 84 },
];

export const UAC_CONFIG = {
  tierLtvCaps: {
    1: 1.35,
    2: 1.33,
    3: 1.31,
    4: 1.28,
    5: 1.25,
  } as Record<number, number>,
  baseMultiplier: 1.12,
};

// Lender display names
export const LENDER_NAMES: Record<LenderId, string> = {
  westlake: 'Westlake Financial',
  western: 'Western Funding',
  uac: 'United Auto Credit',
};
