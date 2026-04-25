export const ROI_THRESHOLDS = {
  EXCELLENT: 15,
  GOOD: 8,
} as const;

export const CAP_RATE_THRESHOLDS = {
  EXCELLENT: 8,
  GOOD: 5,
} as const;

export const ZONE_THRESHOLDS = {
  EXCELLENT: 2.5,
  GOOD: 1.5,
} as const;

export const REMODELING_SCENARIOS = {
  1: { label: 'Empresa todo costo', costPerM2: 1_150_000 },
  2: { label: 'Solo mano de obra', costPerM2: 500_000 },
  3: {
    label: 'Administrador de obra',
    baseCostPerM2: 500_000,
    defaultAdminPercent: 15,
  },
} as const;

export const DEFAULT_PERCENTAGES = {
  NOTARY_FEES_PERCENT: 3,
  BROKER_COMMISSION_PERCENT: 1,
} as const;
