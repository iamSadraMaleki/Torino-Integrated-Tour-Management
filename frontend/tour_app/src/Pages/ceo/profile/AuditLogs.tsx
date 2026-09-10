import React, { useState, useEffect } from "react";
import { bankAccountApi, ceoProfileApi } from "../../../Services/ceoApi";
import { AuditLog } from "../../../Types/ceo";
import "./AuditLogs.css";

const AuditLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "bank">("profile");
  const [profileLogs, setProfileLogs] = useState<AuditLog[]>([]);
  const [bankLogs, setBankLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // دریافت تاریخچه پروفایل
      const profileResponse = await ceoProfileApi.getProfileHistory();
      if (profileResponse.success) {
        setProfileLogs(profileResponse.data || []);
      }

      // دریافت تاریخچه حساب بانکی
      const bankResponse = await bankAccountApi.getBankAccountHistory();
      if (bankResponse.success) {
        setBankLogs(bankResponse.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError("خطا در دریافت تاریخچه تغییرات");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "badge-success";
      case "UPDATE":
        return "badge-warning";
      case "DELETE":
        return "badge-danger";
      default:
        return "badge-info";
    }
  };

  const getActionPersian = (action: string) => {
    switch (action) {
      case "CREATE":
        return "ایجاد";
      case "UPDATE":
        return "ویرایش";
      case "DELETE":
        return "حذف";
      default:
        return action;
    }
  };

  const currentLogs = activeTab === "profile" ? profileLogs : bankLogs;

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <h2>مدیریت لاگ‌ها</h2>
        <p>تاریخچه تغییرات اطلاعات کاربری و بانکی</p>
      </div>

      <div className="audit-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          📝 تاریخچه اطلاعات کاربر
        </button>
        <button
          className={`tab-btn ${activeTab === "bank" ? "active" : ""}`}
          onClick={() => setActiveTab("bank")}
        >
          🏦 تاریخچه اطلاعات بانکی
        </button>
      </div>

      <div className="audit-logs-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchLogs} className="retry-btn">تلاش مجدد</button>
          </div>
        ) : currentLogs.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>هیچ تغییری ثبت نشده است</p>
          </div>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>عملیات</th>
                  <th>تاریخ و زمان</th>
                  <th>آی پی</th>
                  <th>تغییرات</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`badge ${getActionColor(log.action)}`}>
                        {getActionPersian(log.action)}
                      </span>
                    </td>
                    <td>{new Date(log.timestamp).toLocaleDateString("fa-IR")}</td>
                    <td>{log.ipAddress || "-"}</td>
                    <td className="changes-cell">
                      {log.oldValue && (
                        <div className="change-item old">
                          <span className="change-label">قبلی:</span>
                          <span className="change-value">{log.oldValue}</span>
                        </div>
                      )}
                      {log.newValue && (
                        <div className="change-item new">
                          <span className="change-label">جدید:</span>
                          <span className="change-value">{log.newValue}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;