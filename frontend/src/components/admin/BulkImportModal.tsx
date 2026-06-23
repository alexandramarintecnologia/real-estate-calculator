"use client";

import { useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import {
  dedupeByEmail,
  parseUsersCsv,
  type CsvParseResult,
  type ParsedRow,
} from "@/lib/csv-users";
import type { BulkImportPayload, BulkImportResult } from "@/types/auth.types";

const MONTH_OPTIONS = [
  { value: 1, label: "1 mes" },
  { value: 3, label: "3 meses" },
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses" },
  { value: 0, label: "Sin fecha de expiración" },
];

const PREVIEW_LIMIT = 8;

interface BulkImportModalProps {
  onClose: () => void;
  onComplete: (result: BulkImportResult) => void;
}

export default function BulkImportModal({ onClose, onComplete }: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<CsvParseResult | null>(null);
  const [expiresInMonths, setExpiresInMonths] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { unique, duplicates } = useMemo(() => {
    if (!parsed) return { unique: [] as ParsedRow[], duplicates: 0 };
    return dedupeByEmail(parsed.valid);
  }, [parsed]);

  const handleFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = parseUsersCsv(text);
      setParsed(result);
      if (result.valid.length === 0 && result.invalid.length === 0) {
        setError("El archivo está vacío o no se pudo leer ninguna fila.");
      }
    };
    reader.onerror = () => setError("No se pudo leer el archivo.");
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (unique.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: BulkImportPayload = {
        users: unique.map((u) => ({
          email: u.email,
          fullName: u.fullName,
          ...(u.phone ? { phone: u.phone } : {}),
        })),
        expiresInMonths,
      };
      const result = await apiClient.post<BulkImportResult>("/users/bulk", payload);
      onComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar usuarios");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setParsed(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Importar usuarios desde CSV</h3>
            <p className="mt-1 text-sm text-muted">
              Sube un archivo .csv exportado desde Google Sheets o Excel.
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Formato esperado */}
          <div className="rounded-lg border border-primary/20 bg-primary-softer p-3 text-xs text-primary">
            <p className="font-semibold">Formato esperado</p>
            <p className="mt-1 leading-relaxed">
              El archivo debe tener columnas con encabezados como{" "}
              <strong>CORREO</strong> (o email), <strong>CLIENTE</strong> (o nombre) y{" "}
              <strong>TELÉFONO</strong> (opcional). Funciona directamente con la exportación
              de Google Sheets del listado de infoproductos. Las filas de título
              antes del encabezado se ignoran automáticamente.
            </p>
          </div>

          {/* Selector de archivo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Archivo CSV
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
              />
              {fileName && (
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-card-hover"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          {/* Vigencia */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Vigencia del acceso
            </label>
            <select
              value={expiresInMonths}
              onChange={(e) => setExpiresInMonths(Number(e.target.value))}
              className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-64"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">
              Se aplica a todos los usuarios creados en este lote.
            </p>
          </div>

          {/* Resumen del parseo */}
          {parsed && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <SummaryPill label="A crear" value={unique.length} tone="success" />
                <SummaryPill label="Duplicados en archivo" value={duplicates} tone="muted" />
                <SummaryPill label="Filas inválidas" value={parsed.invalid.length} tone="danger" />
              </div>

              {unique.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card-hover text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Nombre</th>
                        <th className="px-3 py-2">Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unique.slice(0, PREVIEW_LIMIT).map((u) => (
                        <tr key={u.email} className="border-b border-border/60 last:border-0">
                          <td className="px-3 py-2 text-foreground">{u.email}</td>
                          <td className="px-3 py-2 text-foreground">{u.fullName}</td>
                          <td className="px-3 py-2 text-muted">{u.phone ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {unique.length > PREVIEW_LIMIT && (
                    <p className="border-t border-border px-3 py-2 text-xs text-muted">
                      … y {unique.length - PREVIEW_LIMIT} más.
                    </p>
                  )}
                </div>
              )}

              {parsed.invalid.length > 0 && (
                <details className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                  <summary className="cursor-pointer font-medium">
                    Ver {parsed.invalid.length} fila(s) inválida(s) — se ignorarán
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {parsed.invalid.slice(0, 20).map((row) => (
                      <li key={row.line}>
                        Línea {row.line}: {row.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={unique.length === 0 || submitting}
          >
            {unique.length > 0 ? `Importar ${unique.length} usuario(s)` : "Importar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : "text-muted";
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
