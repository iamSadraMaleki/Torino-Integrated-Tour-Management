// فایل: components/TourStatusBadge.tsx
import React from "react";
import { TourStatus, TourStatusPersian, TourStatusColors, TourStatusBgColors } from "../../../Types/tour";

interface TourStatusBadgeProps {
  status: TourStatus;
  size?: "sm" | "md" | "lg";
}

const TourStatusBadge: React.FC<TourStatusBadgeProps> = ({ status, size = "md" }) => {
  const sizeStyles = {
    sm: { padding: "0.25rem 0.5rem", fontSize: "0.65rem" },
    md: { padding: "0.375rem 0.75rem", fontSize: "0.7rem" },
    lg: { padding: "0.5rem 1rem", fontSize: "0.8rem" }
  };

  const style = {
    backgroundColor: TourStatusBgColors[status],
    color: TourStatusColors[status],
    borderRadius: "var(--radius-xl)",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    ...sizeStyles[size]
  };

  const getIcon = () => {
    switch (status) {
      case TourStatus.ACTIVE:
        return "✅";
      case TourStatus.EXPIRED:
        return "⏰";
      case TourStatus.SOLD_OUT:
        return "❌";
      case TourStatus.SUSPENDED:
        return "⏸️";
      default:
        return "📌";
    }
  };

  return (
    <span style={style}>
      {getIcon()} {TourStatusPersian[status]}
    </span>
  );
};

export default TourStatusBadge;