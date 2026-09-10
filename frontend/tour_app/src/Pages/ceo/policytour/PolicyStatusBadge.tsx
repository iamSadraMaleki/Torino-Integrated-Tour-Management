// فایل: src/Components/ceo/policy/PolicyStatusBadge.tsx
import React from "react";

interface PolicyStatusBadgeProps {
  isActive: boolean;
  isDefault: boolean;
}

const PolicyStatusBadge: React.FC<PolicyStatusBadgeProps> = ({ isActive, isDefault }) => {
  if (isDefault) {
    return (
      <span className="policy-badge default">
        ⭐ پیش‌فرض
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="policy-badge active">
        ✅ فعال
      </span>
    );
  }

  return (
    <span className="policy-badge inactive">
      ⛔ غیرفعال
    </span>
  );
};

export default PolicyStatusBadge;