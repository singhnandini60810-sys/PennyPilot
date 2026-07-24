import type { ReactNode } from "react";
import "./dashboard.css";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  accent?: "gold" | "blue";
}

export default function SummaryCard({
  title,
  value,
  icon,
  accent = "gold",
}: SummaryCardProps) {
  return (
    <div className={`summary-card summary-card--${accent}`}>
      <div className="summary-card__icon">
        {icon}
      </div>

      <div className="summary-card__content">
        <p className="summary-card__title">
          {title}
        </p>

        <h2 className="summary-card__value">
          {value}
        </h2>
      </div>
    </div>
  );
}