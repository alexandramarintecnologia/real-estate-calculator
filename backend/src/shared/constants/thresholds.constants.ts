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
  1: {
    label: 'Empresa todo costo',
    minPercent: 25,
    maxPercent: 35,
    defaultPercent: 32,
  },
  2: {
    label: 'Solo mano de obra',
    minPercent: 15,
    maxPercent: 20,
    defaultPercent: 15,
  },
  3: {
    label: 'Administrador de obra',
    minPercent: 15,
    maxPercent: 20,
    defaultPercent: 15,
    defaultAdminPercent: 18,
  },
} as const;

export const DEFAULT_PERCENTAGES = {
  NOTARY_FEES_PERCENT: 3,
  BROKER_COMMISSION_PERCENT: 1,
} as const;
