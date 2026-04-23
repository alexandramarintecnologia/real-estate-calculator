"use client";

const steps = [
  { id: 1, label: "Datos del Inmueble" },
  { id: 2, label: "Remodelación" },
  { id: 3, label: "Números del Proyecto" },
  { id: 4, label: "Zona y Entorno" },
  { id: 5, label: "Resultados" },
];

interface StepperProps {
  currentStep: number;
  highestStep?: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ currentStep, highestStep = currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progreso" className="py-4">
      {/* Mobile */}
      <p className="text-sm font-medium text-muted sm:hidden">
        Paso {currentStep} de {steps.length}:{" "}
        <span className="text-foreground">{steps[currentStep - 1]?.label}</span>
      </p>

      {/* Desktop */}
      <ol className="hidden sm:flex items-center gap-2">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isUnlocked = step.id <= highestStep;
          const isCompleted = step.id < highestStep;
          const isClickable = isUnlocked && onStepClick;

          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isUnlocked
                      ? "text-success cursor-pointer hover:bg-success/5"
                      : "text-muted"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-primary text-white"
                      : isUnlocked
                        ? "bg-success text-white"
                        : "bg-foreground/10 text-muted"
                  }`}
                >
                  {isUnlocked && !isActive ? "✓" : step.id}
                </span>
                <span className="hidden lg:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`h-px w-6 ${isUnlocked ? "bg-success" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
