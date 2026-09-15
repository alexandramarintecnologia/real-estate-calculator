"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import { historyApi } from "@/lib/api-client";
import type { AnalysisHistoryDetail } from "@/types/history.types";
import ResultsDashboard from "@/components/dashboard/ResultsDashboard";

function DetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<AnalysisHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await historyApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el análisis");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <>
        <AppShell>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        </AppShell>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <AppShell>
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error || "Análisis no encontrado"}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push("/historial")}>
              ← Volver al historial
            </Button>
          </div>
        </AppShell>
      </>
    );
  }

  return (
    <>
      <AppShell>
        <div className="mb-4 flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/historial")}>
            ← Historial
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {data.label || data.direccion || "Sin dirección"}
            </h1>
            <p className="text-xs text-muted">
              {new Date(data.createdAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <ResultsDashboard
          result={data.result}
          property={data.request.property}
          onReset={() => router.push("/historial")}
        />
      </AppShell>
    </>
  );
}

export default function HistorialDetailPage() {
  return (
    <ProtectedRoute>
      <DetailContent />
    </ProtectedRoute>
  );
}
