import React, { useState, useEffect } from "react";
import { userBankAccountApi, userProfileApi } from "../../../Services/userProfileApi";
import { UserAuditLog } from "../../../Types/user";
import "./UserAuditLogs.css";

const UserAuditLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "bank">("profile");
  const [profileLogs, setProfileLogs] = useState<UserAuditLog[]>([]);
  const [bankLogs, setBankLogs] = useState<UserAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const safeFetchLogs = async (
    fetchFn: () => Promise<{ success: boolean; data?: any[] }>
  ): Promise<any[] | null> => {
    try {
      const res = await fetchFn();
      if (res.success && res.data) return res.data;
    } catch (err: any) {
      // 404 یعنی API وجود نداره (مثلاً برای user این APIها هنوز ساخته نشده) - بیخیال
      if (err.response?.status !== 404) {
        console.warn("Log fetch warning:", err);
        throw err; // خطاهای واقعی رو پاس بده به بالا
      }
    }
    return null;
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileResult, bankResult] = await Promise.all([
        safeFetchLogs(() => userProfileApi.getProfileHistory()),
        safeFetchLogs(() => userBankAccountApi.getBankAccountHistory()),
      ]);

      if (profileResult) setProfileLogs(profileResult);
      if (bankResult) setBankLogs(bankResult);
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
        return "user-al-badge-success";
      case "UPDATE":
        return "user-al-badge-warning";
      case "DELETE":
        return "user-al-badge-danger";
      default:
        return "user-al-badge-info";
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
    <div className="user-audit-logs-container">
      <div className="user-audit-logs-header">
        <h2>مدیریت لاگ‌ها</h2>
        <p>تاریخچه تغییرات اطلاعات کاربری و بانکی</p>
      </div>

      <div className="user-audit-tabs">
        <button
          className={`user-al-tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          📝 تاریخچه اطلاعات کاربر
        </button>
        <button
          className={`user-al-tab-btn ${activeTab === "bank" ? "active" : ""}`}
          onClick={() => setActiveTab("bank")}
        >
          🏦 تاریخچه اطلاعات بانکی
        </button>
      </div>

      <div className="user-audit-logs-card">
        {loading ? (
          <div className="user-al-loading-state">
            <div className="user-al-spinner"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : error ? (
          <div className="user-al-error-state">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchLogs} className="user-al-retry-btn">تلاش مجدد</button>
          </div>
        ) : currentLogs.length === 0 ? (
          <div className="user-al-empty-state">
            <span>📭</span>
            <p>هیچ تغییری ثبت نشده است</p>
          </div>
        ) : (
          <div className="user-al-logs-table-wrapper">
            <table className="user-al-logs-table">
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
                      <span className={`user-al-badge ${getActionColor(log.action)}`}>
                        {getActionPersian(log.action)}
                      </span>
                    </td>
                    <td>{new Date(log.timestamp).toLocaleDateString("fa-IR")}</td>
                    <td>{log.ipAddress || "-"}</td>
                    <td className="user-al-changes-cell">
                      {log.oldValue && (
                        <div className="user-al-change-item old">
                          <span className="user-al-change-label">قبلی:</span>
                          <span className="user-al-change-value">{log.oldValue}</span>
                        </div>
                      )}
                      {log.newValue && (
                        <div className="user-al-change-item new">
                          <span className="user-al-change-label">جدید:</span>
                          <span className="user-al-change-value">{log.newValue}</span>
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

export default UserAuditLogs;
