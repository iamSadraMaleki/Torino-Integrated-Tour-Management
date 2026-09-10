import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reservationApi } from "../../../Services/reservationApi";
import {
  RefundRequest,
  RefundRequestStatus,
  RefundRequestStatusColors,
  RefundRequestStatusPersian,
  Reservation,
  ReservationStatus,
  ReservationStatusColors,
  ReservationStatusPersian,
} from "../../../Types/reservation";
import CancelRequestModal from "./CancelRequestModal";
import ConfirmCancelModal from "./ConfirmCancelModal";
import TicketModal from "./TicketModal";
import "../../ceo/CeoDashboard.css";
import "../UserPages.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const MyBookings: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // وضعیت‌های کنسلی
  const [cancelModal, setCancelModal] = useState<{ open: boolean; reservationId: number; passengers: any[] }>({
    open: false,
    reservationId: 0,
    passengers: [],
  });
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; refundRequest: RefundRequest | null }>({
    open: false,
    refundRequest: null,
  });
  const [refundStatuses, setRefundStatuses] = useState<Record<number, RefundRequest | null>>({});
  const [loadingStatuses, setLoadingStatuses] = useState<Record<number, boolean>>({});

  // بلیط گرافیکی
  const [ticketModal, setTicketModal] = useState<{ open: boolean; reservationId: number }>({
    open: false,
    reservationId: 0,
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reservationApi.getMyReservations();
      if (res.success) {
        setReservations(res.data || []);
        // برای رزروهای CONFIRMED وضعیت کنسلی رو چک کن
        const confirmed = (res.data || []).filter(
          (r) => r.status === ReservationStatus.CONFIRMED
        );
        for (const r of confirmed) {
          fetchCancelStatus(r.id);
        }
      }
    } catch {
      setError("خطا در دریافت رزروها");
    } finally {
      setLoading(false);
    }
  };

  const fetchCancelStatus = async (reservationId: number) => {
    setLoadingStatuses((prev) => ({ ...prev, [reservationId]: true }));
    try {
      const res = await reservationApi.getCancelStatus(reservationId);
      if (res.success && res.data) {
        setRefundStatuses((prev) => ({ ...prev, [reservationId]: res.data }));
        // اگر رسید آپلود شده، مودال تایید رو نشون بده
        if (res.data.status === "REFUND_RECEIPT_UPLOADED") {
          setConfirmModal({ open: true, refundRequest: res.data });
        }
      }
    } catch {
      // 404 یعنی درخواست کنسلی نداره - طبیعیه
    } finally {
      setLoadingStatuses((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const handleCancelSuccess = (data?: RefundRequest) => {
    // آپدیت لحظه‌ای وضعیت بدون نیاز به رفرش
    if (data) {
      setRefundStatuses((prev) => ({ ...prev, [data.reservationId]: data }));
    }
    fetchReservations();
  };

  // نمایش دکمه/وضعیت کنسلی برای هر رزرو
  const renderCancelAction = (r: Reservation) => {
    if (r.status !== ReservationStatus.CONFIRMED) return null;

    const refundReq = refundStatuses[r.id];
    const isLoading = loadingStatuses[r.id];

    if (isLoading) {
      return <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>⏳...</span>;
    }

    if (!refundReq) {
      // هنوز درخواست کنسلی نداده
      return (
        <button
          className="btn-danger"
          style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
          onClick={() =>
            setCancelModal({
              open: true,
              reservationId: r.id,
              passengers: r.passengers || [],
            })
          }
        >
          لغو رزرو
        </button>
      );
    }

    // درخواست کنسلی فعال داره
    if (refundReq.status === "PENDING") {
      return (
        <span
          className="status-badge"
          style={{
            background: `${RefundRequestStatusColors.PENDING}22`,
            color: RefundRequestStatusColors.PENDING,
          }}
        >
          {refundReq.statusPersian}
        </span>
      );
    }

    if (refundReq.status === "REFUND_RECEIPT_UPLOADED") {
      return (
        <button
          className="btn-success"
          style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
          onClick={() => setConfirmModal({ open: true, refundRequest: refundReq })}
        >
          مشاهده و تایید
        </button>
      );
    }

    if (refundReq.status === "CONFIRMED") {
      return (
        <span
          className="status-badge"
          style={{
            background: `${RefundRequestStatusColors.CONFIRMED}22`,
            color: RefundRequestStatusColors.CONFIRMED,
          }}
        >
          {refundReq.statusPersian}
        </span>
      );
    }

    if (refundReq.status === "REJECTED") {
      return (
        <span
          className="status-badge"
          style={{
            background: `${RefundRequestStatusColors.REJECTED}22`,
            color: RefundRequestStatusColors.REJECTED,
          }}
        >
          {refundReq.statusPersian}
        </span>
      );
    }

    return null;
  };

  // دکمه بلیط — فقط برای رزروهای تایید شده
  const renderTicketAction = (r: Reservation) => {
    if (r.status !== ReservationStatus.CONFIRMED) return null;
    return (
      <button
        className="btn-secondary"
        style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
        onClick={() => setTicketModal({ open: true, reservationId: r.id })}
        title="دریافت بلیط سفر"
      >
        🎫 بلیط
      </button>
    );
  };

  // ترکیب دکمه بلیط + اقدامات کنسلی در ستون عملیات
  const renderActions = (r: Reservation) => (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      {renderTicketAction(r)}
      {renderCancelAction(r)}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری رزروها...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1 className="page-title">📅 رزروهای من</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-secondary" onClick={fetchReservations}>
            بروزرسانی
          </button>
          <Link to="/user/dashboard/tours" className="btn-primary">
            رزرو تور جدید
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="section-card">
        {reservations.length === 0 ? (
          <div className="empty-state">
            <p>هنوز رزروی ثبت نکرده‌اید.</p>
            <Link to="/user/dashboard/tours" className="btn-primary" style={{ marginTop: "1rem" }}>
              مشاهده تورها
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>تور</th>
                  <th>تاریخ حرکت</th>
                  <th>مسافران</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                  <th>تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.tourName}</strong>
                      <br />
                      <small style={{ color: "#94a3b8" }}>{r.tourCode}</small>
                    </td>
                    <td>{formatDate(r.departureDate)}</td>
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
                    <td>{renderActions(r)}</td>
                    <td>{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مودال درخواست لغو */}
      <CancelRequestModal
        isOpen={cancelModal.open}
        reservationId={cancelModal.reservationId}
        passengers={cancelModal.passengers}
        onClose={() => setCancelModal({ open: false, reservationId: 0, passengers: [] })}
        onSuccess={handleCancelSuccess}
      />

      {/* مودال تایید نهایی لغو */}
      <ConfirmCancelModal
        isOpen={confirmModal.open}
        refundRequest={confirmModal.refundRequest!}
        onClose={() => setConfirmModal({ open: false, refundRequest: null })}
        onSuccess={handleCancelSuccess}
      />

      {/* مودال بلیط گرافیکی */}
      <TicketModal
        isOpen={ticketModal.open}
        reservationId={ticketModal.reservationId}
        onClose={() => setTicketModal({ open: false, reservationId: 0 })}
      />
    </div>
  );
};

export default MyBookings;
