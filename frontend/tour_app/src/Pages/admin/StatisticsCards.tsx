import React from "react";
import { FaUsers, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./AdminDashboard.css";

interface StatisticsCardsProps {
  statistics: any;
  userCount?: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics, userCount = 0 }) => {
  // تابع کمکی برای استخراج count از آبجکت‌های تو در تو
  const getCount = (item: any): number => {
    if (!item) return 0;
    if (typeof item === 'number') return item;
    if (typeof item === 'object' && item.count !== undefined) return item.count;
    if (typeof item === 'object' && item.value !== undefined) return item.value;
    return 0;
  };

  const verified = getCount(statistics?.verified);   // 7
  const pending = getCount(statistics?.pending);     // 0
  const rejected = getCount(statistics?.rejected);   // 0

  const cards = [
    {
      title: "کل کاربران",
      value: userCount,
      icon: <FaUsers />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      title: "در انتظار بررسی",
      value: pending,
      icon: <FaClock />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "تایید شده",
      value: verified,
      icon: <FaCheckCircle />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "رد شده",
      value: rejected,
      icon: <FaTimesCircle />,
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
  ];

  return (
    <div className="admin-stats-grid">
      {cards.map((card, index) => (
        <div key={index} className="admin-stat-card" style={{ background: card.bgColor }}>
          <div className="admin-stat-icon" style={{ color: card.color }}>
            {card.icon}
          </div>
          <div className="admin-stat-info">
            <h3>{card.title}</h3>
            <p className="admin-stat-value">{card.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;