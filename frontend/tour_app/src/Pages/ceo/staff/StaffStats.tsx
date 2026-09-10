import React from "react";
import { FaUsers, FaUserCheck, FaUserTimes, FaBriefcase } from "react-icons/fa";
import { StaffStatistics } from "../../../Types/staff";

interface StaffStatsProps {
  statistics: StaffStatistics | null;
  loading: boolean;
}

const StaffStats: React.FC<StaffStatsProps> = ({ statistics, loading }) => {
  // استخراج مقادیر
  const totalStaff = statistics?.totalStaff ?? 0;
  const activeStaff = statistics?.activeStaff ?? 0;
  const inactiveStaff = statistics?.inactiveStaff ?? 0;
  
  // ⭐ موقتاً از totalPositions استفاده کن (چون activePositions نداریم)
  const totalPositions = statistics?.totalPositions ?? 0;

  const stats = [
    {
      title: "کل کارمندان",
      value: totalStaff,
      icon: <FaUsers />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      title: "کارمندان فعال",
      value: activeStaff,
      icon: <FaUserCheck />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "کارمندان غیرفعال",
      value: inactiveStaff,
      icon: <FaUserTimes />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "کل سمت‌ها",  // ⭐ تغییر عنوان
      value: totalPositions,
      icon: <FaBriefcase />,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
    },
  ];

  if (loading) {
    return (
      <div className="staff-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="staff-stat-card skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-value"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="staff-stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="staff-stat-card" style={{ background: stat.bgColor }}>
          <div className="staff-stat-icon" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="staff-stat-info">
            <h3>{stat.title}</h3>
            <p className="staff-stat-value">{stat.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffStats;