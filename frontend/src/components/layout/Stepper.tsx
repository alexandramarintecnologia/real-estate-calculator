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
  onStepClick?: (step: number) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
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
          const isCompleted = step.id < currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isCompleted
                      ? "text-success cursor-pointer hover:bg-success/5"
                      : "text-muted"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-primary text-white"
                      : isCompleted
                        ? "bg-success text-white"
                        : "bg-foreground/10 text-muted"
                  }`}
                >
                  {isCompleted ? "✓" : step.id}
                </span>
                <span className="hidden lg:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`h-px w-6 ${isCompleted ? "bg-success" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
