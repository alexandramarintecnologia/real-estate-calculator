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

export interface PropertyData {
  linkPortal?: string;
  direccion: string;
  torre?: string;
  piso?: number;
  numeroApto?: string;
  alcobas: number;
  banos: number;
  metrosCuadrados: number;
  m2Remodelacion: number;
  parqueadero: boolean;
  nombrePropietario?: string;
  celular?: string;
  gastosPosesionMensual: number;
  precioCompra: number;
  arriendoProyectado: number;
  precioVentaProyectado: number;
  mesesProyectadosVenta: number;
  observaciones?: string;
  puntuacionPersonal?: number;
  estadoNegociacion?: string;
}

export interface RemodelingScenario {
  selectedScenario: 1 | 2 | 3;
  adminPercentage?: number;
  customCostPerM2?: number;
}

export interface ProjectExpenses {
  notaryFeesValue?: number;
  notaryFeesType?: 'percent' | 'fixed';
  brokerCommissionValue?: number;
  brokerCommissionType?: 'percent' | 'fixed';
  otherExpenses?: number;
}

export interface QualitativeEvaluation {
  entorno: QualitativeScore;
  accesibilidad: QualitativeScore;
  transporte: QualitativeScore;
  seguridad: QualitativeScore;
  comercioOcio: QualitativeScore;
  documentacion: QualitativeScore;
}

export interface AnalysisRequest {
  property: PropertyData;
  remodeling: RemodelingScenario;
  expenses: ProjectExpenses;
  qualitative: QualitativeEvaluation;
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
  projectedSalePrice: number;
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
