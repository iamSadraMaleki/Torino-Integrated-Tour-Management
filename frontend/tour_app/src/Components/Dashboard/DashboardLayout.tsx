import React, { ReactNode, useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import AnnouncementsBanner from "./AnnouncementsBanner";
import api from "../../Router/api";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: "user" | "ceo" | "admin";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isVerified, setIsVerified] = useState(true); // پیشفرض true

  useEffect(() => {
    if (role === "ceo") {
      checkVerificationStatus();
    }
  }, [role]);

  const checkVerificationStatus = async () => {
    try {
      const response = await api.get("/api/ceo-verification/is-verified");
      setIsVerified(response.data.verified);
    } catch (error) {
      console.error("Error checking verification:", error);
      setIsVerified(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} role={role} />
      <div className="dashboard-body">
        <DashboardSidebar isOpen={sidebarOpen} role={role} isVerified={isVerified} />
        <main className={`dashboard-main ${!sidebarOpen ? "expanded" : ""}`}>            <div className="dashboard-content">
            <div className="page-header">
              <h1 className="page-title">{title}</h1>
              <div className="page-breadcrumb">
                <span>داشبورد</span>
                <span className="separator">/</span>
                <span className="current">{title}</span>
              </div>
            </div>
            {/* اطلاعیه‌های سراسری - در همه صفحات داشبورد کاربر و مدیر آژانس */}
            {role !== "admin" && <AnnouncementsBanner />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;