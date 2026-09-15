"use client";

import Card from "@/components/ui/Card";
import NumberInput from "@/components/ui/NumberInput";
import { formatCOP } from "@/lib/formatters";
import type { AreaCost, AreaGroupConfig } from "@/types/remodeling.types";

interface AreaCostBreakdownProps {
  areaCosts: AreaCost[];
  groups: AreaGroupConfig[];
  requiredAmount: number;
  onAmountChange: (areaId: string, amount: number | undefined) => void;
}

/** En que se va el dinero: costo de cada area marcada. */
export default function AreaCostBreakdown({
  areaCosts,
  groups,
  requiredAmount,
  onAmountChange,
}: AreaCostBreakdownProps) {
  if (areaCosts.length === 0) return null;

  const groupLabel = new Map(groups.map((g) => [g.id, g.label]));
  // La mayor asignacion fija la escala de las barras, para que la comparacion
  // entre areas se lea de un vistazo aunque los montos sean parecidos.
  const maxAmount = Math.max(...areaCosts.map((a) => a.amount), 1);

  return (
    <Card
      title="En qué se va el dinero"
      description="Costo de cada área marcada. Podés fijar un monto a mano si tenés una cotización."
    >
      <ul className="space-y-3">
        {areaCosts.map((item) => {
          const share =
            requiredAmount > 0
              ? Math.round((item.amount / requiredAmount) * 1000) / 10
              : 0;
          return (
            <li key={item.area} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-muted">
                    {groupLabel.get(item.group) ?? item.group}
                    {item.isManual && <span className="ml-2 text-primary">Monto fijo</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCOP(item.amount)}
                  </p>
                  <p className="text-[11px] text-muted">{share}% del total</p>
                </div>
              </div>

              {/* Barra proporcional. aria-hidden porque el monto y el % ya estan en texto. */}
              <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/5">
                <div
                  className={`h-full rounded-full ${item.isManual ? "bg-primary" : "bg-primary/50"}`}
                  style={{ width: `${Math.round((item.amount / maxAmount) * 100)}%` }}
                />
              </div>

              {item.isManual && item.referenceAmount !== item.amount && (
                <p className="mt-2 text-[11px] text-muted">
                  Referencia sin ajuste: {formatCOP(item.referenceAmount)}
                </p>
              )}

              <div className="mt-3">
                <NumberInput
                  label={`Monto fijo para ${item.label}`}
                  value={item.isManual ? item.amount : undefined}
                  onChange={(value) => onAmountChange(item.area, value)}
                  prefix="$"
                  min={0}
                  allowEmpty
                  placeholder="Automático"
                  hint="Vacío usa el costo de referencia."
                />
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
        <dt className="font-medium text-foreground">Total necesario</dt>
        <dd className="font-bold text-primary">{formatCOP(requiredAmount)}</dd>
      </dl>
    </Card>
  );
}
