import type { RemodelingScenario } from "@/types/analysis.types";

/**
 * Replica del calculo de remodelacion y precio de venta del backend
 * (`RemodelingCalculator` + `AnalyzePropertyUseCase`).
 *
 * Existe para que la vista previa del formulario y el resultado real coincidan:
 * antes el paso 1 estimaba la venta con un % fijo del precio de compra, mientras
 * el backend la recalculaba sobre compra + costo real de remodelacion (incluida
 * la administracion del escenario 3), y los dos numeros no cuadraban.
 *
 * Si cambian las reglas en `backend/src/shared/constants/thresholds.constants.ts`
 * o en `remodeling.calculator.ts`, hay que actualizar este archivo tambien.
 */

export const SCENARIO_CONFIG = {
  1: { minPercent: 25, maxPercent: 35, defaultPercent: 32, hasAdmin: false },
  2: { minPercent: 15, maxPercent: 20, defaultPercent: 15, hasAdmin: false },
  3: { minPercent: 15, maxPercent: 20, defaultPercent: 15, hasAdmin: true },
} as const;

export const DEFAULT_ADMIN_PERCENT = 18;

export type ScenarioId = keyof typeof SCENARIO_CONFIG;

/** Acota el % de remodelacion al rango del escenario, igual que el backend. */
export function clampRemodelingPercent(
  scenario: ScenarioId,
  percent?: number,
): number {
  const config = SCENARIO_CONFIG[scenario];
  const raw = percent ?? config.defaultPercent;
  return Math.min(
    config.maxPercent,
    Math.max(config.minPercent, Number.isFinite(raw) ? raw : config.defaultPercent),
  );
}

interface RemodelingCostInput {
  purchasePrice: number;
  scenario: ScenarioId;
  remodelingPercent?: number;
  adminPercentage?: number;
  customCost?: number;
}

/** Costo total de remodelacion, incluyendo la administracion del escenario 3. */
export function estimateRemodelingCost({
  purchasePrice,
  scenario,
  remodelingPercent,
  adminPercentage,
  customCost,
}: RemodelingCostInput): number {
  if (purchasePrice <= 0 && customCost == null) return 0;

  const percent = clampRemodelingPercent(scenario, remodelingPercent);
  const baseCost = customCost ?? Math.round((purchasePrice * percent) / 100);

  if (!SCENARIO_CONFIG[scenario].hasAdmin) return baseCost;

  const admin = adminPercentage ?? DEFAULT_ADMIN_PERCENT;
  return Math.round(baseCost * (1 + admin / 100));
}

/** Costo de remodelacion a partir del estado del paso 2 tal cual lo guarda el hook. */
export function estimateRemodelingCostFor(
  purchasePrice: number,
  remodeling: RemodelingScenario,
): number {
  return estimateRemodelingCost({
    purchasePrice,
    scenario: remodeling.selectedScenario,
    remodelingPercent: remodeling.remodelingPercent,
    adminPercentage: remodeling.adminPercentage,
    customCost: remodeling.customCost,
  });
}

/**
 * Precio de venta proyectado cuando se expresa como % de rentabilidad.
 * La base es precio de compra + remodelacion, igual que en el use case.
 */
export function estimateProjectedSalePrice(
  purchasePrice: number,
  remodelingCost: number,
  salePercent: number,
): number {
  if (purchasePrice <= 0) return 0;
  return Math.round((purchasePrice + remodelingCost) * (1 + salePercent / 100));
}
