"use client";

import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BasePriceSelector from "@/components/remodeling/BasePriceSelector";
import AreaSelector from "@/components/remodeling/AreaSelector";
import RequiredBudgetResult from "@/components/remodeling/RequiredBudgetResult";
import AreaCostBreakdown from "@/components/remodeling/AreaCostBreakdown";
import RoomShowcase3D from "@/components/remodeling/RoomShowcase3D";
import DownloadRemodelingPDF from "@/components/remodeling/DownloadRemodelingPDF";
import { useRemodeling } from "@/hooks/useRemodeling";
import { useAuth } from "@/contexts/AuthContext";

export default function RemodelacionesPage() {
  return (
    <ProtectedRoute>
      <RemodelacionesContent />
    </ProtectedRoute>
  );
}

function RemodelacionesContent() {
  const { user } = useAuth();
  const {
    input,
    patchInput,
    setBasePriceSource,
    toggleArea,
    selectGroup,
    setAreaAmount,
    catalog,
    estimate,
    isLoading,
    error,
    calculate,
    reset,
  } = useRemodeling();

  const hasBasePrice = Boolean(input.basePrice && input.basePrice > 0);
  const canCalculate = hasBasePrice && input.selectedAreas.length > 0;


  return (
    <AppShell maxWidth="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Remodelaciones</h1>
        <p className="mt-1 text-sm text-muted">
          Marcá qué zonas querés remodelar y descubrí cuánto necesitás y qué nivel de
          presupuesto lo cubre.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Paso 1 — costo del apartamento */}
        <BasePriceSelector
          input={input}
          onPatch={patchInput}
          onSourceChange={setBasePriceSource}
        />

        {/* Paso 2 — que se va a remodelar. Se habilita al fijar el costo. */}
        {hasBasePrice ? (
          <AreaSelector
            catalog={catalog}
            selectedAreas={input.selectedAreas}
            onToggle={toggleArea}
            onSelectGroup={selectGroup}
          />
        ) : (
          <Card title="Áreas a remodelar">
            <p className="text-sm text-muted">
              Primero definí el costo del apartamento para poder proyectar los montos.
            </p>
          </Card>
        )}

        {/* Paso 3 — calcular */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void calculate()} isLoading={isLoading} disabled={!canCalculate}>
            Calcular
          </Button>
          {estimate && (
            <Button variant="outline" onClick={reset}>
              Empezar de nuevo
            </Button>
          )}
          {!canCalculate && (
            <p className="text-xs text-muted">
              {hasBasePrice
                ? "Marcá al menos un área."
                : "Definí el costo del apartamento."}
            </p>
          )}
        </div>

        {/* Resultado */}
        {estimate && (
          <section className="space-y-6" aria-label="Resultado">
            <RequiredBudgetResult estimate={estimate} />

            <AreaCostBreakdown
              areaCosts={estimate.areaCosts}
              groups={catalog?.groups ?? []}
              requiredAmount={estimate.requiredAmount}
              onAmountChange={setAreaAmount}
            />

            <RoomShowcase3D
              areaCosts={estimate.areaCosts}
              tiers={estimate.tiers}
              recommendedTier={estimate.recommendedTier}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <DownloadRemodelingPDF
                estimate={estimate}
                analysisLabel={input.analysisLabel}
                generatedBy={user?.fullName}
              />
              <p className="text-xs text-muted">
                Incluye el monto necesario, el nivel que lo cubre y el desglose por área.
              </p>
            </div>

          </section>
        )}
      </div>
    </AppShell>
  );
}
