"use client";

import NumberInput from "@/components/ui/NumberInput";
import InlineNumberInput from "@/components/ui/InlineNumberInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { fieldSelectRightClass } from "@/lib/field-classes";
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
  const notaryType = data.notaryFeesType ?? "percent";
  const brokerType = data.brokerCommissionType ?? "percent";

  return (
    <div className="space-y-6">
      <Card
        title="Otros Gastos del Proyecto"
        description="Configura los porcentajes o montos fijos adicionales. Puedes elegir si ingresar el valor en porcentaje (%) o en pesos ($)."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Gastos de escrituración (opcional) {notaryType === "percent" ? "(Porcentaje %)" : "(Monto en $)"}
            </label>
            <p className="text-xs text-muted">
              {notaryType === "percent"
                ? "Puedes cambiar a monto fijo en pesos ($) con el selector a la derecha."
                : "Puedes cambiar a porcentaje (%) con el selector a la derecha."}
            </p>
            <div className="flex">
              <InlineNumberInput
                value={data.notaryFeesValue}
                decimals={notaryType === "percent"}
                min={0}
                allowEmpty
                onChange={(value) =>
                  onChange({
                    ...data,
                    notaryFeesValue: value,
                  })
                }
                placeholder={notaryType === "percent" ? "Ej: 3" : "Ej: 3000000"}
              />
              <select
                value={notaryType}
                onChange={(e) =>
                  onChange({
                    ...data,
                    notaryFeesType: e.target.value as "percent" | "fixed",
                  })
                }
                className={fieldSelectRightClass(false)}
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            <p className="text-xs text-muted">
              {notaryType === "percent"
                ? "Predeterminado: 3% aplicado a compra y a venta (sobre el precio de compra en cada tramo)."
                : "Ingresa el monto total en pesos que pagarás por escrituración."}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Comisión del asesor inmobiliario (opcional) {brokerType === "percent" ? "(Porcentaje %)" : "(Monto en $)"}
            </label>
            <p className="text-xs text-muted">
              {brokerType === "percent"
                ? "Puedes cambiar a monto fijo en pesos ($) con el selector a la derecha."
                : "Puedes cambiar a porcentaje (%) con el selector a la derecha."}
            </p>
            <div className="flex">
              <InlineNumberInput
                value={data.brokerCommissionValue}
                decimals={brokerType === "percent"}
                min={0}
                allowEmpty
                onChange={(value) =>
                  onChange({
                    ...data,
                    brokerCommissionValue: value,
                  })
                }
                placeholder={brokerType === "percent" ? "Ej: 1" : "Ej: 6000000"}
              />
              <select
                value={brokerType}
                onChange={(e) =>
                  onChange({
                    ...data,
                    brokerCommissionType: e.target.value as "percent" | "fixed",
                  })
                }
                className={fieldSelectRightClass(false)}
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            <p className="text-xs text-muted">
              {brokerType === "percent"
                ? "Predeterminado: 1% sobre el precio de compra del inmueble."
                : "Ingresa el monto total en pesos de la comisión del asesor."}
            </p>
          </div>

          <div className="sm:col-span-2">
            <NumberInput
              label="Otros gastos (colchón) (opcional)"
              value={data.otherExpenses}
              min={0}
              allowEmpty
              onChange={(value) =>
                onChange({
                  ...data,
                  otherExpenses: value,
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
              <strong>Escrituración:</strong> Con porcentaje (%), el valor predeterminado es 3% sobre el precio de compra en la operación de compra y el mismo porcentaje en la de venta (el cálculo refleja ambas). Con pesos ($), es el monto exacto que ingreses. Puedes alternar entre % y $ con el selector.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-primary">→</span>
            <p>
              <strong>Comisión del asesor:</strong> Con porcentaje (%), el valor predeterminado es 1% sobre el precio de compra. Con pesos ($), es el monto exacto. Puedes alternar entre % y $ con el selector.
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
