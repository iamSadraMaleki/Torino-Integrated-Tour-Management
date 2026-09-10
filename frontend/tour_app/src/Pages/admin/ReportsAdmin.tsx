import React from "react";
import "./AdminDashboard.css";

const ReportsAdmin: React.FC = () => {
  return (
    <div className="reports-admin-container">
      <div className="page-header-simple">
        <h2>📈 گزارشات کل</h2>
        <p>مشاهده گزارشات جامع سیستم</p>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h3>در حال ساخت...</h3>
        <p>به زودی این بخش تکمیل خواهد شد</p>
      </div>
    </div>
  );
};

export default ReportsAdmin;