export enum Rating {
  EXCELENTE = 'excelente',
  BUENA = 'buena',
  RIESGOSA = 'riesgosa',
}

export enum Decision {
  COMPRAR = 'comprar',
  EVALUAR = 'evaluar',
  NO_RECOMENDABLE = 'no_recomendable',
}

export enum QualitativeScore {
  DESCARTADO = 0,
  REGULAR = 1,
  BUENO = 2,
  EXCELENTE = 3,
}

export interface RemodelingCost {
  scenario: number;
  costPerM2: number;
  totalCost: number;
  adminPercentage?: number;
}

export interface ProjectCosts {
  purchasePrice: number;
  remodelingCost: number;
  notaryFees: number;
  brokerCommission: number;
  otherExpenses: number;
  totalOwnershipExpenses: number;
  totalProjectCost: number;
}

export interface ProfitabilityMetrics {
  grossProfit: number;
  roi: number;
  annualRentalIncome: number;
  capRate: number;
}

export interface QualitativeResult {
  scores: Record<string, QualitativeScore>;
  average: number;
  rating: Rating;
}

export interface InvestmentEvaluation {
  roiRating: Rating;
  capRateRating: Rating;
  zoneRating: Rating;
  overallRating: Rating;
  decision: Decision;
  recommendations: string[];
}

export interface AnalysisResult {
  remodelingCosts: RemodelingCost[];
  selectedRemodelingCost: RemodelingCost;
  projectCosts: ProjectCosts;
  profitability: ProfitabilityMetrics;
  qualitative: QualitativeResult;
  evaluation: InvestmentEvaluation;
}
