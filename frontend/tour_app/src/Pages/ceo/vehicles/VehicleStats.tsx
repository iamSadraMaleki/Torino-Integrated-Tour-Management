import React from "react";
import { FaCar, FaCheckCircle, FaWrench, FaBan, FaChair, FaChartBar } from "react-icons/fa";
import { VehicleStatistics } from "../../../Types/vehicle";

interface VehicleStatsProps {
  statistics: VehicleStatistics | null;
  loading: boolean;
}

const VehicleStats: React.FC<VehicleStatsProps> = ({ statistics, loading }) => {
  const stats = [
    {
      title: "کل ماشین‌ها",
      value: statistics?.totalVehicles || 0,
      icon: <FaCar />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      title: "فعال",
      value: statistics?.activeVehicles || 0,
      icon: <FaCheckCircle />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "در تعمیر",
      value: statistics?.underRepairVehicles || 0,
      icon: <FaWrench />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "غیرفعال",
      value: statistics?.inactiveVehicles || 0,
      icon: <FaBan />,
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
    {
      title: "کل صندلی‌ها",
      value: statistics?.totalSeats || 0,
      icon: <FaChair />,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
    },
  ];

  if (loading) {
    return (
      <div className="vehicle-stats-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="vehicle-stat-card skeleton">
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
    <div className="vehicle-stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="vehicle-stat-card" style={{ background: stat.bgColor }}>
          <div className="vehicle-stat-icon" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="vehicle-stat-info">
            <h3>{stat.title}</h3>
            <p className="vehicle-stat-value">{stat.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleStats;