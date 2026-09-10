import React, { useCallback, useEffect, useState } from "react";
import { adminUserApi, adminVerificationApi } from "../../services/adminApi";
import { CeoVerification, User } from "../../Types/admin";
import "./AgenciesList.css";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const statusBadge = (status?: string) => {
  switch (status) {
    case "VERIFIED":
      return <span className="ag-status verified">✓ تأیید شده</span>;
    case "PENDING":
      return <span className="ag-status pending">⏳ در انتظار</span>;
    case "REJECTED":
      return <span className="ag-status rejected">✕ رد شده</span>;
    default:
      return <span className="ag-status not-verified">— احراز نشده</span>;
  }
};

const AgenciesList: React.FC = () => {
  const [agencies, setAgencies] = useState<(User & { verification?: CeoVerification })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [users, verifications] = await Promise.all([
        adminUserApi.getUsersByRole("ROLE_CEO"),
        adminVerificationApi.getAllVerifications(),
      ]);
      const verMap = new Map<number, CeoVerification>();
      (verifications || []).forEach((v) => verMap.set(v.userId, v));

      const list = (users || [])
        .map((u) => ({ ...u, verification: verMap.get(u.id) }))
        .sort((a, b) => {
          const sa = a.verification?.status || "NOT_VERIFIED";
          const sb = b.verification?.status || "NOT_VERIFIED";
          if (sa === "PENDING" && sb !== "PENDING") return -1;
          if (sa !== "PENDING" && sb === "PENDING") return 1;
          return a.username.localeCompare(b.username);
        });
      setAgencies(list);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت لیست آژانس‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  return (
    <div className="ag-container">
      <div className="ag-header">
        <div>
          <h2>🏛️ لیست آژانس‌ها</h2>
          <p>همه مدیران آژانس ثبت‌نام‌شده به همراه وضعیت احراز هویت</p>
        </div>
        <button className="btn-secondary" onClick={fetchAgencies}>
          🔄 بروزرسانی
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>در حال بارگذاری آژانس‌ها...</p>
        </div>
      ) : agencies.length === 0 ? (
        <div className="ag-empty">
          <div className="ag-empty-icon">🏛️</div>
          <p>آژانسی ثبت نشده است</p>
        </div>
      ) : (
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>نام آژانس</th>
                <th>مدیر آژانس</th>
                <th>ایمیل</th>
                <th>موبایل</th>
                <th>وضعیت احراز هویت</th>
                <th>تاریخ درخواست</th>
                <th>حساب</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((a) => (
                <tr key={a.id}>
                  <td className="ag-cell-name">
                    <span className="ag-name">{a.verification?.agencyName || "-"}</span>
                    <span className="ag-legal">{a.verification?.legalName || ""}</span>
                  </td>
                  <td className="ag-cell-ltr">@{a.username}</td>
                  <td className="ag-cell-ltr">{a.email || "-"}</td>
                  <td className="ag-cell-ltr" style={{ direction: "ltr" }}>
                    {a.mobile || "-"}
                  </td>
                  <td>{statusBadge(a.verification?.status)}</td>
                  <td>{formatDate(a.verification?.submittedAt)}</td>
                  <td>
                    {a.enabled ? (
                      <span className="ag-status enabled">فعال</span>
                    ) : (
                      <span className="ag-status disabled">معلق</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgenciesList;
