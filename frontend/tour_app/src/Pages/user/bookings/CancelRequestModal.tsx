import React, { useState } from "react";
import { Passenger, RefundRequest } from "../../../Types/reservation";
import { reservationApi } from "../../../Services/reservationApi";

interface CancelRequestModalProps {
  isOpen: boolean;
  reservationId: number;
  passengers: Passenger[];
  onClose: () => void;
  onSuccess: (data?: RefundRequest) => void;
}

const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  isOpen,
  reservationId,
  passengers,
  onClose,
  onSuccess,
}) => {
  const [targetCardNumber, setTargetCardNumber] = useState("");
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<number[]>([]);
  const [cancelType, setCancelType] = useState<"all" | "partial">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePassenger = (passengerId: number | undefined) => {
    if (!passengerId) return;
    setSelectedPassengerIds((prev) =>
      prev.includes(passengerId)
        ? prev.filter((id) => id !== passengerId)
        : [...prev, passengerId]
    );
  };

  const handleSubmit = async () => {
    if (!/^\d{16}$/.test(targetCardNumber)) {
      setError("شماره کارت باید ۱۶ رقم باشد");
      return;
    }
    if (cancelType === "partial" && selectedPassengerIds.length === 0) {
      setError("حداقل یک مسافر را انتخاب کنید");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await reservationApi.requestCancellation(reservationId, {
        targetCardNumber,
        passengerIds: cancelType === "all" ? undefined : selectedPassengerIds,
      });
      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "خطا در ثبت درخواست");
      }
    } catch (err: any) {
      // اگر درخواست قبلاً ثبت شده، فقط وضعیت رو آپدیت کن و ببند
      const msg = err.response?.data?.message || "";
      if (msg.includes("قبلاً")) {
        onSuccess();
        onClose();
      } else {
        setError(msg || "خطا در ثبت درخواست لغو");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "550px" }}
      >
        <h3>📋 درخواست لغو رزرو</h3>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          لطفاً نوع لغو و شماره کارت مقصد برای برگشت وجه را وارد کنید.
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* انتخاب نوع لغو */}
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>نوع لغو</label>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.35rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: `2px solid ${cancelType === "all" ? "#0d9488" : "#e2e8f0"}`,
                background: cancelType === "all" ? "#f0fdfa" : "white",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="radio"
                name="cancelType"
                value="all"
                checked={cancelType === "all"}
                onChange={() => setCancelType("all")}
                style={{ display: "none" }}
              />
              ✅ لغو کامل (همه مسافران)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: `2px solid ${cancelType === "partial" ? "#0d9488" : "#e2e8f0"}`,
                background: cancelType === "partial" ? "#f0fdfa" : "white",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="radio"
                name="cancelType"
                value="partial"
                checked={cancelType === "partial"}
                onChange={() => setCancelType("partial")}
                style={{ display: "none" }}
              />
              🔀 لغو انتخابی
            </label>
          </div>
        </div>

        {/* انتخاب مسافران (فقط در حالت انتخابی) */}
        {cancelType === "partial" && passengers.length > 0 && (
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label>انتخاب مسافران برای لغو</label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.35rem",
              }}
            >
              {passengers.map((p, idx) => (
                <label
                  key={p.id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "10px",
                    border: `1px solid ${
                      selectedPassengerIds.includes(p.id!)
                        ? "#0d9488"
                        : "#e2e8f0"
                    }`,
                    background: selectedPassengerIds.includes(p.id!)
                      ? "#f0fdfa"
                      : "white",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPassengerIds.includes(p.id!)}
                    onChange={() => togglePassenger(p.id)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span>
                    {p.firstName} {p.lastName}
                    <span style={{ color: "#94a3b8", marginRight: "0.35rem" }}>
                      ({p.nationalCode})
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* شماره کارت */}
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>💳 شماره کارت مقصد (برای برگشت وجه)</label>
          <input
            value={targetCardNumber}
            onChange={(e) =>
              setTargetCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
            }
            placeholder="6037xxxxxxxxxxxx"
            maxLength={16}
            style={{ direction: "ltr", fontFamily: "monospace" }}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button
            className="btn-danger"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "⏳ در حال ثبت..." : "ثبت درخواست لغو"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRequestModal;
