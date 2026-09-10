import React, { useEffect, useState } from "react";
import { ceoReservationApi } from "../../../Services/ceoReservationApi";
import {
  Reservation,
  ReservationStatus,
  ReservationStatusColors,
  ReservationStatusPersian,
} from "../../../Types/reservation";
import "../../ceo/CeoDashboard.css";
import "../../user/UserPages.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const PaymentApprovals: React.FC = () => {
  const [pending, setPending] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    setDebugInfo(null);
    try {
      const [pendingRes, allRes] = await Promise.all([
        ceoReservationApi.getPending(),
        ceoReservationApi.getAll(),
      ]);
      
      if (!pendingRes.success) {
        console.warn("Pending reservations API returned non-success:", pendingRes);
        setDebugInfo(`API Pending: ${pendingRes.message || 'بدون پیام'}`);
      }
      if (!allRes.success) {
        console.warn("All reservations API returned non-success:", allRes);
        setDebugInfo(prev => `${prev || ''} | API All: ${allRes.message || 'بدون پیام'}`);
      }
      
      setPending(pendingRes.data || []);
      setAllReservations(allRes.data || []);
      
      if (pendingRes.data?.length === 0 && allRes.data?.length === 0) {
        setDebugInfo("رزروی یافت نشد. ممکن است تور فعالی نداشته باشید یا رزرو جدیدی ثبت نشده باشد.");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "خطا در دریافت رزروها";
      console.error("Error fetching reservations:", err);
      setMessage({ type: "error", text: errorMsg });
      setDebugInfo(`Error: ${errorMsg} (${err.response?.status || "بدون کد"})`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId: number) => {
    setActionLoading(reservationId);
    setMessage(null);
    try {
      const res = await ceoReservationApi.approve(reservationId);
      if (res.success) {
        setMessage({ type: "success", text: "رزرو با موفقیت تأیید شد" });
        fetchData();
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در تأیید رزرو",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) return;
    setActionLoading(rejectModal.id);
    try {
      const res = await ceoReservationApi.reject(rejectModal.id, rejectReason);
      if (res.success) {
        setMessage({ type: "success", text: "رزرو رد شد" });
        setRejectModal({ open: false, id: null });
        setRejectReason("");
        fetchData();
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در رد رزرو",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const list = activeTab === "pending" ? pending : allReservations;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="payment-approvals-page">
      <div className="page-header">
        <h1 className="page-title">💳 تأیید پرداخت‌ها</h1>
        <button className="btn-secondary" onClick={fetchData}>
          بروزرسانی
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      {debugInfo && (
        <div className="alert alert-info" style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}>
          ℹ️ {debugInfo}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          className={activeTab === "pending" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("pending")}
        >
          در انتظار تأیید ({pending.length})
        </button>
        <button
          className={activeTab === "all" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("all")}
        >
          همه رزروها ({allReservations.length})
        </button>
      </div>

      <div className="section-card">
        {list.length === 0 ? (
          <div className="empty-state">
            {activeTab === "pending" ? "پرداختی در انتظار تأیید نیست." : "رزروی ثبت نشده است."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>تور</th>
                  <th>مسافران</th>
                  <th>تعداد</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>رسید</th>
                  {activeTab === "pending" && <th>عملیات</th>}
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.userUsername}</strong>
                      <br />
                      <small>{r.userMobile}</small>
                    </td>
                    <td>
                      {r.tourName}
                      <br />
                      <small>{formatDate(r.departureDate)}</small>
                    </td>
                    <td>
                      {r.passengers && r.passengers.length > 0 ? (
                        <div style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>
                          {r.passengers.map((p, index) => (
                            <div key={p.id}>
                              {p.firstName} {p.lastName}
                              <span style={{ color: "#666", marginRight: "4px" }}>
                                ({p.nationalCode})
                              </span>
                              {index < r.passengers.length - 1 && " - "}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "#999", fontSize: "0.85rem" }}>بدون مسافر</span>
                      )}
                    </td>
                    <td>{r.passengerCount} نفر</td>
                    <td>{formatPrice(r.totalPrice)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: `${ReservationStatusColors[r.status as ReservationStatus]}22`,
                          color: ReservationStatusColors[r.status as ReservationStatus],
                        }}
                      >
                        {r.statusPersian || ReservationStatusPersian[r.status as ReservationStatus]}
                      </span>
                    </td>
                    <td>
                      {r.paymentProof ? (
                        <div>
                          <small>از: {r.paymentProof.sourceCardNumber}</small>
                          <br />
                          {r.paymentProof.receiptImageUrl && (
                            <a
                              href={r.paymentProof.receiptImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: "0.75rem", color: "#0d9488" }}
                            >
                              مشاهده رسید
                            </a>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    {activeTab === "pending" && (
                      <td>
                        <div className="approval-actions">
                          <button
                            className="btn-success"
                            disabled={actionLoading === r.id}
                            onClick={() => handleApprove(r.id)}
                          >
                            {actionLoading === r.id ? "..." : "تأیید"}
                          </button>
                          <button
                            className="btn-danger"
                            disabled={actionLoading === r.id}
                            onClick={() => setRejectModal({ open: true, id: r.id })}
                          >
                            رد
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, id: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>رد رزرو</h3>
            <div className="form-group">
              <label>دلیل رد</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="دلیل رد رسید پرداخت..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setRejectModal({ open: false, id: null })}
              >
                انصراف
              </button>
              <button className="btn-danger" onClick={handleReject}>
                رد رزرو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentApprovals;