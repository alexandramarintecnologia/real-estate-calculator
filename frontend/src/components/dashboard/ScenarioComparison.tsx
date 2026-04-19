import { formatCOP } from "@/lib/formatters";
import type { RemodelingCost } from "@/types/analysis.types";

const scenarioLabels: Record<number, string> = {
  1: "Empresa todo costo",
  2: "Solo mano de obra",
  3: "Administrador de obra",
};

interface ScenarioComparisonProps {
  scenarios: RemodelingCost[];
  selectedScenario: number;
}

export default function ScenarioComparison({
  scenarios,
  selectedScenario,
}: ScenarioComparisonProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Comparación de Escenarios de Remodelación
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {scenarios.map((s) => (
          <div
            key={s.scenario}
            className={`rounded-lg border p-4 transition-colors ${
              s.scenario === selectedScenario
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border"
            }`}
          >
            <p className="text-xs font-medium text-muted">Escenario {s.scenario}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {scenarioLabels[s.scenario]}
            </p>
            <p className="mt-2 text-xs text-muted">Costo/m²</p>
            <p className="text-sm font-medium">{formatCOP(s.costPerM2)}</p>
            <p className="mt-2 text-xs text-muted">Total</p>
            <p className="text-lg font-bold text-foreground">{formatCOP(s.totalCost)}</p>
            {s.adminPercentage && (
              <p className="mt-1 text-xs text-muted">Admin: {s.adminPercentage}%</p>
            )}
            {s.scenario === selectedScenario && (
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Seleccionado
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
