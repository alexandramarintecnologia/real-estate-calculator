import { Rating, Decision } from "@/types/analysis.types";

const ratingStyles: Record<Rating, string> = {
  [Rating.EXCELENTE]: "bg-success/10 text-success border-success/20",
  [Rating.BUENA]: "bg-warning/10 text-warning border-warning/20",
  [Rating.RIESGOSA]: "bg-danger/10 text-danger border-danger/20",
};

const ratingLabels: Record<Rating, string> = {
  [Rating.EXCELENTE]: "Excelente",
  [Rating.BUENA]: "Buena",
  [Rating.RIESGOSA]: "Riesgosa",
};

const decisionStyles: Record<Decision, string> = {
  [Decision.COMPRAR]: "bg-success/10 text-success border-success/20",
  [Decision.EVALUAR]: "bg-warning/10 text-warning border-warning/20",
  [Decision.NO_RECOMENDABLE]: "bg-danger/10 text-danger border-danger/20",
};

const decisionLabels: Record<Decision, string> = {
  [Decision.COMPRAR]: "Comprar",
  [Decision.EVALUAR]: "Evaluar",
  [Decision.NO_RECOMENDABLE]: "No Recomendable",
};

export function RatingBadge({ rating }: { rating: Rating }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${ratingStyles[rating]}`}>
      {ratingLabels[rating]}
    </span>
  );
}

export function DecisionBadge({ decision }: { decision: Decision }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${decisionStyles[decision]}`}>
      {decisionLabels[decision]}
    </span>
  );
}
