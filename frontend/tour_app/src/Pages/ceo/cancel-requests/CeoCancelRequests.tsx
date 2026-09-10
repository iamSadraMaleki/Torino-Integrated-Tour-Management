import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ceoReservationApi } from "../../../Services/ceoReservationApi";
import {
  RefundRequest,
  RefundRequestStatus,
  RefundRequestStatusColors,
  RefundRequestStatusPersian,
} from "../../../Types/reservation";
import "../../ceo/CeoDashboard.css";
import "../../user/UserPages.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const CeoCancelRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // مودال آپلود رسید
  const [uploadModal, setUploadModal] = useState<{ open: boolean; request: RefundRequest | null }>({
    open: false,
    request: null,
  });
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // مودال رد
  const [rejectModal, setRejectModal] = useState<{ open: boolean; request: RefundRequest | null }>({
    open: false,
    request: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await ceoReservationApi.getCancelRequests();
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در دریافت درخواست‌های لغو",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReceiptImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadReceipt = async () => {
    if (!uploadModal.request || !receiptImageUrl) return;
    setUploadLoading(true);
    setMessage(null);
    try {
      const res = await ceoReservationApi.uploadRefundReceipt(
        uploadModal.request.id,
        receiptImageUrl
      );
      if (res.success) {
        setMessage({ type: "success", text: "رسید برگشت وجه با موفقیت آپلود شد" });
        setUploadModal({ open: false, request: null });
        setReceiptImageUrl("");
        fetchRequests();
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در آپلود رسید",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.request) return;
    setRejectLoading(true);
    setMessage(null);
    try {
      const res = await ceoReservationApi.rejectCancelRequest(
        rejectModal.request.id,
        rejectReason.trim() || "بدون دلیل"
      );
      if (res.success) {
        setMessage({ type: "success", text: "درخواست لغو رد شد" });
        setRejectModal({ open: false, request: null });
        setRejectReason("");
        fetchRequests();
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در رد درخواست",
      });
    } finally {
      setRejectLoading(false);
    }
  };

  // جدا کردن بر اساس وضعیت
  const pending = requests.filter((r) => r.status === "PENDING");
  const uploaded = requests.filter((r) => r.status === "REFUND_RECEIPT_UPLOADED");
  const completed = requests.filter(
    (r) => r.status === "CONFIRMED" || r.status === "REJECTED"
  );

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
        <h1 className="page-title">📋 درخواست‌های لغو رزرو</h1>
        <button className="btn-secondary" onClick={fetchRequests}>
          بروزرسانی
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <p>درخواست لغوی ثبت نشده است.</p>
          </div>
        </div>
      ) : (
        <>
          {/* درخواست‌های pending */}
          {pending.length > 0 && (
            <div className="section-card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#f59e0b", marginBottom: "1rem" }}>
                🟡 در انتظار بررسی ({pending.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table className="reservations-table">
                  <thead>
                    <tr>
                      <th>کاربر</th>
                      <th>تور</th>
                      <th>مبلغ برگشتی</th>
                      <th>شماره کارت</th>
                      <th>نوع لغو</th>
                      <th>تاریخ درخواست</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.userUsername}</strong>
                          <br />
                          <small>{r.userMobile}</small>
                        </td>
                        <td>
                          {r.tourName}
                          <br />
                          <small>{r.tourCode}</small>
                        </td>
                        <td style={{ color: "#0d9488", fontWeight: 600 }}>
                          {formatPrice(r.refundAmount)}
                        </td>
                        <td>
                          <span style={{ direction: "ltr", fontFamily: "monospace", fontSize: "0.85rem" }}>
                            {r.targetCardNumber}
                          </span>
                        </td>
                        <td>
                          {r.cancelledPassengerIds && r.cancelledPassengerIds.length > 0
                            ? "🔀 انتخابی"
                            : "✅ کامل"}
                        </td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button
                              className="btn-success"
                              onClick={() => setUploadModal({ open: true, request: r })}
                            >
                              📤 آپلود رسید برگشت
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => setRejectModal({ open: true, request: r })}
                            >
                              رد
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* درخواست‌هایی که رسید آپلود شده */}
          {uploaded.length > 0 && (
            <div className="section-card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#3b82f6", marginBottom: "1rem" }}>
                🔵 منتظر تایید مسافر ({uploaded.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table className="reservations-table">
                  <thead>
                    <tr>
                      <th>کاربر</th>
                      <th>تور</th>
                      <th>مبلغ برگشتی</th>
                      <th>شماره کارت</th>
                      <th>وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploaded.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.userUsername}</strong>
                          <br />
                          <small>{r.userMobile}</small>
                        </td>
                        <td>
                          {r.tourName}
                          <br />
                          <small>{r.tourCode}</small>
                        </td>
                        <td style={{ color: "#0d9488", fontWeight: 600 }}>
                          {formatPrice(r.refundAmount)}
                        </td>
                        <td>
                          <span style={{ direction: "ltr", fontFamily: "monospace", fontSize: "0.85rem" }}>
                            {r.targetCardNumber}
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: `${RefundRequestStatusColors[r.status as RefundRequestStatus]}22`,
                              color: RefundRequestStatusColors[r.status as RefundRequestStatus],
                            }}
                          >
                            {r.statusPersian || RefundRequestStatusPersian[r.status as RefundRequestStatus]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تاریخچه */}
          {completed.length > 0 && (
            <div className="section-card">
              <h3 style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1rem" }}>
                📜 تاریخچه ({completed.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table className="reservations-table">
                  <thead>
                    <tr>
                      <th>کاربر</th>
                      <th>تور</th>
                      <th>مبلغ</th>
                      <th>وضعیت</th>
                      <th>تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.userUsername}</strong>
                        </td>
                        <td>{r.tourName}</td>
                        <td>{formatPrice(r.refundAmount)}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: `${RefundRequestStatusColors[r.status as RefundRequestStatus]}22`,
                              color: RefundRequestStatusColors[r.status as RefundRequestStatus],
                            }}
                          >
                            {r.statusPersian || RefundRequestStatusPersian[r.status as RefundRequestStatus]}
                          </span>
                        </td>
                        <td>{formatDate(r.processedAt || r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* مودال آپلود رسید برگشت */}
      {uploadModal.open && uploadModal.request && (
        <div
          className="modal-overlay"
          onClick={() => setUploadModal({ open: false, request: null })}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📤 آپلود رسید برگشت وجه</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
              درخواست لغو از {uploadModal.request.userUsername} برای تور{" "}
              {uploadModal.request.tourName}
            </p>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.85rem",
              }}
            >
              <p>
                💰 مبلغ برگشتی:{" "}
                <strong style={{ color: "#0d9488" }}>
                  {formatPrice(uploadModal.request.refundAmount)}
                </strong>
              </p>
              <p>
                💳 شماره کارت مقصد:
                <span
                  style={{
                    direction: "ltr",
                    fontFamily: "monospace",
                    marginRight: "0.35rem",
                  }}
                >
                  {uploadModal.request.targetCardNumber}
                </span>
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>📸 تصویر رسید برگشت وجه</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            {receiptImageUrl && (
              <img
                src={receiptImageUrl}
                alt="رسید برگشت"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
            )}

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setUploadModal({ open: false, request: null });
                  setReceiptImageUrl("");
                }}
                disabled={uploadLoading}
              >
                انصراف
              </button>
              <button
                className="btn-success"
                onClick={handleUploadReceipt}
                disabled={uploadLoading || !receiptImageUrl}
              >
                {uploadLoading ? "⏳ در حال آپلود..." : "تایید و آپلود رسید"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال رد درخواست */}
      {rejectModal.open && rejectModal.request && (
        <div
          className="modal-overlay"
          onClick={() => setRejectModal({ open: false, request: null })}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>رد درخواست لغو</h3>
            <div className="form-group">
              <label>دلیل رد</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="دلیل رد درخواست لغو... (اختیاری)"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setRejectModal({ open: false, request: null });
                  setRejectReason("");
                }}
                disabled={rejectLoading}
              >
                انصراف
              </button>
              <button
                className="btn-danger"
                onClick={handleReject}
                disabled={rejectLoading}
              >
                {rejectLoading ? "⏳..." : "رد درخواست"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CeoCancelRequests;
