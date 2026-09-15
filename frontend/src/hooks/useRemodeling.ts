"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { remodelingApi } from "@/lib/api-client";
import type {
  AreaCatalog,
  BasePriceSource,
  PercentOverrides,
  RemodelingEstimate,
} from "@/types/remodeling.types";

export interface RemodelingInputState {
  basePrice?: number;
  basePriceSource: BasePriceSource;
  /** Analisis del historial del que se tomo el precio, si aplica. */
  analysisId?: string;
  /** Etiqueta del analisis elegido, solo para mostrarla en la vista. */
  analysisLabel?: string;
  /** Areas que el usuario quiere remodelar. */
  selectedAreas: string[];
  /** Montos fijados a mano por area. Las demas usan su costo de referencia. */
  areaAmounts: Record<string, number>;
  /** Ajuste de los porcentajes de los niveles de referencia. */
  percentOverrides: PercentOverrides;
}

const INITIAL_STATE: RemodelingInputState = {
  basePriceSource: "manual",
  selectedAreas: [],
  areaAmounts: {},
  percentOverrides: {},
};

/**
 * Estado del modulo de remodelaciones.
 *
 * El flujo va de las areas al monto: el usuario fija el costo del apartamento,
 * marca que quiere remodelar y el backend responde cuanto necesita y que nivel
 * de presupuesto lo cubre. El calculo vive del lado del servidor para que no
 * exista una segunda copia de los pesos que se pueda desincronizar.
 */
export function useRemodeling() {
  const [input, setInput] = useState<RemodelingInputState>(INITIAL_STATE);
  const [estimate, setEstimate] = useState<RemodelingEstimate | null>(null);
  const [catalog, setCatalog] = useState<AreaCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los campos numericos emiten en cada tecla. Sin esto, escribir un monto
  // dispara una peticion por caracter y la vista se rearma con cada respuesta.
  const recalcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El catalogo de areas es estatico y hace falta antes de calcular, porque el
  // usuario elige sobre el. Se pide una sola vez al montar.
  useEffect(() => {
    let cancelled = false;
    remodelingApi
      .areas()
      .then((result) => {
        if (!cancelled) setCatalog(result);
      })
      .catch(() => {
        if (!cancelled) setCatalog({ groups: [], areas: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Calcula con un estado explicito, para poder recalcular desde un handler. */
  const calculateWith = useCallback(async (state: RemodelingInputState) => {
    if (!state.basePrice || state.basePrice <= 0) {
      setError("Ingresá el costo del apartamento antes de calcular.");
      return;
    }
    if (state.selectedAreas.length === 0) {
      setError("Marcá al menos un área para saber cuánto necesitás.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setEstimate(
        await remodelingApi.estimate({
          basePrice: state.basePrice,
          basePriceSource: state.basePriceSource,
          analysisId: state.analysisId,
          selectedAreas: state.selectedAreas,
          areaAmounts: state.areaAmounts,
          percentOverrides: state.percentOverrides,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo calcular el presupuesto.");
      setEstimate(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculate = useCallback(() => calculateWith(input), [calculateWith, input]);

  const patchInput = useCallback((patch: Partial<RemodelingInputState>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  }, []);

  /**
   * Aplica el cambio y recalcula, pero solo si ya hay un resultado en pantalla.
   * Antes del primer calculo el usuario todavia esta armando la seleccion.
   */
  const patchAndRecalculate = useCallback(
    (patch: Partial<RemodelingInputState>) => {
      const next = { ...input, ...patch };
      setInput(next);
      if (estimate) void calculateWith(next);
    },
    [input, estimate, calculateWith],
  );

  /**
   * Igual que patchAndRecalculate pero agrupando: el estado se actualiza ya
   * (el campo responde al instante) y el recalculo espera a que dejes de
   * escribir. Para los campos que se tipean caracter a caracter.
   */
  const patchAndRecalculateDebounced = useCallback(
    (patch: Partial<RemodelingInputState>) => {
      const next = { ...input, ...patch };
      setInput(next);
      if (!estimate) return;

      if (recalcTimer.current) clearTimeout(recalcTimer.current);
      recalcTimer.current = setTimeout(() => {
        void calculateWith(next);
      }, 400);
    },
    [input, estimate, calculateWith],
  );

  const toggleArea = useCallback(
    (areaId: string) => {
      const isSelected = input.selectedAreas.includes(areaId);
      const selectedAreas = isSelected
        ? input.selectedAreas.filter((id) => id !== areaId)
        : [...input.selectedAreas, areaId];

      // Al desmarcar un area su monto manual deja de tener sentido.
      const areaAmounts = { ...input.areaAmounts };
      if (isSelected) delete areaAmounts[areaId];

      patchAndRecalculate({ selectedAreas, areaAmounts });
    },
    [input, patchAndRecalculate],
  );

  const selectGroup = useCallback(
    (areaIds: string[], select: boolean) => {
      const current = new Set(input.selectedAreas);
      areaIds.forEach((id) => (select ? current.add(id) : current.delete(id)));

      const areaAmounts = { ...input.areaAmounts };
      if (!select) areaIds.forEach((id) => delete areaAmounts[id]);

      patchAndRecalculate({ selectedAreas: [...current], areaAmounts });
    },
    [input, patchAndRecalculate],
  );

  const setAreaAmount = useCallback(
    (areaId: string, amount: number | undefined) => {
      const areaAmounts = { ...input.areaAmounts };
      if (amount == null) {
        delete areaAmounts[areaId];
      } else {
        areaAmounts[areaId] = amount;
      }
      patchAndRecalculateDebounced({ areaAmounts });
    },
    [input, patchAndRecalculateDebounced],
  );

  const setBasePriceSource = useCallback((source: BasePriceSource) => {
    setInput((prev) => ({
      ...prev,
      basePriceSource: source,
      basePrice: undefined,
      analysisId: undefined,
      analysisLabel: undefined,
    }));
    setEstimate(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recalcTimer.current) clearTimeout(recalcTimer.current);
    };
  }, []);

  const reset = useCallback(() => {
    setInput(INITIAL_STATE);
    setEstimate(null);
    setError(null);
  }, []);

  return {
    input,
    patchInput,
    patchAndRecalculate,
    patchAndRecalculateDebounced,
    setBasePriceSource,
    toggleArea,
    selectGroup,
    setAreaAmount,
    catalog,
    estimate,
    isLoading,
    error,
    calculate,
    reset,
  };
}
