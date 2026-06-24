interface FormErrorSummaryProps {
  errors: string[];
  title?: string;
}

export default function FormErrorSummary({
  errors,
  title = "Completa los campos obligatorios marcados con *",
}: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      <p className="font-medium">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-0.5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
