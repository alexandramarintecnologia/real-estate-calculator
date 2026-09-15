import { Injectable } from '@nestjs/common';
import {
  BUDGET_TIERS,
  BUDGET_TIER_IDS,
  PERCENT_BOUNDS,
  type BudgetTierId,
} from '../constants/budget-tiers.constants.js';
import type {
  BudgetTierEstimate,
  TierMatch,
} from '../types/remodeling-estimate.type.js';

/** Porcentajes ajustados a mano, por nivel. Los que falten usan su default. */
export type PercentOverrides = Partial<Record<BudgetTierId, number>>;

@Injectable()
export class BudgetTierCalculator {
  /** Presupuesto de un nivel: un porcentaje del costo del apartamento. */
  calculate(
    basePrice: number,
    tier: BudgetTierId,
    percentOverride?: number,
  ): BudgetTierEstimate {
    const config = BUDGET_TIERS[tier];
    const percent = this.resolvePercent(config.defaultPercent, percentOverride);

    return {
      tier,
      label: config.label,
      description: config.description,
      percent,
      defaultPercent: config.defaultPercent,
      isAdjusted: percent !== config.defaultPercent,
      totalBudget: Math.round((basePrice * percent) / 100),
    };
  }

  /** Los tres niveles de una, que es como los muestra el modulo. */
  calculateAll(
    basePrice: number,
    overrides: PercentOverrides = {},
  ): BudgetTierEstimate[] {
    return BUDGET_TIER_IDS.map((tier) =>
      this.calculate(basePrice, tier, overrides[tier]),
    );
  }

  /**
   * Que nivel de presupuesto cubre el monto que se necesita.
   *
   * Devuelve el primer nivel cuyo porcentaje alcanza para lo pedido. Si ni el
   * mas alto alcanza, lo marca como excedido en vez de inventar un nivel.
   */
  classify(requiredPercent: number, tiers: BudgetTierEstimate[]): TierMatch {
    if (requiredPercent <= 0) {
      return { tier: null, exceedsTopTier: false, requiredPercent: 0 };
    }

    const ascending = [...tiers].sort((a, b) => a.percent - b.percent);
    const match = ascending.find((t) => requiredPercent <= t.percent);

    return {
      tier: match?.tier ?? null,
      exceedsTopTier: match === undefined,
      requiredPercent,
    };
  }

  /**
   * Acota el porcentaje ajustado a mano. Los niveles no tienen rangos propios
   * a proposito: el 15/20/25 es una referencia, no un limite del negocio.
   */
  private resolvePercent(defaultPercent: number, override?: number): number {
    if (override == null || !Number.isFinite(override)) return defaultPercent;
    return Math.min(PERCENT_BOUNDS.max, Math.max(PERCENT_BOUNDS.min, override));
  }
}
