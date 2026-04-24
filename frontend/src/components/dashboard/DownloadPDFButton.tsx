"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { AnalysisResult, PropertyData } from "@/types/analysis.types";

interface DownloadPDFButtonProps {
  result: AnalysisResult;
  property: PropertyData;
  generatedBy?: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function DownloadPDFButton({
  result,
  property,
  generatedBy,
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const [{ pdf }, { default: AnalysisReportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./AnalysisReportPDF"),
      ]);

      const blob = await pdf(
        <AnalysisReportPDF
          result={result}
          property={property}
          generatedBy={generatedBy}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const slug = slugify(property.direccion || "inmueble") || "inmueble";
      const date = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-${slug}-${date}.pdf`;
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
      {isGenerating ? "Generando PDF..." : "Descargar reporte PDF"}
    </Button>
  );
}
