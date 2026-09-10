import React from "react";
import { useAuth } from "../../Context/AuthContext";
import "./DashboardHeader.css";

interface DashboardHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  role: "user" | "ceo" | "admin";
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar, sidebarOpen, role }) => {
  const { user, logout } = useAuth();

  const getRoleTitle = () => {
    switch (role) {
      case "admin":
        return "پنل مدیریت";
      case "ceo":
        return "پنل مدیر آژانس";
      default:
        return "پنل کاربری";
    }
  };

  const handleLogout = async () => {
    if (window.confirm("آیا از خروج از سیستم اطمینان دارید؟")) {
      await logout();
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <div className="logo">
            <span className="logo-icon">✈️</span>
            <span className="logo-text">تورینو</span>
            <span className="logo-badge">{getRoleTitle()}</span>
          </div>
        </div>

        <div className="header-right">
          <div className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </div>

          <div className="user-menu">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username || "کاربر"}</span>
              <span className="user-role">{getRoleTitle()}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 خروج
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;