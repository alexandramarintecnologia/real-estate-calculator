"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCOP } from "@/lib/formatters";
import type { RemodelingScenario, PropertyData } from "@/types/analysis.types";

interface Scenario {
  id: 1 | 2 | 3;
  title: string;
  description: string;
  defaultCost: number;
  hasAdmin: boolean;
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Empresa todo costo",
    description:
      "La empresa se encarga del 98% de la obra: personal, mano de obra, materiales y administración.",
    defaultCost: 1_150_000,
    hasAdmin: false,
  },
  {
    id: 2,
    title: "Solo mano de obra",
    description:
      "Tú contratas directamente a los maestros/oficiales y te encargas de comprar los materiales.",
    defaultCost: 500_000,
    hasAdmin: false,
  },
  {
    id: 3,
    title: "Administrador de obra",
    description:
      "Contratas a un profesional (Arquitecto o Ing.) para que administre la obra por un porcentaje del valor.",
    defaultCost: 500_000,
    hasAdmin: true,
  },
];

interface RemodelingFormProps {
  data: RemodelingScenario;
  property: PropertyData;
  onChange: (data: RemodelingScenario) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function RemodelingForm({
  data,
  property,
  onChange,
  onNext,
  onPrev,
}: RemodelingFormProps) {
  const m2 = property.m2Remodelacion;

  const estimateCost = (s: Scenario): number => {
    const base = data.customCostPerM2 && s.id === data.selectedScenario
      ? data.customCostPerM2
      : s.defaultCost;
    const admin = s.hasAdmin ? (data.adminPercentage ?? 15) / 100 : 0;
    return m2 * base * (1 + admin);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Escenarios de Remodelación"
        description={`Área a remodelar: ${m2} m². Selecciona el escenario que mejor se ajuste a tu proyecto.`}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map((s) => {
            const isSelected = data.selectedScenario === s.id;
            const estimated = estimateCost(s);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ ...data, selectedScenario: s.id })}
                className={`rounded-xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-card-hover"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isSelected ? "bg-primary text-white" : "bg-foreground/10 text-muted"
                    }`}
                  >
                    {s.id}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{s.title}</span>
                </div>
                <p className="mt-2 text-xs text-muted leading-relaxed">{s.description}</p>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs text-muted">Costo/m²</p>
                  <p className="text-sm font-medium">{formatCOP(s.defaultCost)}</p>
                  <p className="mt-1 text-xs text-muted">Costo total estimado</p>
                  <p className="text-lg font-bold text-foreground">{formatCOP(estimated)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Personalización" description="Ajusta los parámetros del escenario seleccionado">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Costo por m² personalizado (opcional)"
            type="number"
            min={0}
            value={data.customCostPerM2 ?? ""}
            onChange={(e) =>
              onChange({
                ...data,
                customCostPerM2: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            prefix="$"
            hint="Deja vacío para usar el valor predeterminado"
          />
          {data.selectedScenario === 3 && (
            <Input
              label="Porcentaje de administración (opcional)"
              type="number"
              min={10}
              max={25}
              value={data.adminPercentage ?? 15}
              onChange={(e) =>
                onChange({ ...data, adminPercentage: Number(e.target.value) })
              }
              suffix="%"
              hint="Entre 10% y 25%"
            />
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          ← Datos del Inmueble
        </Button>
        <Button onClick={onNext}>Siguiente: Números del Proyecto →</Button>
      </div>
    </div>
  );
}
