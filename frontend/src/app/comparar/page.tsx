"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { historyApi } from "@/lib/api-client";
import { formatCOP, formatPercent } from "@/lib/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import type { AnalysisHistoryItem, AnalysisHistoryDetail, PaginatedHistory } from "@/types/history.types";

// ─── Constants ──────────────────────────────────────────────────────────────

const SCORE_WEIGHTS = { roi: 0.40, capRate: 0.25, zone: 0.20, costEfficiency: 0.15 };

// ─── Scoring engine ──────────────────────────────────────────────────────────

interface PropertyScore {
  total: number;
  roi: number;
  capRate: number;
  zone: number;
  costEfficiency: number;
}

function normalize(val: number, min: number, max: number): number {
  if (max === min) return 100;
  return Math.round(((val - min) / (max - min)) * 100);
}

function computeScores(items: AnalysisHistoryDetail[]): PropertyScore[] {
  const rois = items.map((i) => i.result.profitability.roi);
  const caps = items.map((i) => i.result.profitability.capRate);
  const zones = items.map((i) => i.result.qualitative.average);
  const costs = items.map((i) => i.result.projectCosts.totalProjectCost);

  const minRoi = Math.min(...rois), maxRoi = Math.max(...rois);
  const minCap = Math.min(...caps), maxCap = Math.max(...caps);
  const minZone = Math.min(...zones), maxZone = Math.max(...zones);
  const minCost = Math.min(...costs), maxCost = Math.max(...costs);

  return items.map((item) => {
    const roi = normalize(item.result.profitability.roi, minRoi, maxRoi);
    const capRate = normalize(item.result.profitability.capRate, minCap, maxCap);
    const zone = normalize(item.result.qualitative.average, minZone, maxZone);
    // Lower cost = better
    const costEfficiency = normalize(maxCost - item.result.projectCosts.totalProjectCost, 0, maxCost - minCost);
    const total = Math.round(
      roi * SCORE_WEIGHTS.roi +
      capRate * SCORE_WEIGHTS.capRate +
      zone * SCORE_WEIGHTS.zone +
      costEfficiency * SCORE_WEIGHTS.costEfficiency,
    );
    return { total, roi, capRate, zone, costEfficiency };
  });
}

// ─── Report insights generator ───────────────────────────────────────────────

