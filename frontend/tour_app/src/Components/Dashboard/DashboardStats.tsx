import React from "react";

interface StatItem {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "up" | "down";
}

interface DashboardStatsProps {
  stats: StatItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-info">
            <h3>{stat.title}</h3>
            <p className="stat-number">{stat.value}</p>
            {stat.change && (
              <span className={`stat-change ${stat.changeType}`}>
                {stat.changeType === "up" ? "↑" : "↓"} {stat.change}
              </span>
            )}
          </div>
          <div className="stat-icon">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;