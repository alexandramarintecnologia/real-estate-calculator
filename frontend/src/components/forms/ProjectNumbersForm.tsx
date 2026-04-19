"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { ProjectExpenses } from "@/types/analysis.types";

interface ProjectNumbersFormProps {
  data: ProjectExpenses;
  onChange: (data: ProjectExpenses) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ProjectNumbersForm({
  data,
  onChange,
  onNext,
  onPrev,
}: ProjectNumbersFormProps) {
  // Aseguramos valores por defecto si no existen
  const notaryType = data.notaryFeesType ?? "percent";
  const brokerType = data.brokerCommissionType ?? "percent";

  return (
    <div className="space-y-6">
      <Card
        title="Otros Gastos del Proyecto"
        description="Configura los porcentajes o montos fijos adicionales. Puedes elegir si ingresar el valor en porcentaje (%) o en pesos ($)."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Gastos de escrituracion */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Gastos de escrituración {notaryType === "percent" ? "(Porcentaje %)" : "(Monto en $)"}
            </label>
            <div className="flex">
              <input
                type="number"
                min={0}
                step={notaryType === "percent" ? "0.01" : "1"}
                value={data.notaryFeesValue ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    notaryFeesValue: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="block w-full rounded-l-lg border border-r-0 border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={notaryType === "percent" ? "Ej: 1.07" : "Ej: 3000000"}
              />
              <select
                value={notaryType}
                onChange={(e) =>
                  onChange({
                    ...data,
                    notaryFeesType: e.target.value as "percent" | "fixed",
                  })
                }
                className="rounded-r-lg border border-border bg-foreground/5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            <p className="text-xs text-muted">
              {notaryType === "percent"
                ? "Ingresa el valor en porcentaje (%). Predeterminado: 1.07%"
                : "Ingresa el valor total a pagar en pesos"}
            </p>
          </div>

          {/* Comision del asesor */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Comisión del asesor inmobiliario {brokerType === "percent" ? "(Porcentaje %)" : "(Monto en $)"}
            </label>
            <div className="flex">
              <input
                type="number"
                min={0}
                step={brokerType === "percent" ? "0.01" : "1"}
                value={data.brokerCommissionValue ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    brokerCommissionValue: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="block w-full rounded-l-lg border border-r-0 border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={brokerType === "percent" ? "Ej: 3" : "Ej: 6000000"}
              />
              <select
                value={brokerType}
                onChange={(e) =>
                  onChange({
                    ...data,
                    brokerCommissionType: e.target.value as "percent" | "fixed",
                  })
                }
                className="rounded-r-lg border border-border bg-foreground/5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            <p className="text-xs text-muted">
              {brokerType === "percent"
                ? "Ingresa el valor en porcentaje (%). Predeterminado: 3%"
                : "Ingresa el valor total a pagar en pesos"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Otros gastos (colchón)"
              type="number"
              min={0}
              value={data.otherExpenses ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  otherExpenses: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              prefix="$"
              hint="Mensajería, predial, imprevistos, etc."
            />
          </div>
        </div>
      </Card>

      <Card title="Información" description="Cómo se calculan estos gastos">
        <div className="space-y-3 text-sm text-muted">
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Escrituración:</strong> Si usas porcentaje (%), se calcula sobre el precio de compra, aplicado a compra y venta (y se asume que pagas la mitad). Si usas pesos ($), será el valor exacto ingresado.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Comisión del asesor:</strong> Si usas porcentaje (%), se calcula sobre el precio del inmueble. Si usas pesos ($), será el valor exacto ingresado.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Otros gastos:</strong> Incluyen mensajería, impuesto predial por el tiempo que
              tengas el inmueble e imprevistos.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          ← Remodelación
        </Button>
        <Button onClick={onNext}>Siguiente: Zona y Entorno →</Button>
      </div>
    </div>
  );
}
