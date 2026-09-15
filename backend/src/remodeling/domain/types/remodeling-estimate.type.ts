import type { BudgetTierId } from '../constants/budget-tiers.constants.js';
import type { AreaGroupId } from '../constants/remodeling-areas.constants.js';

/** De donde salio el costo del apartamento sobre el que se proyecta el presupuesto. */
export type BasePriceSource = 'manual' | 'analysis';

export interface BudgetTierEstimate {
  tier: BudgetTierId;
  label: string;
  description: string;
  /** Porcentaje efectivamente aplicado. */
  percent: number;
  /** Porcentaje por defecto del nivel, para poder mostrar el ajuste. */
  defaultPercent: number;
  /** true si el usuario movio el porcentaje respecto del default. */
  isAdjusted: boolean;
  /** Presupuesto total del nivel, en pesos. */
  totalBudget: number;
}

export interface RemodelingEstimate {
  /** Costo del apartamento sobre el que se calcula todo. */
  basePrice: number;
  basePriceSource: BasePriceSource;
  /** Id del analisis del que se tomo el precio, si la fuente es 'analysis'. */
  analysisId?: string;
  /** Areas que el usuario marco para remodelar. */
  selectedAreas: string[];
  /** Costo de cada area seleccionada. */
  areaCosts: AreaCost[];
  /** Monto total que se necesita, suma de las areas. */
  requiredAmount: number;
  /** Ese monto como porcentaje del costo del apartamento. */
  requiredPercent: number;
  /** Porcentaje del catalogo cubierto por la seleccion, por peso. */
  coverage: number;
  /** Nivel que cubre el monto necesario. null si no alcanza ninguno. */
  recommendedTier: BudgetTierId | null;
  exceedsTopTier: boolean;
  /** Los tres niveles como referencia, para comparar contra lo necesario. */
  tiers: BudgetTierEstimate[];
  generatedAt: string;
}

/** Cuanto cuesta remodelar un area concreta. */
export interface AreaCost {
  area: string;
  label: string;
  group: AreaGroupId;
  weight: number;
  /** Costo del area, en pesos. */
  amount: number;
  /** Lo que costaria sin ajuste manual, para poder comparar. */
  referenceAmount: number;
  /** true si el monto lo fijo el usuario. */
  isManual: boolean;
}

/** Nivel de presupuesto que cubre el monto necesario. */
export interface TierMatch {
  /** null cuando no hay nada seleccionado o ningun nivel alcanza. */
  tier: BudgetTierId | null;
  exceedsTopTier: boolean;
  requiredPercent: number;
}
