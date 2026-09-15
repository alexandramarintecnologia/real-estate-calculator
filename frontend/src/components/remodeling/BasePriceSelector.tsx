"use client";

import { useCallback, useState } from "react";
import Card from "@/components/ui/Card";
import NumberInput from "@/components/ui/NumberInput";
import { historyApi } from "@/lib/api-client";
import { formatCOP } from "@/lib/formatters";
import type { AnalysisHistoryItem } from "@/types/history.types";
import type { BasePriceSource } from "@/types/remodeling.types";
import type { RemodelingInputState } from "@/hooks/useRemodeling";

interface BasePriceSelectorProps {
  input: RemodelingInputState;
  onPatch: (patch: Partial<RemodelingInputState>) => void;
  onSourceChange: (source: BasePriceSource) => void;
}

const SOURCES: { id: BasePriceSource; label: string; hint: string }[] = [
  { id: "manual", label: "Manual", hint: "Escribir el costo del apartamento" },
  { id: "analysis", label: "Desde un análisis", hint: "Tomarlo de la calculadora" },
];

export default function BasePriceSelector({
  input,
  onPatch,
  onSourceChange,
}: BasePriceSelectorProps) {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAnalyses = useCallback(async () => {
    setLoadError(null);
    try {
      const result = await historyApi.list(1, 20);
      setAnalyses(result.data);
    } catch {
      setAnalyses([]);
      setLoadError("No se pudieron cargar los análisis guardados.");
    }
  }, []);

  return (
    <Card
      title="Costo del apartamento"
      description="El presupuesto de remodelación se proyecta como un porcentaje de este valor."
    >
      {/* Selector de fuente */}
      <div
        role="radiogroup"
        aria-label="Origen del costo del apartamento"
        className="mb-5 grid gap-2 sm:grid-cols-2"
      >
        {SOURCES.map((source) => {
          const active = input.basePriceSource === source.id;
          return (
            <button
              key={source.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                onSourceChange(source.id);
                if (source.id === "analysis" && analyses === null) void loadAnalyses();
              }}
              className={[
                "flex min-h-11 flex-col items-start rounded-lg border px-4 py-3 text-left",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
                active
                  ? "border-primary bg-primary-softer"
                  : "border-border bg-card hover:border-primary/30 hover:bg-card-hover",
              ].join(" ")}
            >
              <span
                className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}
              >
                {source.label}
              </span>
              <span className="text-xs text-muted">{source.hint}</span>
            </button>
          );
        })}
      </div>

      {input.basePriceSource === "manual" ? (
        <NumberInput
          label="Costo del apartamento"
          value={input.basePrice}
          onChange={(value) => onPatch({ basePrice: value })}
          prefix="$"
          min={0}
          required
          placeholder="0"
          hint="Precio de compra o valor comercial del inmueble."
        />
      ) : (
        <AnalysisPicker
          analyses={analyses}
          loadError={loadError}
          selectedId={input.analysisId}
          onSelect={(item) =>
            onPatch({
              analysisId: item.id,
              analysisLabel: item.label || item.direccion || "Análisis sin nombre",
              basePrice: item.precioCompra,
            })
          }
        />
      )}
    </Card>
  );
}

// ─── Lista de análisis guardados ─────────────────────────────────────────────

function AnalysisPicker({
  analyses,
  loadError,
  selectedId,
  onSelect,
}: {
  analyses: AnalysisHistoryItem[] | null;
  loadError: string | null;
  selectedId?: string;
  onSelect: (item: AnalysisHistoryItem) => void;
}) {
  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  // Espacio reservado mientras carga, para que la tarjeta no salte de alto.
  if (analyses === null) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-card-hover" />
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todavía no hay análisis guardados. Usá la Calculadora Inmobiliaria primero, o
        cambiá a entrada manual.
      </p>
    );
  }

  return (
    <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {analyses.map((item) => {
        const active = selectedId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(item)}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "border-primary bg-primary-softer"
                  : "border-border bg-card hover:border-primary/30 hover:bg-card-hover",
              ].join(" ")}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.label || item.direccion || "Análisis sin nombre"}
                </span>
                <span className="block text-xs text-muted">
                  {new Date(item.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>
              <span
                className={`shrink-0 text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}
              >
                {formatCOP(item.precioCompra)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
