import React, { useState } from "react";
import { RefundRequest } from "../../../Types/reservation";
import { reservationApi } from "../../../Services/reservationApi";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  refundRequest: RefundRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  isOpen,
  refundRequest,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationApi.confirmCancellation(refundRequest.id);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "خطا در تایید لغو");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در تایید لغو");
    } finally {
      setLoading(false);
    }
  };

  const isPartialCancel =
    refundRequest.cancelledPassengerIds &&
    refundRequest.cancelledPassengerIds.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <h3>🔔 تایید نهایی لغو رزرو</h3>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* اطلاعات لغو */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "14px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem 0",
              fontSize: "0.85rem",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontWeight: 600 }}>تور</span>
            <span>{refundRequest.tourName}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem 0",
              fontSize: "0.85rem",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontWeight: 600 }}>نوع لغو</span>
            <span>{isPartialCancel ? "🔀 انتخابی" : "✅ کامل"}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem 0",
              fontSize: "0.85rem",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontWeight: 600 }}>مبلغ برگشتی</span>
            <span style={{ color: "#0d9488", fontWeight: 700 }}>
              {new Intl.NumberFormat("fa-IR").format(refundRequest.refundAmount)}{" "}
              تومان
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem 0",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ fontWeight: 600 }}>شماره کارت مقصد</span>
            <span style={{ direction: "ltr", fontFamily: "monospace" }}>
              {refundRequest.targetCardNumber}
            </span>
          </div>
        </div>

        {/* رسید برگشت وجه */}
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>📸 رسید برگشت وجه (آپلود شده توسط مدیر آژانس)</label>
          {refundRequest.receiptImageUrl ? (
            <div style={{ marginTop: "0.5rem" }}>
              <a
                href={refundRequest.receiptImageUrl}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={refundRequest.receiptImageUrl}
                  alt="رسید برگشت وجه"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </a>
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              رسیدی آپلود نشده است
            </p>
          )}
        </div>

        <div className="alert alert-info">
          ⚠️ با تایید نهایی، رزرو شما لغو شده و مبلغ ذکر شده به کارت شما برگشت
          داده خواهد شد.
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button
            className="btn-danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? "⏳ در حال پردازش..."
              : "✅ تایید نهایی لغو"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
