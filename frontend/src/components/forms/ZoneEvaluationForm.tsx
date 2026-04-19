"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { QualitativeScore } from "@/types/analysis.types";
import type { QualitativeEvaluation } from "@/types/analysis.types";

const scoreOptions = [
  { value: QualitativeScore.DESCARTADO, label: "Descartado" },
  { value: QualitativeScore.REGULAR, label: "Regular" },
  { value: QualitativeScore.BUENO, label: "Bueno" },
  { value: QualitativeScore.EXCELENTE, label: "Excelente" },
];

interface Factor {
  key: keyof QualitativeEvaluation;
  label: string;
  description: string;
}

const factors: Factor[] = [
  {
    key: "entorno",
    label: "Entorno del inmueble",
    description: "Estado general del edificio, vecinos, zonas comunes, vista.",
  },
  {
    key: "accesibilidad",
    label: "Accesibilidad y vías",
    description: "Facilidad de acceso, estado de las vías principales cercanas.",
  },
  {
    key: "transporte",
    label: "Transporte",
    description: "Cercanía a transporte público, rutas de buses, estaciones.",
  },
  {
    key: "seguridad",
    label: "Seguridad",
    description: "Percepción de seguridad en el barrio, vigilancia, iluminación.",
  },
  {
    key: "comercioOcio",
    label: "Comercio y ocio",
    description: "Cercanía a centros comerciales, restaurantes, parques.",
  },
  {
    key: "documentacion",
    label: "Documentación",
    description: "Estado de la documentación legal del inmueble, certificado de tradición.",
  },
];

interface ZoneEvaluationFormProps {
  data: QualitativeEvaluation;
  onChange: (data: QualitativeEvaluation) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

export default function ZoneEvaluationForm({
  data,
  onChange,
  onSubmit,
  onPrev,
  isLoading,
}: ZoneEvaluationFormProps) {
  const values = Object.values(data);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgLabel =
    avg >= 2.5 ? "Excelente" : avg >= 1.5 ? "Bueno" : avg >= 0.5 ? "Regular" : "Descartado";
  const avgColor =
    avg >= 2.5 ? "text-success" : avg >= 1.5 ? "text-warning" : "text-danger";

  return (
    <div className="space-y-6">
      <Card
        title="Evaluación de Zona y Entorno"
        description="Evalúa los factores no financieros del inmueble. Esto influye en la recomendación final."
      >
        <div className="space-y-5">
          {factors.map((f) => (
            <div key={f.key} className="grid gap-2 sm:grid-cols-[1fr_180px] sm:items-end">
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted">{f.description}</p>
              </div>
              <Select
                label=""
                options={scoreOptions}
                value={data[f.key]}
                onChange={(e) =>
                  onChange({ ...data, [f.key]: Number(e.target.value) as QualitativeScore })
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Promedio de zona</p>
            <p className={`text-2xl font-bold ${avgColor}`}>
              {avg.toFixed(1)} / 3.0
            </p>
          </div>
          <span
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
              avg >= 2.5
                ? "border-success/20 bg-success/10 text-success"
                : avg >= 1.5
                  ? "border-warning/20 bg-warning/10 text-warning"
                  : "border-danger/20 bg-danger/10 text-danger"
            }`}
          >
            {avgLabel}
          </span>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          ← Números del Proyecto
        </Button>
        <Button onClick={onSubmit} isLoading={isLoading}>
          Calcular Resultados →
        </Button>
      </div>
    </div>
  );
}
