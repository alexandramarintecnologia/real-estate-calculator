/**
 * Niveles de presupuesto del modulo de remodelaciones.
 *
 * OJO: no confundir con REMODELING_SCENARIOS de `shared/constants/thresholds.constants.ts`.
 * Aquellos describen la MODALIDAD DE CONTRATACION dentro del analisis de inversion
 * (empresa todo costo / mano de obra / administrador de obra). Estos describen el
 * NIVEL DE AMBICION del presupuesto de una remodelacion, como % del costo del
 * apartamento. Son conceptos distintos y conviven sin tocarse.
 */

export type BudgetTierId = 'bajo' | 'medio' | 'alto';

export interface BudgetTierConfig {
  id: BudgetTierId;
  label: string;
  /** Porcentaje del costo del apartamento que se destina a la remodelacion. */
  defaultPercent: number;
  description: string;
}

export const BUDGET_TIERS: Record<BudgetTierId, BudgetTierConfig> = {
  bajo: {
    id: 'bajo',
    label: 'Bajo',
    defaultPercent: 10,
    description:
      'Intervencion de actualizacion. Prioriza acabados visibles y arreglos puntuales sin mover la distribucion del apartamento.',
  },
  medio: {
    id: 'medio',
    label: 'Medio',
    defaultPercent: 15,
    description:
      'Remodelacion equilibrada. Renueva areas humedas y acabados generales, con cambios menores de distribucion.',
  },
  alto: {
    id: 'alto',
    label: 'Alto',
    defaultPercent: 20,
    description:
      'Remodelacion integral. Rehace areas humedas, carpinteria y pisos, y admite cambios de distribucion.',
  },
};

export const BUDGET_TIER_IDS: BudgetTierId[] = ['bajo', 'medio', 'alto'];

/**
 * Ancla del modelo: remodelar TODAS las areas del catalogo cuesta este
 * porcentaje del apartamento, que es el tope del nivel Alto. De aqui sale el
 * costo de cada area (su peso relativo sobre el total del catalogo) y, por lo
 * tanto, el monto que se necesita segun lo que el usuario marque.
 *
 * Es el unico numero que hay que mover si el negocio dice que una remodelacion
 * integral cuesta otra cosa.
 */
export const FULL_REMODEL_PERCENT = 20;

/** Limites dentro de los que se admite ajustar el porcentaje de un nivel a mano. */
export const PERCENT_BOUNDS = { min: 1, max: 100 } as const;
