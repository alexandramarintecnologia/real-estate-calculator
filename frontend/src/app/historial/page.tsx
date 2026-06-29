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
import type { AnalysisHistoryItem, PaginatedHistory } from "@/types/history.types";

function decisionLabel(decision: string) {
  switch (decision) {
    case "comprar":
      return { text: "Comprar", className: "bg-success/10 text-success border-success/20" };
    case "evaluar":
      return { text: "Evaluar", className: "bg-warning/10 text-warning border-warning/20" };
    case "no_recomendable":
      return { text: "No recomendable", className: "bg-danger/10 text-danger border-danger/20" };
    default:
      return { text: decision || "—", className: "bg-foreground/5 text-muted border-border" };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryContent() {
  const [data, setData] = useState<PaginatedHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await historyApi.list(page, 10, debouncedSearch || undefined);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (item: AnalysisHistoryItem) => {
    if (!confirm(`¿Eliminar el análisis "${item.label}"?`)) return;
    try {
      await historyApi.remove(item.id);
      fetchHistory();
    } catch { /* noop */ }
  };

  const handleSaveLabel = async (id: string) => {
    if (!editLabel.trim()) return;
    try {
      await historyApi.updateLabel(id, editLabel.trim());
      setEditingId(null);
      fetchHistory();
    } catch { /* noop */ }
  };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historial de Análisis</h1>
            <p className="text-sm text-muted">
              {data ? `${data.total} análisis guardado(s)` : "Cargando..."}
            </p>
          </div>
          <Link href="/">
            <Button>+ Nuevo Análisis</Button>
          </Link>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por dirección o etiqueta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-sm"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {!loading && data && data.data.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <p className="text-lg font-medium text-foreground">No hay análisis guardados</p>
              <p className="mt-1 text-sm text-muted">
                Realiza tu primer análisis desde la calculadora y aparecerá aquí automáticamente.
              </p>
            </div>
          </Card>
        )}

        {!loading && data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((item) => {
              const badge = decisionLabel(item.decision);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-card-hover"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveLabel(item.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full rounded-lg border border-primary bg-card px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveLabel(item.id)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-muted hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {item.label || item.direccion || "Sin dirección"}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditLabel(item.label || item.direccion || "");
                            }}
                            className="shrink-0 text-muted transition-colors hover:text-primary"
                            title="Renombrar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <p className="mt-0.5 text-xs text-muted">{formatDate(item.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="text-center">
                        <p className="text-muted">Compra</p>
                        <p className="font-medium text-foreground">{formatCOP(item.precioCompra)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted">Venta</p>
                        <p className="font-medium text-foreground">{formatCOP(item.precioVenta)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted">ROI</p>
                        <p className={`font-bold ${item.roi >= 0 ? "text-success" : "text-danger"}`}>
                          {formatPercent(item.roi)}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <Link
                      href={`/historial/${item.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Ver detalle
                    </Link>
                    <span className="text-muted">·</span>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-xs font-medium text-danger hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="text-xs text-muted">
              Página {data.page} de {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default function HistorialPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
