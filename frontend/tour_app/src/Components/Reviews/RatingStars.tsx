import React from "react";

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 16, showValue = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="rs-stars" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
      {stars.map((s) => (
        <span
          key={s}
          style={{
            fontSize: size,
            lineHeight: 1,
            color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
          }}
        >
          ★
        </span>
      ))}
      {showValue && (
        <span className="rs-value" style={{ fontSize: size * 0.8, color: "#64748b", marginInlineStart: "0.25rem" }}>
          {rating}
        </span>
      )}
    </span>
  );
};

export default RatingStars;
