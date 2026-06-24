"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import { historyApi } from "@/lib/api-client";
import { formatCOP, formatPercent } from "@/lib/formatters";
import type { AnalysisHistoryDetail } from "@/types/history.types";

// ─── helpers ────────────────────────────────────────────────────────────────

function decisionInfo(decision: string) {
  switch (decision) {
    case "comprar":
      return { text: "Comprar ✓", cls: "text-success bg-success/10 border-success/30" };
    case "evaluar":
      return { text: "Evaluar ~", cls: "text-warning bg-warning/10 border-warning/30" };
    case "no_recomendable":
      return { text: "No recomendable ✗", cls: "text-danger bg-danger/10 border-danger/30" };
    default:
      return { text: decision || "—", cls: "text-muted bg-foreground/5 border-border" };
  }
}

function ratingDot(rating: string) {
  if (rating === "excelente") return "bg-success";
  if (rating === "buena") return "bg-warning";
  return "bg-danger";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── subcomponents ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <tr>
      <td
        colSpan={999}
        className="bg-foreground/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted"
      >
        {title}
      </td>
    </tr>
  );
}

type CellVal = string | number | null | undefined;

function MetricRow({
  label,
  values,
  format,
  highlight,
  tooltip,
}: {
  label: string;
  values: CellVal[];
  format?: (v: number) => string;
  highlight?: "max" | "min";
  tooltip?: string;
}) {
  const nums = values.map((v) => (typeof v === "number" ? v : null));
  const best =
    highlight === "max"
      ? Math.max(...(nums.filter((n) => n !== null) as number[]))
      : highlight === "min"
      ? Math.min(...(nums.filter((n) => n !== null) as number[]))
      : null;

  return (
    <tr className="border-b border-border last:border-0 hover:bg-foreground/2">
      <td className="sticky left-0 z-10 min-w-[160px] bg-card px-4 py-2.5 text-xs text-muted">
        {label}
        {tooltip && (
          <span className="ml-1 cursor-help text-muted/60" title={tooltip}>
            ⓘ
          </span>
        )}
      </td>
      {values.map((v, i) => {
        const num = typeof v === "number" ? v : null;
        const isBest = best !== null && num === best;
        return (
          <td
            key={i}
            className={`px-4 py-2.5 text-center text-sm font-medium ${
              isBest
                ? "text-success"
                : "text-foreground"
            }`}
          >
            {isBest && <span className="mr-1 text-success text-xs">★</span>}
            {num !== null && format ? format(num) : v ?? "—"}
          </td>
        );
      })}
    </tr>
  );
}

// ─── main compare content ────────────────────────────────────────────────────

