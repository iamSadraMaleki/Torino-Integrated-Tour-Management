import React, { useState, useEffect } from "react";
import { staffMemberApi } from "../../../Services/staffApi";
import StaffStats from "./StaffStats";
import PositionsList from "./PositionsList";
import StaffList from "./StaffList";
import StaffPayments from "./StaffPayments";
import StaffPaymentStats from "./StaffPaymentStats";
import StaffTourHistory from "./StaffTourHistory";
import { StaffStatistics } from "../../../Types/staff";
import "./StaffManagement.css";

const StaffManagement: React.FC = () => {
  const [statistics, setStatistics] = useState<StaffStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<"positions" | "staff" | "payments" | "payment-stats" | "tour-history">("positions");

  const fetchStatistics = async () => {
    setLoadingStats(true);
    try {
      const response = await staffMemberApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleDataChange = () => {
    fetchStatistics();
  };

  return (
    <div className="staff-management-container">
      <div className="page-header-simple">
        <h1>👥 مدیریت کارمندان</h1>
        <p>مدیریت سمت‌ها و کارمندان آژانس خود</p>
      </div>

      <StaffStats statistics={statistics} loading={loadingStats} />

      <div className="staff-tabs">
        <button
          className={`tab-btn ${activeTab === "positions" ? "active" : ""}`}
          onClick={() => setActiveTab("positions")}
        >
          📋 مدیریت سمت‌ها
        </button>
        <button
          className={`tab-btn ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          👥 مدیریت کارمندان
        </button>
        <button
          className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          💳 دفتر پرداخت‌ها
        </button>
        <button
          className={`tab-btn ${activeTab === "payment-stats" ? "active" : ""}`}
          onClick={() => setActiveTab("payment-stats")}
        >
          📊 آمار پرداختی
        </button>
        <button
          className={`tab-btn ${activeTab === "tour-history" ? "active" : ""}`}
          onClick={() => setActiveTab("tour-history")}
        >
          🚌 تاریخچه سفر کارمند
        </button>
      </div>

      <div className="staff-tab-content">
        {activeTab === "positions" && <PositionsList onPositionChange={handleDataChange} />}
        {activeTab === "staff" && <StaffList onStaffChange={handleDataChange} />}
        {activeTab === "payments" && <StaffPayments />}
        {activeTab === "payment-stats" && <StaffPaymentStats />}
        {activeTab === "tour-history" && <StaffTourHistory />}
      </div>
    </div>
  );
};

export default StaffManagement;