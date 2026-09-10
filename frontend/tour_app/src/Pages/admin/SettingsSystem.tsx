import React from "react";
import "./AdminDashboard.css";

const SettingsSystem: React.FC = () => {
  return (
    <div className="settings-system-container">
      <div className="page-header-simple">
        <h2>🔧 تنظیمات سیستم</h2>
        <p>مدیریت تنظیمات کلی سیستم</p>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h3>در حال ساخت...</h3>
        <p>به زودی این بخش تکمیل خواهد شد</p>
      </div>
    </div>
  );
};

export default SettingsSystem;