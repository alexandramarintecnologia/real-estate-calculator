"use client";

import Card from "@/components/ui/Card";
import { formatCOP } from "@/lib/formatters";
import type { RemodelingEstimate } from "@/types/remodeling.types";

interface RequiredBudgetResultProps {
  estimate: RemodelingEstimate;
}

/** Resultado principal: cuanto se necesita y que nivel de presupuesto lo cubre. */
export default function RequiredBudgetResult({ estimate }: RequiredBudgetResultProps) {
  const {
    requiredAmount,
    requiredPercent,
    coverage,
    recommendedTier,
    exceedsTopTier,
    tiers,
    basePrice,
  } = estimate;

  const recommended = tiers.find((t) => t.tier === recommendedTier);

  return (
    <div className="space-y-4">
      {/* Monto necesario */}
      <Card className="border-primary/30 bg-primary-softer">
        <p className="text-xs uppercase tracking-wide text-muted">
          Monto que necesitás
        </p>
        <p className="mt-1 text-3xl font-bold text-primary">
          {formatCOP(requiredAmount)}
        </p>
        <p className="mt-2 text-sm text-foreground">
          {requiredPercent}% del costo del apartamento ({formatCOP(basePrice)})
        </p>
        <p className="mt-1 text-xs text-muted">
          Cubre el {coverage}% de una remodelación integral.
        </p>
      </Card>

      {/* Nivel resultante */}
      <Card>
        <p className="text-xs uppercase tracking-wide text-muted">
          Nivel de presupuesto necesario
        </p>

        {exceedsTopTier ? (
          <div role="alert" className="mt-2">
            <p className="text-xl font-bold text-danger">Excede el nivel Alto</p>
            <p className="mt-1 text-sm text-muted">
              Lo que marcaste cuesta {requiredPercent}%, por encima del{" "}
              {Math.max(...tiers.map((t) => t.percent))}% del nivel más alto. Quitá
              áreas o ajustá los montos.
            </p>
          </div>
        ) : recommended ? (
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">
              Nivel {recommended.label}
            </p>
            <p className="mt-1 text-sm text-muted">
              {recommended.label} cubre hasta {recommended.percent}% (
              {formatCOP(recommended.totalBudget)}). Te sobran{" "}
              <span className="font-medium text-success">
                {formatCOP(recommended.totalBudget - requiredAmount)}
              </span>
              .
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Marcá al menos un área para ver el nivel.
          </p>
        )}

        {/* Los tres niveles como referencia, con el necesario resaltado. */}
        <ul className="mt-5 space-y-2 border-t border-border pt-4">
          {tiers.map((tier) => {
            const isMatch = tier.tier === recommendedTier;
            const covers = requiredAmount <= tier.totalBudget;
            return (
              <li
                key={tier.tier}
                className={[
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                  isMatch ? "bg-primary-softer" : "",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 rounded-full ${
                      covers ? "bg-success" : "bg-border-strong"
                    }`}
                  />
                  <span
                    className={isMatch ? "font-semibold text-primary" : "text-foreground"}
                  >
                    {tier.label}
                  </span>
                  <span className="text-xs text-muted">{tier.percent}%</span>
                  {isMatch && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Necesario
                    </span>
                  )}
                </span>
                <span
                  className={`font-medium ${covers ? "text-foreground" : "text-muted line-through"}`}
                >
                  {formatCOP(tier.totalBudget)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-muted">
          El punto verde marca los niveles cuyo presupuesto alcanza para lo que
          seleccionaste.
        </p>
      </Card>
    </div>
  );
}
