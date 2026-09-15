"use client";

import { useState, useCallback } from "react";
import { calculateAnalysis } from "@/lib/api-client";
import {
  estimateProjectedSalePrice,
  estimateRemodelingCostFor,
} from "@/lib/remodeling-estimate";
import { QualitativeScore } from "@/types/analysis.types";
import type {
  PropertyData,
  RemodelingScenario,
  ProjectExpenses,
  QualitativeEvaluation,
  AnalysisResult,
  AnalysisRequest,
} from "@/types/analysis.types";

const defaultProperty: PropertyData = {
  metrosCuadrados: 0,
  m2Remodelacion: 0,
  parqueadero: false,
  gastosPosesionMensual: 0,
  precioCompra: 0,
  arriendoProyectado: 0,
  arriendoType: "percent",
  arriendoPercent: 7,
  precioVentaProyectado: 0,
  precioVentaType: "percent",
  precioVentaPercent: 30,
  mesesProyectadosVenta: 6,
};

const defaultRemodeling: RemodelingScenario = {
  selectedScenario: 1,
  remodelingPercent: 32,
};

const defaultExpenses: ProjectExpenses = {
  notaryFeesValue: 3,
  notaryFeesType: "percent",
  brokerCommissionValue: 1,
  brokerCommissionType: "percent",
};

const defaultQualitative: QualitativeEvaluation = {
  entorno: QualitativeScore.BUENO,
  accesibilidad: QualitativeScore.BUENO,
  transporte: QualitativeScore.BUENO,
  seguridad: QualitativeScore.BUENO,
  comercioOcio: QualitativeScore.BUENO,
  documentacion: QualitativeScore.BUENO,
};

export function useAnalysis() {
  const [step, setStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);
  const [property, setProperty] = useState<PropertyData>(defaultProperty);
  const [remodeling, setRemodeling] = useState<RemodelingScenario>(defaultRemodeling);
  const [expenses, setExpenses] = useState<ProjectExpenses>(defaultExpenses);
  const [qualitative, setQualitative] = useState<QualitativeEvaluation>(defaultQualitative);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Al cambiar el escenario o el % de remodelacion cambia la base del precio de
   * venta (compra + remodelacion), asi que lo resincronizamos. Sin esto el paso 1
   * mostraba un precio calculado con el 32% por defecto aunque despues se eligiera
   * un escenario del 15%, y el backend devolvia otro numero.
   */
  const updateRemodeling = useCallback((next: RemodelingScenario) => {
    setRemodeling(next);
    setProperty((prev) => {
      if ((prev.precioVentaType ?? "percent") !== "percent") return prev;

      const remodelingCost = estimateRemodelingCostFor(prev.precioCompra, next);
      const precioVentaProyectado = estimateProjectedSalePrice(
        prev.precioCompra,
        remodelingCost,
        prev.precioVentaPercent ?? 30,
      );

      if (prev.precioVentaProyectado === precioVentaProyectado) return prev;
      return { ...prev, precioVentaProyectado };
    });
  }, []);

  const goNext = useCallback(() => {
    setStep((s) => {
      const nextStep = Math.min(s + 1, 5);
      setHighestStep((h) => Math.max(h, nextStep));
      return nextStep;
    });
  }, []);

  const goPrev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goTo = useCallback((s: number) => setStep(Math.max(1, Math.min(5, s))), []);

  const submitAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Limpiamos propiedades antiguas que puedan quedar cacheadas por el hot-reload de React
    const cleanExpenses = {
      notaryFeesValue: expenses.notaryFeesValue,
      notaryFeesType: expenses.notaryFeesType,
      brokerCommissionValue: expenses.brokerCommissionValue,
      brokerCommissionType: expenses.brokerCommissionType,
      otherExpenses: expenses.otherExpenses,
    };

    const request: AnalysisRequest = { property, remodeling, expenses: cleanExpenses, qualitative };

    try {
      const data = await calculateAnalysis(request);
      setResult(data);
      setStep(5);
      setHighestStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  }, [property, remodeling, expenses, qualitative]);

  const reset = useCallback(() => {
    setStep(1);
    setHighestStep(1);
    setProperty(defaultProperty);
    setRemodeling(defaultRemodeling);
    setExpenses(defaultExpenses);
    setQualitative(defaultQualitative);
    setResult(null);
    setError(null);
  }, []);

  return {
    step,
    highestStep,
    goNext,
    goPrev,
    goTo,
    property,
    setProperty,
    remodeling,
    setRemodeling: updateRemodeling,
    expenses,
    setExpenses,
    qualitative,
    setQualitative,
    result,
    isLoading,
    error,
    submitAnalysis,
    reset,
  };
}
