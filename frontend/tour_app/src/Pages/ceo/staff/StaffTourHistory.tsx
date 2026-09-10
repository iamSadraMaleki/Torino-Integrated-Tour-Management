import React, { useCallback, useEffect, useState } from "react";
import { FaBus, FaTimes } from "react-icons/fa";
import { StaffMember } from "../../../Types/staff";
import { staffMemberApi } from "../../../Services/staffApi";
import { StaffTourHistory } from "../../../Types/staffPayment";
import { staffTourHistoryApi } from "../../../Services/staffPaymentApi";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }) : "-";

const StaffTourHistory: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0);
  const [tours, setTours] = useState<StaffTourHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTours, setLoadingTours] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffMemberApi.getAllStaffMembers();
      if (res.success) setStaffList(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت کارمندان");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const loadTours = useCallback(async (staffId: number) => {
    if (!staffId) {
      setTours([]);
      return;
    }
    setLoadingTours(true);
    setError("");
    try {
      const res = await staffTourHistoryApi.getToursByStaff(staffId);
      if (res.success) setTours(res.data || []);
      else setError(res.message || "خطا در دریافت تاریخچه سفر");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تاریخچه سفر");
    } finally {
      setLoadingTours(false);
    }
  }, []);

  const handleSelect = (staffId: number) => {
    setSelectedStaffId(staffId);
    loadTours(staffId);
  };

  const totalPayment = tours.reduce((sum, t) => sum + (t.paymentAmount || 0), 0);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="sp-section">
      {message && <div className={`toast-message ${message.type}`}>{message.text}</div>}

      <div className="section-header-actions">
        <h3>🚌 تاریخچه سفرهای کارمند</h3>
      </div>

      <div style={{ maxWidth: 400, marginBottom: "1rem" }}>
        <div className="form-group">
          <label>انتخاب کارمند</label>
          <select
            value={selectedStaffId}
            onChange={(e) => handleSelect(Number(e.target.value))}
          >
            <option value={0}>انتخاب کنید...</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName} — {s.position.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedStaffId === 0 ? (
        <div className="empty-state">
          <FaBus size={40} style={{ marginBottom: "0.5rem" }} />
          <p>برای مشاهده تاریخچه سفرها، ابتدا یک کارمند را انتخاب کنید</p>
        </div>
      ) : loadingTours ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>در حال دریافت تاریخچه...</p>
        </div>
      ) : (
        <>
          {/* خلاصه */}
          <div className="staff-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>
            <div className="staff-stat-card" style={{ background: "#0d948815", border: "1px solid #0d948830" }}>
              <div className="staff-stat-icon" style={{ color: "#0d9488" }}><FaBus /></div>
              <div className="staff-stat-info">
                <h3>تعداد تورها</h3>
                <p className="staff-stat-value">{tours.length} تور</p>
              </div>
            </div>
            <div className="staff-stat-card" style={{ background: "#3b82f615", border: "1px solid #3b82f630" }}>
              <div className="staff-stat-icon" style={{ color: "#3b82f6" }}>💰</div>
              <div className="staff-stat-info">
                <h3>مجموع دریافتی از تورها</h3>
                <p className="staff-stat-value" style={{ fontSize: "1rem" }}>{formatPrice(totalPayment)}</p>
              </div>
            </div>
            <div className="staff-stat-card" style={{ background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
              <div className="staff-stat-icon" style={{ color: "#f59e0b" }}>🗓️</div>
              <div className="staff-stat-info">
                <h3>آخرین تور</h3>
                <p className="staff-stat-value" style={{ fontSize: "1rem" }}>
                  {tours.length ? formatDate(tours[0].departureDate) : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>تور</th>
                  <th>کد</th>
                  <th>تاریخ حرکت</th>
                  <th>تاریخ بازگشت</th>
                  <th>مبلغ تخصیص</th>
                  <th>تاریخ تخصیص</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.tourName}</strong></td>
                    <td dir="ltr">{t.tourCode}</td>
                    <td>{formatDate(t.departureDate)}</td>
                    <td>{formatDate(t.returnDate)}</td>
                    <td style={{ fontWeight: 700, color: "#0d9488" }}>{formatPrice(t.paymentAmount)}</td>
                    <td>{formatDateTime(t.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tours.length === 0 && (
              <div className="empty-state">
                <p>این کارمند هنوز در هیچ توری تخصیص داده نشده است</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StaffTourHistory;
