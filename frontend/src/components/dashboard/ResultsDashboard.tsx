"use client";

import { formatCOP, formatPercent } from "@/lib/formatters";
import MetricCard from "./MetricCard";
import { RatingBadge, DecisionBadge } from "./RatingBadge";
import RecommendationCard from "./RecommendationCard";
import ScenarioComparison from "./ScenarioComparison";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { AnalysisResult } from "@/types/analysis.types";

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const { profitability, projectCosts, evaluation, qualitative } = result;

  return (
    <div className="space-y-6">
      {/* Decision principal */}
      <Card className="text-center">
        <p className="text-sm text-muted">Decisión de inversión</p>
        <div className="mt-3">
          <DecisionBadge decision={evaluation.decision} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted">ROI:</span>
          <RatingBadge rating={evaluation.roiRating} />
          <span className="text-xs text-muted">Cap Rate:</span>
          <RatingBadge rating={evaluation.capRateRating} />
          <span className="text-xs text-muted">Zona:</span>
          <RatingBadge rating={evaluation.zoneRating} />
        </div>
      </Card>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ganancia Bruta"
          value={formatCOP(profitability.grossProfit)}
          subtitle="Precio venta - Costo total"
          rating={evaluation.roiRating}
        />
        <MetricCard
          title="ROI"
          value={formatPercent(profitability.roi)}
          subtitle="Retorno sobre inversión"
          rating={evaluation.roiRating}
        />
        <MetricCard
          title="Arriendo Anual"
          value={formatCOP(profitability.annualRentalIncome)}
          subtitle="Ingreso anual por arriendo"
        />
        <MetricCard
          title="Cap Rate"
          value={formatPercent(profitability.capRate)}
          subtitle="Tasa de capitalización"
          rating={evaluation.capRateRating}
        />
      </div>

      {/* Desglose de costos */}
      <Card title="Desglose del Proyecto" description="Resumen de todos los costos involucrados">
        <div className="space-y-3">
          {[
            { label: "Precio de compra", value: projectCosts.purchasePrice },
            { label: "Remodelación", value: projectCosts.remodelingCost },
            { label: "Escrituras públicas", value: projectCosts.notaryFees },
            { label: "Comisión del asesor", value: projectCosts.brokerCommission },
            { label: "Otros gastos", value: projectCosts.otherExpenses },
            { label: "Gastos de posesión total", value: projectCosts.totalOwnershipExpenses },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted">{item.label}</span>
              <span className="font-medium">{formatCOP(item.value)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Costo total del proyecto</span>
            <span className="text-lg font-bold text-foreground">
              {formatCOP(projectCosts.totalProjectCost)}
            </span>
          </div>
        </div>
      </Card>

      {/* Comparación de escenarios */}
      <ScenarioComparison
        scenarios={result.remodelingCosts}
        selectedScenario={result.selectedRemodelingCost.scenario}
      />

      {/* Evaluación cualitativa */}
      <Card title="Evaluación de Zona" description={`Promedio: ${qualitative.average.toFixed(1)} / 3.0`}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(qualitative.scores).map(([key, score]) => {
            const labels: Record<number, string> = {
              0: "Descartado",
              1: "Regular",
              2: "Bueno",
              3: "Excelente",
            };
            const colors: Record<number, string> = {
              0: "bg-danger/10 text-danger",
              1: "bg-warning/10 text-warning",
              2: "bg-primary/10 text-primary",
              3: "bg-success/10 text-success",
            };
            const factorLabels: Record<string, string> = {
              entorno: "Entorno",
              accesibilidad: "Accesibilidad",
              transporte: "Transporte",
              seguridad: "Seguridad",
              comercioOcio: "Comercio y Ocio",
              documentacion: "Documentación",
            };
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">{factorLabels[key] ?? key}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[score]}`}>
                  {labels[score]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recomendaciones */}
      <RecommendationCard recommendations={evaluation.recommendations} />

      {/* Acciones */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onReset}>
          Analizar otra propiedad
        </Button>
      </div>
    </div>
  );
}
