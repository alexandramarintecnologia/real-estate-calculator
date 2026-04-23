"use client";

import { useState, useCallback } from "react";
import { calculateAnalysis } from "@/lib/api-client";
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
  direccion: "",
  alcobas: 0,
  banos: 0,
  metrosCuadrados: 0,
  m2Remodelacion: 0,
  parqueadero: false,
  gastosPosesionMensual: 0,
  precioCompra: 0,
  arriendoProyectado: 0,
  precioVentaProyectado: 0,
  mesesProyectadosVenta: 6,
};

const defaultRemodeling: RemodelingScenario = {
  selectedScenario: 1,
};

const defaultExpenses: ProjectExpenses = {};

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
    setRemodeling,
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
