"use client";

import NumberInput from "@/components/ui/NumberInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCOP } from "@/lib/formatters";
import type { RemodelingScenario, PropertyData } from "@/types/analysis.types";

interface ScenarioConfig {
  id: 1 | 2 | 3;
  title: string;
  description: string;
  minPercent: number;
  maxPercent: number;
  defaultPercent: number;
  hasAdmin: boolean;
}

const scenarioConfigs: ScenarioConfig[] = [
  {
    id: 1,
    title: "Empresa todo costo",
    description:
      "La empresa se encarga del 98% de la obra: personal, mano de obra, materiales y administración.",
    minPercent: 25,
    maxPercent: 35,
    defaultPercent: 32,
    hasAdmin: false,
  },
  {
    id: 2,
    title: "Solo mano de obra",
    description:
      "Tú contratas directamente a los maestros/oficiales y te encargas de comprar los materiales.",
    minPercent: 15,
    maxPercent: 20,
    defaultPercent: 15,
    hasAdmin: false,
  },
  {
    id: 3,
    title: "Administrador de obra",
    description:
      "Contratas a un profesional (Arq. o Ing.) que administra la obra. Se suma un 18% sobre el costo base.",
    minPercent: 15,
    maxPercent: 20,
    defaultPercent: 15,
    hasAdmin: true,
  },
];

const DEFAULT_ADMIN_PERCENT = 18;

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
  const purchasePrice = property.precioCompra;
  const selectedScenario = data.selectedScenario;
  const currentConfig = scenarioConfigs.find((s) => s.id === selectedScenario)!;

  const getPercentForScenario = (config: ScenarioConfig) => {
    const raw = data.remodelingPercent ?? config.defaultPercent;
    return Math.min(config.maxPercent, Math.max(config.minPercent, raw));
  };

  const estimateCost = (config: ScenarioConfig): number => {
    if (data.customCost && config.id === selectedScenario) {
      const base = data.customCost;
      const admin = config.hasAdmin ? (data.adminPercentage ?? DEFAULT_ADMIN_PERCENT) / 100 : 0;
      return Math.round(base * (1 + admin));
    }
    const percent = getPercentForScenario(config);
    const base = Math.round(purchasePrice * percent / 100);
    const admin = config.hasAdmin ? (data.adminPercentage ?? DEFAULT_ADMIN_PERCENT) / 100 : 0;
    return Math.round(base * (1 + admin));
  };

  const currentPercent = getPercentForScenario(currentConfig);

  return (
    <div className="space-y-6">
      <Card
        title="Escenarios de Remodelación"
        description="Selecciona el escenario que mejor se ajuste a tu proyecto (obligatorio). El costo se calcula como % del precio de compra."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarioConfigs.map((config) => {
            const isSelected = selectedScenario === config.id;
            const estimated = estimateCost(config);
            const percent = getPercentForScenario(config);

            return (
              <button
                key={config.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...data,
                    selectedScenario: config.id,
                    remodelingPercent: config.defaultPercent,
                  })
                }
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
                    {config.id}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{config.title}</span>
                </div>
                <p className="mt-2 text-xs text-muted leading-relaxed">{config.description}</p>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs text-muted">
                    {config.hasAdmin
                      ? `${percent}% + ${data.adminPercentage ?? DEFAULT_ADMIN_PERCENT}% admin`
                      : `${percent}% del precio de compra`}
                  </p>
                  <p className="text-xs text-muted">
                    (rango: {config.minPercent}%–{config.maxPercent}%)
                  </p>
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
          <NumberInput
            label={`Porcentaje de remodelación (${currentConfig.minPercent}%–${currentConfig.maxPercent}%)`}
            value={currentPercent}
            min={currentConfig.minPercent}
            max={currentConfig.maxPercent}
            decimals
            onChange={(value) => {
              const clamped = Math.min(
                currentConfig.maxPercent,
                Math.max(currentConfig.minPercent, value ?? currentConfig.defaultPercent),
              );
              onChange({ ...data, remodelingPercent: clamped });
            }}
            suffix="%"
            hint={`Costo base: ${formatCOP(Math.round(purchasePrice * currentPercent / 100))}`}
            required
          />
          <NumberInput
            label="Costo personalizado (opcional)"
            value={data.customCost}
            min={0}
            allowEmpty
            onChange={(value) => onChange({ ...data, customCost: value })}
            prefix="$"
            hint="Deja vacío para usar el cálculo por porcentaje"
          />
          {selectedScenario === 3 && (
            <NumberInput
              label="Porcentaje de administración"
              value={data.adminPercentage ?? DEFAULT_ADMIN_PERCENT}
              min={10}
              max={30}
              decimals
              onChange={(value) =>
                onChange({ ...data, adminPercentage: value ?? DEFAULT_ADMIN_PERCENT })
              }
              suffix="%"
              hint="Porcentaje que cobra el administrador sobre el costo de remodelación"
              required
            />
          )}
        </div>
      </Card>

      <Card title="Información" description="¿Cómo funciona el cálculo?">
        <div className="space-y-3 text-sm text-muted">
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Escenario 1 (Empresa todo costo):</strong> Entre 25% y 35% del precio de compra. Incluye personal, materiales y administración de obra.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Escenario 2 (Solo mano de obra):</strong> Entre 15% y 20% del precio de compra. Solo cubres mano de obra y materiales.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Escenario 3 (Con administrador):</strong> Entre 15% y 20% del precio de compra + {data.adminPercentage ?? DEFAULT_ADMIN_PERCENT}% de administración sobre ese costo.
            </p>
          </div>
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
