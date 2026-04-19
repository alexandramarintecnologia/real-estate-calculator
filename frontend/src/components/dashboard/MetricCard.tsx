import { Rating } from "@/types/analysis.types";

const ratingColors: Record<Rating, string> = {
  [Rating.EXCELENTE]: "border-l-success text-success",
  [Rating.BUENA]: "border-l-warning text-warning",
  [Rating.RIESGOSA]: "border-l-danger text-danger",
};

const ratingBg: Record<Rating, string> = {
  [Rating.EXCELENTE]: "bg-success/5",
  [Rating.BUENA]: "bg-warning/5",
  [Rating.RIESGOSA]: "bg-danger/5",
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  rating?: Rating;
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, subtitle, rating, icon }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${
        rating ? `border-l-4 ${ratingColors[rating]} ${ratingBg[rating]}` : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className={`text-2xl font-bold ${rating ? ratingColors[rating].split(" ")[1] : "text-foreground"}`}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {icon && <div className="text-muted/40">{icon}</div>}
      </div>
    </div>
  );
}
