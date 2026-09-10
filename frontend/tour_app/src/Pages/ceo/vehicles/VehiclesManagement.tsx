import React, { useState, useEffect } from "react";
import VehiclesList from "./VehiclesList";
import VehicleStats from "./VehicleStats";
import VehicleFeaturesList from "./VehicleFeaturesList";
import VehicleTourHistory from "./VehicleTourHistory";
import VehicleRepairs from "./VehicleRepairs";
import { vehicleApi } from "../../../Services/vehicleApi";
import { VehicleStatistics } from "../../../Types/vehicle";
import "./VehiclesManagement.css";

const VehiclesManagement: React.FC = () => {
  const [statistics, setStatistics] = useState<VehicleStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<"vehicles" | "features" | "tours" | "repairs">("vehicles");

  const fetchStatistics = async () => {
    setLoadingStats(true);
    try {
      const response = await vehicleApi.getStatistics();
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
    <div className="vehicles-management-container">
      <div className="page-header-simple">
        <h1>🚗 مدیریت خودروها</h1>
        <p>مدیریت خودروهای آژانس خود</p>
      </div>

      <VehicleStats statistics={statistics} loading={loadingStats} />

      <div className="vehicles-tabs">
        <button
          className={`tab-btn ${activeTab === "vehicles" ? "active" : ""}`}
          onClick={() => setActiveTab("vehicles")}
        >
          🚗 لیست خودروها
        </button>
        <button
          className={`tab-btn ${activeTab === "features" ? "active" : ""}`}
          onClick={() => setActiveTab("features")}
        >
          🔧 مدیریت ویژگی‌ها
        </button>
        <button
          className={`tab-btn ${activeTab === "tours" ? "active" : ""}`}
          onClick={() => setActiveTab("tours")}
        >
          🚌 تاریخچه سفر خودرو
        </button>
        <button
          className={`tab-btn ${activeTab === "repairs" ? "active" : ""}`}
          onClick={() => setActiveTab("repairs")}
        >
          🔧 دفتر تعمیرات
        </button>
      </div>

      <div className="vehicles-tab-content">
        {activeTab === "vehicles" && <VehiclesList onVehicleChange={handleDataChange} />}
        {activeTab === "features" && <VehicleFeaturesList onFeatureChange={handleDataChange} />}
        {activeTab === "tours" && <VehicleTourHistory />}
        {activeTab === "repairs" && <VehicleRepairs />}
      </div>
    </div>
  );
};

export default VehiclesManagement;