function CompareContent() {
  const params = useSearchParams();
  const [items, setItems] = useState<AnalysisHistoryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = params.get("ids") ?? "";
    const ids = raw.split(",").filter(Boolean);
    if (ids.length < 2) {
      setError("Necesitas seleccionar al menos 2 análisis para comparar.");
      setLoading(false);
      return;
    }
    historyApi
      .compare(ids)
      .then((data) => {
        if (data.length < 2) {
          setError("No se pudieron cargar los análisis seleccionados.");
        } else {
          setItems(data);
        }
      })
      .catch(() => setError("Error al cargar los análisis."))
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-danger">{error}</p>
        <Link href="/historial" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Volver al historial
        </Link>
      </div>
    );
  }

  const n = items.length;

  // Column width based on count
  const colWidth = n === 2 ? "w-1/2" : n === 3 ? "w-1/3" : "w-1/4";

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/historial"
              className="mb-1 flex items-center gap-1 text-xs text-muted hover:text-foreground"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Historial
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Comparación de Inmuebles</h1>
            <p className="text-sm text-muted">{n} análisis seleccionados</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">+ Nuevo Análisis</Button>
          </Link>
        </div>

        {/* Property header cards */}
        <div className={`mb-6 grid gap-4`} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {items.map((item) => {
            const dec = decisionInfo(item.result.evaluation.decision);
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="truncate text-xs text-muted">{formatDate(item.createdAt)}</p>
                <h2 className="mt-0.5 truncate text-sm font-semibold text-foreground">
                  {item.label || item.direccion || "Sin dirección"}
                </h2>
                {item.request.property.alcobas != null && (
                  <p className="mt-1 text-xs text-muted">
                    {item.request.property.alcobas} alc · {item.request.property.banos ?? "?"} baños · {item.request.property.metrosCuadrados} m²
                  </p>
                )}
                <span
                  className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${dec.cls}`}
                >
                  {dec.text}
                </span>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/historial/${item.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/3">
                <th className="sticky left-0 z-10 bg-foreground/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted min-w-[160px]">
                  Métrica
                </th>
                {items.map((item) => (
                  <th
                    key={item.id}
                    className={`${colWidth} px-4 py-3 text-center text-xs font-semibold text-foreground`}
                  >
                    <span className="block truncate">
                      {item.label || item.direccion || "Sin dirección"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ── DATOS GENERALES ── */}
              <SectionHeader title="Datos generales" />
              <MetricRow
                label="Precio de compra"
                values={items.map((i) => i.precioCompra)}
                format={formatCOP}
                highlight="min"
                tooltip="Precio de adquisición del inmueble"
              />
              <MetricRow
                label="Precio venta proy."
                values={items.map((i) => i.precioVenta)}
                format={formatCOP}
                highlight="max"
                tooltip="Precio de venta proyectado"
              />
              <MetricRow
                label="Área (m²)"
                values={items.map((i) => i.request.property.metrosCuadrados)}
                format={(v) => `${v} m²`}
                highlight="max"
              />
              <MetricRow
                label="Alcobas"
                values={items.map((i) => i.request.property.alcobas ?? null)}
                highlight="max"
              />
              <MetricRow
                label="Baños"
                values={items.map((i) => i.request.property.banos ?? null)}
                highlight="max"
              />
              <MetricRow
                label="Meses proyect. venta"
                values={items.map((i) => i.request.property.mesesProyectadosVenta)}
                format={(v) => `${v} meses`}
                highlight="min"
                tooltip="Tiempo estimado para vender el inmueble"
              />

              {/* ── COSTOS DEL PROYECTO ── */}
              <SectionHeader title="Costos del proyecto" />
              <MetricRow
                label="Costo remodelación"
                values={items.map((i) => i.result.selectedRemodelingCost.totalCost)}
                format={formatCOP}
                highlight="min"
              />
              <MetricRow
                label="Gastos notariales"
                values={items.map((i) => i.result.projectCosts.notaryFees)}
                format={formatCOP}
                highlight="min"
              />
              <MetricRow
                label="Comisión corredor"
                values={items.map((i) => i.result.projectCosts.brokerCommission)}
                format={formatCOP}
                highlight="min"
              />
              <MetricRow
                label="Costo total proyecto"
                values={items.map((i) => i.result.projectCosts.totalProjectCost)}
                format={formatCOP}
                highlight="min"
                tooltip="Compra + remodelación + gastos"
              />

              {/* ── RENTABILIDAD ── */}
              <SectionHeader title="Rentabilidad" />
              <MetricRow
                label="Ganancia bruta"
                values={items.map((i) => i.result.profitability.grossProfit)}
                format={formatCOP}
                highlight="max"
                tooltip="Precio venta − costo total del proyecto"
              />
              <MetricRow
                label="ROI"
                values={items.map((i) => i.result.profitability.roi)}
                format={formatPercent}
                highlight="max"
                tooltip="Retorno sobre la inversión total"
              />
              <MetricRow
                label="Arriendo proyectado"
                values={items.map((i) => i.request.property.arriendoProyectado)}
                format={formatCOP}
                highlight="max"
              />
              <MetricRow
                label="Ingreso anual arriendo"
                values={items.map((i) => i.result.profitability.annualRentalIncome)}
                format={formatCOP}
                highlight="max"
              />
              <MetricRow
                label="Cap Rate (arriendo)"
                values={items.map((i) => i.result.profitability.capRate)}
                format={formatPercent}
                highlight="max"
                tooltip="Rentabilidad anual por arriendo sobre el costo total del proyecto"
              />

              {/* ── EVALUACIÓN ── */}
              <SectionHeader title="Evaluación" />
              <tr className="border-b border-border hover:bg-foreground/2">
                <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-xs text-muted">
                  Zona / Entorno
                </td>
                {items.map((item) => (
                  <td key={item.id} className="px-4 py-2.5 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-sm">
                      <span
                        className={`h-2 w-2 rounded-full ${ratingDot(item.result.evaluation.zoneRating)}`}
                      />
                      <span className="capitalize text-foreground">
                        {item.result.qualitative.average.toFixed(1)}/3
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border hover:bg-foreground/2">
                <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-xs text-muted">
                  Calificación ROI
                </td>
                {items.map((item) => (
                  <td key={item.id} className="px-4 py-2.5 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-sm capitalize text-foreground">
                      <span className={`h-2 w-2 rounded-full ${ratingDot(item.result.evaluation.roiRating)}`} />
                      {item.result.evaluation.roiRating}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border hover:bg-foreground/2">
                <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-xs text-muted">
                  Decisión recomendada
                </td>
                {items.map((item) => {
                  const dec = decisionInfo(item.result.evaluation.decision);
                  return (
                    <td key={item.id} className="px-4 py-2.5 text-center">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${dec.cls}`}
                      >
                        {dec.text}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <p className="mt-3 text-center text-xs text-muted">
          <span className="mr-1 text-success">★</span>Mejor valor entre los inmuebles comparados
        </p>
      </main>
    </>
  );
}

export default function CompararPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </ProtectedRoute>
  );
}
