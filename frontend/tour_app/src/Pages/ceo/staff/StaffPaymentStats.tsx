import React, { useCallback, useEffect, useState } from "react";
import { FaMoneyBillWave, FaCoins, FaGift, FaReceipt } from "react-icons/fa";
import { StaffPaymentStats } from "../../../Types/staffPayment";
import { staffPaymentApi } from "../../../Services/staffPaymentApi";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const monthPersian = (month: string) => {
  try {
    const [y, m] = month.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString("fa-IR", { year: "numeric", month: "long" });
  } catch {
    return month;
  }
};

const StaffPaymentStats: React.FC = () => {
  const [stats, setStats] = useState<StaffPaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await staffPaymentApi.getStatistics();
      if (res.success) setStats(res.data);
      else setError(res.message || "خطا در دریافت آمار");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت آمار");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال محاسبه آمار...</p>
      </div>
    );
  }

  if (error) {
    return <div className="empty-state"><p>{error}</p></div>;
  }

  const cards = [
    { icon: <FaMoneyBillWave />, label: "کل پرداختی", value: formatPrice(stats?.totalPaid || 0), color: "#0d9488" },
    { icon: <FaCoins />, label: "مجموع حقوق", value: formatPrice(stats?.totalSalary || 0), color: "#3b82f6" },
    { icon: <FaGift />, label: "مجموع پاداش", value: formatPrice(stats?.totalBonus || 0), color: "#f59e0b" },
    { icon: <FaReceipt />, label: "تعداد پرداخت‌ها", value: `${stats?.paymentCount || 0}`, color: "#8b5cf6" },
  ];

  return (
    <div className="sp-stats">
      <div className="section-header-actions">
        <h3>📊 آمار پرداختی کارکنان</h3>
        <button className="btn-add" onClick={fetchStats}>بروزرسانی</button>
      </div>

      <div className="staff-stats-grid">
        {cards.map((c, i) => (
          <div
            key={i}
            className="staff-stat-card"
            style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}
          >
            <div className="staff-stat-icon" style={{ color: c.color }}>{c.icon}</div>
            <div className="staff-stat-info">
              <h3>{c.label}</h3>
              <p className="staff-stat-value" style={{ fontSize: "1.1rem" }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="staff-table-wrapper" style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ margin: "0 0 0.75rem", color: "#1e293b" }}>👥 پرداختی به تفکیک کارمند</h4>
        <table className="staff-table">
          <thead>
            <tr>
              <th>کارمند</th>
              <th>مجموع حقوق</th>
              <th>مجموع پاداش</th>
              <th>مجموع کل</th>
              <th>تعداد پرداخت</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.perStaff || []).map((s) => (
              <tr key={s.staffMemberId}>
                <td><strong>{s.staffName}</strong></td>
                <td style={{ color: "#3b82f6" }}>{formatPrice(s.salaryTotal)}</td>
                <td style={{ color: "#f59e0b" }}>{formatPrice(s.bonusTotal)}</td>
                <td style={{ fontWeight: 700, color: "#0d9488" }}>{formatPrice(s.total)}</td>
                <td>{s.paymentCount} پرداخت</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!stats?.perStaff || stats.perStaff.length === 0) && (
          <div className="empty-state"><p>هنوز پرداختی ثبت نشده است</p></div>
        )}
      </div>

      <div className="staff-table-wrapper">
        <h4 style={{ margin: "0 0 0.75rem", color: "#1e293b" }}>🗓️ پرداختی به تفکیک ماه</h4>
        <table className="staff-table">
          <thead>
            <tr>
              <th>ماه</th>
              <th>مجموع پرداختی</th>
              <th>تعداد پرداخت</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.perMonth || []).map((m) => (
              <tr key={m.month}>
                <td>{monthPersian(m.month)}</td>
                <td style={{ fontWeight: 700, color: "#0d9488" }}>{formatPrice(m.total)}</td>
                <td>{m.paymentCount} پرداخت</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!stats?.perMonth || stats.perMonth.length === 0) && (
          <div className="empty-state"><p>داده‌ای برای نمایش وجود ندارد</p></div>
        )}
      </div>
    </div>
  );
};

export default StaffPaymentStats;
