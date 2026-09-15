/**
 * Espejo de `backend/src/remodeling/domain/types/remodeling-estimate.type.ts`.
 *
 * OJO: estos niveles (Bajo/Medio/Alto) NO son los "escenarios de remodelacion"
 * del analisis de inversion. Aquellos describen la modalidad de contratacion;
 * estos, el nivel de ambicion del presupuesto. Ver analysis.types.ts.
 */

export type BudgetTierId = "bajo" | "medio" | "alto";

export type BasePriceSource = "manual" | "analysis";

export interface BudgetTierConfig {
  id: BudgetTierId;
  label: string;
  defaultPercent: number;
  description: string;
}

export interface BudgetTierEstimate {
  tier: BudgetTierId;
  label: string;
  description: string;
  percent: number;
  defaultPercent: number;
  isAdjusted: boolean;
  totalBudget: number;
}

export type AreaGroupId = "espacios" | "instalaciones" | "acabados" | "confort";

export interface AreaGroupConfig {
  id: AreaGroupId;
  label: string;
  description: string;
}

export interface RemodelingAreaConfig {
  id: string;
  label: string;
  group: AreaGroupId;
  weight: number;
}

export interface AreaCatalog {
  groups: AreaGroupConfig[];
  areas: RemodelingAreaConfig[];
}

export interface AreaCost {
  area: string;
  label: string;
  group: AreaGroupId;
  weight: number;
  /** Costo del area, en pesos. */
  amount: number;
  /** Lo que costaria sin ajuste manual, para poder comparar. */
  referenceAmount: number;
  isManual: boolean;
}

export interface RemodelingEstimate {
  basePrice: number;
  basePriceSource: BasePriceSource;
  analysisId?: string;
  tiers: BudgetTierEstimate[];
  selectedAreas: string[];
  areaCosts: AreaCost[];
  /** Monto total que se necesita, suma de las areas marcadas. */
  requiredAmount: number;
  /** Ese monto como porcentaje del costo del apartamento. */
  requiredPercent: number;
  /** Porcentaje del catalogo cubierto por la seleccion, por peso. */
  coverage: number;
  /** Nivel que cubre el monto necesario. null si no alcanza ninguno. */
  recommendedTier: BudgetTierId | null;
  exceedsTopTier: boolean;
  generatedAt: string;
}

export type PercentOverrides = Partial<Record<BudgetTierId, number>>;

export interface RemodelingRequest {
  basePrice: number;
  basePriceSource: BasePriceSource;
  analysisId?: string;
  percentOverrides?: PercentOverrides;
  selectedAreas?: string[];
  areaAmounts?: Record<string, number>;
}