function buildInsights(items: AnalysisHistoryDetail[], scores: PropertyScore[]): string[] {
  const insights: string[] = [];
  const winnerIdx = scores.indexOf(scores.reduce((a, b) => (a.total >= b.total ? a : b)));
  const winner = items[winnerIdx];
  const winnerName = winner.label || winner.direccion || `Inmueble ${winnerIdx + 1}`;

  // ROI comparison
  const sortedByRoi = [...items].sort(
    (a, b) => b.result.profitability.roi - a.result.profitability.roi,
  );
  if (sortedByRoi[0].result.profitability.roi > sortedByRoi[sortedByRoi.length - 1].result.profitability.roi) {
    const best = sortedByRoi[0];
    const worst = sortedByRoi[sortedByRoi.length - 1];
    const diff = best.result.profitability.roi - worst.result.profitability.roi;
    insights.push(
      `${best.label || best.direccion || "Inmueble"} ofrece el mayor retorno sobre inversión con un ROI de ${best.result.profitability.roi.toFixed(2)}%, superando en ${diff.toFixed(2)} puntos porcentuales al de menor rendimiento.`,
    );
  }

  // Cap Rate comparison
  const sortedByCap = [...items].sort(
    (a, b) => b.result.profitability.capRate - a.result.profitability.capRate,
  );
  if (sortedByCap[0].result.profitability.capRate > sortedByCap[sortedByCap.length - 1].result.profitability.capRate) {
    const best = sortedByCap[0];
    insights.push(
      `En rentabilidad por arriendo, ${best.label || best.direccion || "Inmueble"} tiene el mejor Cap Rate (${best.result.profitability.capRate.toFixed(2)}%), lo que lo posiciona como la mejor opción de Plan B en caso de no venta inmediata.`,
    );
  }

  // Cost comparison
  const sortedByCost = [...items].sort(
    (a, b) => a.result.projectCosts.totalProjectCost - b.result.projectCosts.totalProjectCost,
  );
  if (sortedByCost[0].result.projectCosts.totalProjectCost < sortedByCost[sortedByCost.length - 1].result.projectCosts.totalProjectCost) {
    const cheapest = sortedByCost[0];
    const costDiff = sortedByCost[sortedByCost.length - 1].result.projectCosts.totalProjectCost - cheapest.result.projectCosts.totalProjectCost;
    insights.push(
      `${cheapest.label || cheapest.direccion || "Inmueble"} requiere la menor inversión total (${formatCOP(cheapest.result.projectCosts.totalProjectCost)}), ${formatCOP(costDiff)} menos que el más costoso, lo que reduce el capital en riesgo.`,
    );
  }

  // Zone comparison
  const sortedByZone = [...items].sort(
    (a, b) => b.result.qualitative.average - a.result.qualitative.average,
  );
  if (sortedByZone[0].result.qualitative.average > sortedByZone[sortedByZone.length - 1].result.qualitative.average) {
    const bestZone = sortedByZone[0];
    insights.push(
      `En evaluación cualitativa de zona, ${bestZone.label || bestZone.direccion || "Inmueble"} destaca con ${bestZone.result.qualitative.average.toFixed(1)}/3 puntos — factores como ubicación, accesibilidad y seguridad influyen directamente en la velocidad de venta y el precio de cierre.`,
    );
  }

  // Recommendation
  insights.push(
    `Considerando ROI (40%), rentabilidad por arriendo (25%), evaluación de zona (20%) y eficiencia de inversión (15%), ${winnerName} obtiene la mayor puntuación compuesta y es la opción más recomendable en esta comparación.`,
  );

  return insights;
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function decisionBadge(decision: string) {
  switch (decision) {
    case "comprar": return { text: "Comprar", cls: "text-success bg-success/10 border-success/30" };
    case "evaluar": return { text: "Evaluar", cls: "text-warning bg-warning/10 border-warning/30" };
    case "no_recomendable": return { text: "No recomendable", cls: "text-danger bg-danger/10 border-danger/30" };
    default: return { text: decision || "—", cls: "text-muted bg-foreground/5 border-border" };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function ScoreBar({ label, value, isBest }: { label: string; value: number; isBest: boolean }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className={`font-semibold ${isBest ? "text-success" : "text-foreground"}`}>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isBest ? "bg-success" : "bg-primary/60"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── STEP 1 — Selector ───────────────────────────────────────────────────────

function SelectorStep({
  onCompare,
}: {
  onCompare: (ids: string[]) => void;
}) {
  const [data, setData] = useState<PaginatedHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await historyApi.list(page, 12, debouncedSearch || undefined);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 4) { next.add(id); }
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Comparar Inmuebles</h1>
        <p className="mt-1 text-sm text-muted">
          Selecciona entre 2 y 4 análisis para generar un reporte comparativo detallado.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Buscar por dirección o etiqueta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-sm"
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          {selected.size > 0 && (
            <span className="text-sm text-muted">{selected.size} seleccionado(s)</span>
          )}
          <Button
            onClick={() => onCompare(Array.from(selected))}
            disabled={selected.size < 2}
            size="sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            Generar Reporte
          </Button>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} className="text-xs text-muted hover:text-foreground">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      )}

      {!loading && data && data.data.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <p className="text-base font-medium text-foreground">No hay análisis disponibles</p>
            <p className="mt-1 text-sm text-muted">Realiza al menos 2 análisis para poder compararlos.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
              Ir a la calculadora →
            </Link>
          </div>
        </Card>
      )}

      {!loading && data && data.data.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((item: AnalysisHistoryItem) => {
              const isSelected = selected.has(item.id);
              const badge = decisionBadge(item.decision);
              const disabled = !isSelected && selected.size >= 4;
              return (
                <button
                  key={item.id}
                  onClick={() => !disabled && toggle(item.id)}
                  className={`relative w-full rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : disabled
                      ? "cursor-not-allowed border-border bg-card opacity-50"
                      : "border-border bg-card hover:border-primary/30 hover:bg-card-hover"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    </span>
                  )}
                  <p className="text-[10px] text-muted">{formatDate(item.createdAt)}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {item.label || item.direccion || "Sin dirección"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted">{formatCOP(item.precioCompra)}</span>
                    <span className={`font-bold ${item.roi >= 0 ? "text-success" : "text-danger"}`}>
                      ROI {formatPercent(item.roi)}
                    </span>
                  </div>
                  <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                    {badge.text}
                  </span>
                </button>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 disabled:opacity-50">
                ← Anterior
              </button>
              <span className="text-xs text-muted">Página {data.page} de {data.totalPages}</span>
              <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 disabled:opacity-50">
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── STEP 2 — Professional Report ────────────────────────────────────────────

function ReportStep({
  ids,
  onBack,
}: {
  ids: string[];
  onBack: () => void;
}) {
  const [items, setItems] = useState<AnalysisHistoryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    historyApi
      .compare(ids)
      .then((data) => {
        if (data.length < 2) setError("No se pudieron cargar los análisis seleccionados.");
        else setItems(data);
      })
      .catch(() => setError("Error al cargar los análisis."))
      .finally(() => setLoading(false));
  }, [ids]);

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
        <button onClick={onBack} className="mt-4 text-sm text-primary hover:underline">← Volver a selección</button>
      </div>
    );
  }

  const scores = computeScores(items);
  const winnerIdx = scores.indexOf(scores.reduce((a, b) => (a.total >= b.total ? a : b)));
  const insights = buildInsights(items, scores);
  const n = items.length;

  const maxScores = {
    roi: Math.max(...scores.map((s) => s.roi)),
    capRate: Math.max(...scores.map((s) => s.capRate)),
    zone: Math.max(...scores.map((s) => s.zone)),
    costEfficiency: Math.max(...scores.map((s) => s.costEfficiency)),
    total: Math.max(...scores.map((s) => s.total)),
  };

  type MetricRow = {
    label: string;
    key: "roi" | "capRate" | "zone" | "costEfficiency";
    weight: string;
  };

  const scoreRows: MetricRow[] = [
    { label: "Retorno de inversión (ROI)", key: "roi", weight: "40%" },
    { label: "Rentabilidad por arriendo (Cap Rate)", key: "capRate", weight: "25%" },
    { label: "Evaluación de zona", key: "zone", weight: "20%" },
    { label: "Eficiencia del capital", key: "costEfficiency", weight: "15%" },
  ];

  type CompareRow = {
    label: string;
    get: (item: AnalysisHistoryDetail) => number | string | null;
    format?: (v: number) => string;
    highlight?: "max" | "min";
    tooltip?: string;
    section?: string;
  };

  const compareRows: CompareRow[] = [
    { section: "Datos generales", label: "Precio de compra", get: (i) => i.precioCompra, format: formatCOP, highlight: "min" },
    { label: "Precio venta proyectado", get: (i) => i.precioVenta, format: formatCOP, highlight: "max" },
    { label: "Área (m²)", get: (i) => i.request.property.metrosCuadrados, format: (v) => `${v} m²`, highlight: "max" },
    { label: "Meses proyect. para venta", get: (i) => i.request.property.mesesProyectadosVenta, format: (v) => `${v} m.`, highlight: "min", tooltip: "Tiempo estimado hasta vender" },
    { section: "Costos del proyecto", label: "Costo remodelación", get: (i) => i.result.selectedRemodelingCost.totalCost, format: formatCOP, highlight: "min" },
    { label: "Gastos notariales", get: (i) => i.result.projectCosts.notaryFees, format: formatCOP, highlight: "min" },
    { label: "Costo total del proyecto", get: (i) => i.result.projectCosts.totalProjectCost, format: formatCOP, highlight: "min", tooltip: "Compra + remodelación + gastos" },
    { section: "Rentabilidad", label: "Ganancia bruta", get: (i) => i.result.profitability.grossProfit, format: formatCOP, highlight: "max", tooltip: "Precio venta − costo total" },
    { label: "ROI", get: (i) => i.result.profitability.roi, format: formatPercent, highlight: "max", tooltip: "Retorno sobre inversión total" },
    { label: "Arriendo proyectado / mes", get: (i) => i.request.property.arriendoProyectado, format: formatCOP, highlight: "max" },
    { label: "Cap Rate anual", get: (i) => i.result.profitability.capRate, format: formatPercent, highlight: "max", tooltip: "Rentabilidad anual por arriendo" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-1 flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Cambiar selección
          </button>
          <h1 className="text-2xl font-bold text-foreground">Reporte Comparativo</h1>
          <p className="text-sm text-muted">{n} inmuebles analizados · {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Imprimir / PDF
        </button>
      </div>

      {/* ── GANADOR RECOMENDADO ── */}
      <div className="mb-6 rounded-2xl border-2 border-success/40 bg-success/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success text-xl font-bold">
            ★
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-success">Opción recomendada</p>
            <h2 className="mt-0.5 text-lg font-bold text-foreground">
              {items[winnerIdx].label || items[winnerIdx].direccion || `Inmueble ${winnerIdx + 1}`}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Puntuación compuesta: <span className="font-bold text-foreground">{scores[winnerIdx].total}/100</span>
              {" · "}
              ROI <span className="font-semibold text-success">{formatPercent(items[winnerIdx].result.profitability.roi)}</span>
              {" · "}
              Cap Rate <span className="font-semibold text-success">{formatPercent(items[winnerIdx].result.profitability.capRate)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── SCORE CARDS ── */}
      <div className={`mb-6 grid gap-4`} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {items.map((item, idx) => {
          const score = scores[idx];
          const isWinner = idx === winnerIdx;
          const badge = decisionBadge(item.result.evaluation.decision);
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 ${isWinner ? "border-success/40 bg-success/5" : "border-border bg-card"}`}
            >
              {isWinner && (
                <span className="mb-2 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                  ★ Recomendado
                </span>
              )}
              <p className="text-[10px] text-muted">{formatDate(item.createdAt)}</p>
              <h3 className="mt-0.5 truncate text-sm font-bold text-foreground">
                {item.label || item.direccion || `Inmueble ${idx + 1}`}
              </h3>
              {item.request.property.alcobas != null && (
                <p className="mt-0.5 text-[10px] text-muted">
                  {item.request.property.alcobas} alc · {item.request.property.banos ?? "?"} baños · {item.request.property.metrosCuadrados} m²
                </p>
              )}

              {/* Puntuación total */}
              <div className="my-3 text-center">
                <p className={`text-3xl font-black ${isWinner ? "text-success" : "text-foreground"}`}>
                  {score.total}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted">puntos / 100</p>
              </div>

              {/* Barras */}
              <div className="space-y-2.5">
                {scoreRows.map((row) => (
                  <ScoreBar
                    key={row.key}
                    label={`${row.label} (${row.weight})`}
                    value={score[row.key]}
                    isBest={score[row.key] === maxScores[row.key]}
                  />
                ))}
              </div>

              <span className={`mt-3 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── ANÁLISIS NARRATIVO ── */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Análisis del Reporte
        </h2>
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-3">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${i === insights.length - 1 ? "bg-primary text-white" : "bg-foreground/10 text-muted"}`}>
                {i + 1}
              </span>
              <p className={`text-sm leading-relaxed ${i === insights.length - 1 ? "font-medium text-foreground" : "text-muted"}`}>
                {insight}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── TABLA COMPARATIVA DETALLADA ── */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Métricas detalladas
          </h2>
        </div>
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-border bg-foreground/3">
              <th className="sticky left-0 z-10 bg-foreground/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted min-w-[180px]">
                Métrica
              </th>
              {items.map((item, idx) => (
                <th key={item.id} className="px-4 py-3 text-center text-xs font-semibold text-foreground">
                  <span className={`flex flex-col items-center gap-0.5 ${idx === winnerIdx ? "text-success" : ""}`}>
                    {idx === winnerIdx && <span className="text-[9px] font-bold uppercase tracking-wider text-success">★ Recom.</span>}
                    <span className="block truncate max-w-[140px]">{item.label || item.direccion || `Inmueble ${idx + 1}`}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row, rowIdx) => {
              const vals = items.map((item) => row.get(item));
              const nums = vals.map((v) => (typeof v === "number" ? v : null));
              const bestNum =
                row.highlight === "max"
                  ? Math.max(...(nums.filter((n) => n !== null) as number[]))
                  : row.highlight === "min"
                  ? Math.min(...(nums.filter((n) => n !== null) as number[]))
                  : null;
              return (
                <>
                  {row.section && (
                    <tr key={`section-${rowIdx}`}>
                      <td colSpan={n + 1} className="bg-foreground/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        {row.section}
                      </td>
                    </tr>
                  )}
                  <tr key={`row-${rowIdx}`} className="border-b border-border last:border-0 hover:bg-foreground/2">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-xs text-muted">
                      {row.label}
                      {row.tooltip && (
                        <span className="ml-1 cursor-help text-muted/50" title={row.tooltip}>ⓘ</span>
                      )}
                    </td>
                    {vals.map((v, ci) => {
                      const num = typeof v === "number" ? v : null;
                      const isBest = bestNum !== null && num === bestNum;
                      return (
                        <td key={ci} className={`px-4 py-2.5 text-center text-sm font-medium ${isBest ? "text-success" : "text-foreground"}`}>
                          {isBest && <span className="mr-0.5 text-success text-xs">★</span>}
                          {num !== null && row.format ? row.format(num) : (v ?? "—")}
                        </td>
                      );
                    })}
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        <span className="text-success mr-1">★</span>Mejor valor entre los inmuebles comparados · Puntuación basada en ROI (40%), Cap Rate (25%), Zona (20%), Eficiencia del capital (15%)
      </p>
    </div>
  );
}

// ─── Page shell ──────────────────────────────────────────────────────────────

function CompararContent() {
  const [step, setStep] = useState<"select" | "report">("select");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleCompare = (ids: string[]) => {
    setSelectedIds(ids);
    setStep("report");
  };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {step === "select" ? (
          <SelectorStep onCompare={handleCompare} />
        ) : (
          <ReportStep ids={selectedIds} onBack={() => setStep("select")} />
        )}
      </main>
    </>
  );
}

export default function CompararPage() {
  return (
    <ProtectedRoute>
      <CompararContent />
    </ProtectedRoute>
  );
}
