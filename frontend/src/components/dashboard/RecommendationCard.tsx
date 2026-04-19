interface RecommendationCardProps {
  recommendations: string[];
}

export default function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recomendaciones</h3>
      <ul className="space-y-3">
        {recommendations.map((rec, i) => {
          const isAlert = rec.includes("ALERTA");
          return (
            <li key={i} className="flex gap-3 text-sm">
              <span className={`mt-0.5 shrink-0 ${isAlert ? "text-danger" : "text-primary"}`}>
                {isAlert ? "⚠" : "→"}
              </span>
              <span className={isAlert ? "font-medium text-danger" : "text-foreground/80"}>
                {rec}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
