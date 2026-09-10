import React from "react";
import HotelsList from "./HotelsList";
import "./HotelsManagement.css";

const HotelsManagement: React.FC = () => {
  return (
    <div className="hotels-management-container">
      <div className="page-header-simple">
        <h1>🏨 مدیریت هتل‌ها</h1>
        <p>مدیریت هتل‌های آژانس خود</p>
      </div>

      <HotelsList />
    </div>
  );
};

export default HotelsManagement;