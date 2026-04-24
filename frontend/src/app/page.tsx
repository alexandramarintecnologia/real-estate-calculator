"use client";

import { useAnalysis } from "@/hooks/useAnalysis";
import Header from "@/components/layout/Header";
import Stepper from "@/components/layout/Stepper";
import PropertyForm from "@/components/forms/PropertyForm";
import RemodelingForm from "@/components/forms/RemodelingForm";
import ProjectNumbersForm from "@/components/forms/ProjectNumbersForm";
import ZoneEvaluationForm from "@/components/forms/ZoneEvaluationForm";
import ResultsDashboard from "@/components/dashboard/ResultsDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const {
    step,
    highestStep,
    goNext,
    goPrev,
    goTo,
    property,
    setProperty,
    remodeling,
    setRemodeling,
    expenses,
    setExpenses,
    qualitative,
    setQualitative,
    result,
    isLoading,
    error,
    submitAnalysis,
    reset,
  } = useAnalysis();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Stepper currentStep={step} highestStep={highestStep} onStepClick={(s) => s <= highestStep && goTo(s)} />

        {error && (
          <div className="my-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-6">
          {step === 1 && (
            <PropertyForm data={property} onChange={setProperty} onNext={goNext} />
          )}
          {step === 2 && (
            <RemodelingForm
              data={remodeling}
              property={property}
              onChange={setRemodeling}
              onNext={goNext}
              onPrev={goPrev}
            />
          )}
          {step === 3 && (
            <ProjectNumbersForm
              data={expenses}
              onChange={setExpenses}
              onNext={goNext}
              onPrev={goPrev}
            />
          )}
          {step === 4 && (
            <ZoneEvaluationForm
              data={qualitative}
              onChange={setQualitative}
              onSubmit={submitAnalysis}
              onPrev={goPrev}
              isLoading={isLoading}
            />
          )}
          {step === 5 && result && (
            <ResultsDashboard result={result} property={property} onReset={reset} />
          )}
        </div>
      </main>
    </>
  );
}
