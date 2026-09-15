import { Injectable } from '@nestjs/common';
import { FULL_REMODEL_PERCENT } from '../constants/budget-tiers.constants.js';
import { ACTIVE_AREAS } from '../constants/remodeling-areas.constants.js';
import type { AreaCost } from '../types/remodeling-estimate.type.js';

/** Montos fijados a mano para un area, en pesos. */
export type AreaAmountOverrides = Record<string, number>;

const TOTAL_CATALOG_WEIGHT = ACTIVE_AREAS.reduce((sum, a) => sum + a.weight, 0);

@Injectable()
export class AreaCostCalculator {
  /**
   * Cuanto cuesta cada area seleccionada.
   *
   * El costo de un area es su peso relativo dentro del catalogo completo,
   * aplicado sobre el costo de una remodelacion integral. Asi, marcar mas zonas
   * sube el monto necesario, que es justo lo que el usuario quiere saber.
   */
  calculate(
    basePrice: number,
    selectedAreaIds: string[],
    overrides: AreaAmountOverrides = {},
  ): AreaCost[] {
    const wanted = new Set(selectedAreaIds);

    // Se recorre el catalogo y no la seleccion: conserva el orden de los grupos
    // e ignora de paso ids desconocidos o repetidos.
    const selected = ACTIVE_AREAS.filter((area) => wanted.has(area.id));
    const automatic = selected.filter((a) => !this.isManual(overrides, a.id));

    // Los montos automaticos se calculan contra un total exacto y se reparten
    // con resto mayor. Redondear area por area desviaba la suma: marcar todo el
    // catalogo daba un peso de mas y el ancla del 25% no cuadraba.
    const autoTotal = this.exactCost(
      basePrice,
      automatic.reduce((sum, a) => sum + a.weight, 0),
    );
    const autoAmounts = this.splitByWeight(autoTotal, automatic);

    return selected.map((area) => {
      const isManual = this.isManual(overrides, area.id);
      return {
        area: area.id,
        label: area.label,
        group: area.group,
        weight: area.weight,
        amount: isManual
          ? Math.round(overrides[area.id])
          : (autoAmounts.get(area.id) ?? 0),
        /** Lo que costaria el area sin el ajuste manual, para poder compararlo. */
        referenceAmount: this.exactCost(basePrice, area.weight),
        isManual,
      };
    });
  }

  /** Porcentaje del catalogo que cubre la seleccion, por peso. */
  coverage(selectedAreaIds: string[]): number {
    const wanted = new Set(selectedAreaIds);
    const selectedWeight = ACTIVE_AREAS.filter((a) => wanted.has(a.id)).reduce(
      (sum, a) => sum + a.weight,
      0,
    );
    return Math.round((selectedWeight / TOTAL_CATALOG_WEIGHT) * 1000) / 10;
  }

  /** Costo exacto que corresponde a un peso dado, redondeado a pesos. */
  private exactCost(basePrice: number, weight: number): number {
    return Math.round(
      (basePrice * FULL_REMODEL_PERCENT * weight) / (100 * TOTAL_CATALOG_WEIGHT),
    );
  }

  /** Reparto proporcional al peso, con resto mayor para que la suma cuadre. */
  private splitByWeight(
    amount: number,
    areas: { id: string; weight: number }[],
  ): Map<string, number> {
    const result = new Map<string, number>();
    if (areas.length === 0 || amount <= 0) {
      areas.forEach((a) => result.set(a.id, 0));
      return result;
    }

    const weightSum = areas.reduce((sum, a) => sum + a.weight, 0);
    let assigned = 0;
    const parts = areas.map((a) => {
      const exact = weightSum > 0 ? (amount * a.weight) / weightSum : 0;
      const base = Math.floor(exact);
      assigned += base;
      return { id: a.id, base, remainder: exact - base };
    });

    parts.sort((a, b) => b.remainder - a.remainder);
    let leftover = amount - assigned;
    for (const part of parts) {
      if (leftover <= 0) break;
      part.base += 1;
      leftover -= 1;
    }

    parts.forEach((p) => result.set(p.id, p.base));
    return result;
  }

  private isManual(overrides: AreaAmountOverrides, id: string): boolean {
    const value = overrides[id];
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }
}
