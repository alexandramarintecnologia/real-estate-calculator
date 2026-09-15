"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { RemodelingEstimate } from "@/types/remodeling.types";

interface DownloadRemodelingPDFProps {
  estimate: RemodelingEstimate;
  analysisLabel?: string;
  generatedBy?: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function DownloadRemodelingPDF({
  estimate,
  analysisLabel,
  generatedBy,
}: DownloadRemodelingPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // @react-pdf pesa mas de un mega: se descarga recien al pulsar, no al
      // abrir la pagina.
      const [{ pdf }, { default: RemodelingReportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./RemodelingReportPDF"),
      ]);

      const blob = await pdf(
        <RemodelingReportPDF
          estimate={estimate}
          analysisLabel={analysisLabel}
          generatedBy={generatedBy}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const slug = slugify(analysisLabel || "remodelacion") || "remodelacion";
      const date = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.href = url;
      link.download = `presupuesto-${slug}-${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No pudimos generar el PDF. Intenta nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleDownload} isLoading={isGenerating}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {isGenerating ? "Generando PDF..." : "Descargar presupuesto PDF"}
    </Button>
  );
}
