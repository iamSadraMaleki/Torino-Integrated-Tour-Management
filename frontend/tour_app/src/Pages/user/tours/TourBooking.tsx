import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userTourApi } from "../../../Services/userTourApi";
import { userTourChatApi } from "../../../Services/tourChatApi";
import { reservationApi } from "../../../Services/reservationApi";
import { userDiscountApi } from "../../../Services/discountApi";
import {
  Passenger,
  Reservation,
  SeatStatus,
  TourPaymentInfo,
  UserTourDetails,
} from "../../../Types/reservation";
import "../../ceo/CeoDashboard.css";
import "../UserPages.css";

type Step = "seats" | "passengers" | "payment";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const emptyPassenger = (): Passenger => ({
  firstName: "",
  lastName: "",
  nationalCode: "",
  mobile: "",
  birthDate: "",
});

// ========== استایل‌های اضافی برای ظاهر زیباتر ==========
const seatStyles = `
  .tour-booking-header-card {
    background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    box-shadow: 0 8px 25px rgba(13, 148, 136, 0.25);
  }
  .tour-booking-header-card h1 { margin: 0; font-size: 1.4rem; font-weight: bold; }
  .tour-booking-header-card .header-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.85rem; opacity: 0.95; }
  .tour-booking-header-card .header-meta span { display: flex; align-items: center; gap: 0.35rem; }
  .capacity-bar-wrapper {
    background: white;
    border-radius: 16px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
  }
  .capacity-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
    font-size: 0.85rem;
    color: #475569;
  }
  .capacity-bar-header strong { color: #0d9488; font-size: 1.1rem; }
  .capacity-bar-track {
    height: 8px;
    background: #f1f5f9;
    border-radius: 99px;
    overflow: hidden;
  }
  .capacity-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #0d9488, #0891b2);
    border-radius: 99px;
    transition: width 0.4s ease;
  }
  .capacity-legend {
    display: flex;
    gap: 1.2rem;
    justify-content: center;
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #64748b;
  }
  .capacity-legend span { display: flex; align-items: center; gap: 0.3rem; }
  .seat-dot { display: inline-block; width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
  .seat-dot.available { background: #22c55e; }
  .seat-dot.selected { background: #3b82f6; }
  .seat-dot.pending { background: #f59e0b; }
  .seat-dot.confirmed { background: #ef4444; }
  .seats-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .seats-panel-header h3 { margin: 0; font-size: 1rem; color: #1e293b; }
  .seats-panel-header .selected-count {
    background: #eff6ff;
    color: #2563eb;
    padding: 0.3rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .seats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    gap: 0.5rem;
    max-width: 100%;
  }
  .seat-btn {
    aspect-ratio: 1;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
  }
  .seat-btn.available {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
    box-shadow: 0 1px 3px rgba(34,197,94,0.1);
  }
  .seat-btn.available:hover {
    background: #22c55e;
    color: white;
    border-color: #22c55e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34,197,94,0.3);
  }
  .seat-btn.available:active { transform: translateY(0); }
  .seat-btn.selected {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    box-shadow: 0 4px 12px rgba(59,130,246,0.3);
    transform: translateY(-2px);
    animation: seatSelectPop 0.2s ease;
  }
  @keyframes seatSelectPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: translateY(-2px) scale(1); }
  }
  .seat-btn.pending {
    background: #fef3c7;
    border-color: #fcd34d;
    color: #92400e;
    cursor: not-allowed;
    opacity: 0.9;
  }
  .seat-btn.confirmed {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #991b1b;
    cursor: not-allowed;
    opacity: 0.85;
  }
  .seat-btn .seat-icon {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 0.55rem;
  }
  .btn-continue-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  .btn-continue-wrapper .info-text { font-size: 0.8rem; color: #64748b; }
  .btn-gradient {
    background: linear-gradient(135deg, #0d9488, #0891b2);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .btn-gradient:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(13,148,136,0.3);
  }
  .btn-gradient:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-gradient-outline {
    background: transparent;
    color: #0d9488;
    border: 2px solid #0d9488;
    border-radius: 12px;
    padding: 0.6rem 1.25rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-gradient-outline:hover { background: #f0fdfa; }
  .payment-card {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }
  .payment-card .pay-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.85rem;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }
  .payment-card .pay-row:last-child { border-bottom: none; }
  .payment-card .pay-row .label { font-weight: 600; }
  .payment-card .pay-row .value { font-family: monospace; direction: ltr; }
  .upload-dropzone {
    border: 2px dashed #cbd5e1;
    border-radius: 14px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8fafc;
    margin-bottom: 1rem;
  }
  .upload-dropzone:hover { border-color: #0d9488; background: #f0fdfa; }
  .upload-dropzone.has-image { border-color: #22c55e; background: #f0fdf4; }
  .upload-dropzone .upload-icon { font-size: 2.5rem; }
  .upload-dropzone p { margin: 0.5rem 0 0; font-size: 0.85rem; color: #64748b; }
`;

const TourBooking: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("seats");
  const [tour, setTour] = useState<UserTourDetails | null>(null);
  const [seats, setSeats] = useState<SeatStatus[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger()]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<TourPaymentInfo | null>(null);
  const [sourceCard, setSourceCard] = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [codeCheck, setCodeCheck] = useState<{
    checking: boolean;
    valid: boolean | null;
    percent: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (tourId) {
      const id = parseInt(tourId, 10);
      if (isNaN(id)) {
        setMessage({ type: "error", text: "شناسه تور نامعتبر است" });
        setLoading(false);
        return;
      }
      fetchData();
    }
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const id = parseInt(tourId!, 10);
      const [tourRes, seatsRes] = await Promise.all([
        userTourApi.getTourDetails(id),
        userTourApi.getTourSeats(id),
      ]);
      if (tourRes.success && tourRes.data) {
        setTour(tourRes.data);
      } else {
        setMessage({ type: "error", text: "تور مورد نظر یافت نشد" });
      }
      if (seatsRes.success) {
        setSeats(seatsRes.data || []);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در دریافت اطلاعات تور. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat: SeatStatus) => {
    if (seat.status === "PENDING" || seat.status === "CONFIRMED") return;
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.seatId)) {
        return prev.filter((id) => id !== seat.seatId);
      }
      return [...prev, seat.seatId];
    });
  };

  const syncPassengersWithSeats = () => {
    const count = selectedSeatIds.length;
    if (count === 0) return;
    setPassengers((prev) => {
      const next = [...prev];
      while (next.length < count) next.push(emptyPassenger());
      return next.slice(0, count);
    });
    setStep("passengers");
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validatePassengers = () => {
    for (const p of passengers) {
      if (!p.firstName || !p.lastName || !p.nationalCode || !p.mobile || !p.birthDate) {
        setMessage({ type: "error", text: "لطفاً اطلاعات همه مسافران را کامل کنید" });
        return false;
      }
      if (!/^\d{10}$/.test(p.nationalCode)) {
        setMessage({ type: "error", text: "کد ملی باید ۱۰ رقم باشد" });
        return false;
      }
    }
    return true;
  };

  const handleCreateReservation = async () => {
    if (!validatePassengers()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await reservationApi.create({
        tourId: parseInt(tourId!, 10),
        seatIds: selectedSeatIds,
        passengers,
        discountCode: discountCode.trim() || undefined,
      });
      if (res.success) {
        setReservation(res.data);
        const payRes = await userTourApi.getTourPaymentInfo(parseInt(tourId!, 10));
        if (payRes.success) setPaymentInfo(payRes.data);
        setStep("payment");
        setMessage({ type: "success", text: res.message });
      } else {
        setMessage({ type: "error", text: res.message || "خطا در ثبت رزرو" });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در ثبت رزرو",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReceiptImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // بررسی اعتبار کد تخفیف (بدون مصرف)
  const handleCheckCode = async () => {
    const code = discountCode.trim();
    if (!code) {
      setCodeCheck({ checking: false, valid: null, percent: 0, message: "کد را وارد کنید" });
      return;
    }
    setCodeCheck({ checking: true, valid: null, percent: 0, message: "" });
    try {
      const res = await userDiscountApi.validateCode(code);
      if (res.success) {
        setCodeCheck({ checking: false, valid: true, percent: res.data || 0, message: res.message });
      } else {
        setCodeCheck({ checking: false, valid: false, percent: 0, message: res.message || "کد نامعتبر است" });
      }
    } catch (err: any) {
      setCodeCheck({
        checking: false,
        valid: false,
        percent: 0,
        message: err.response?.data?.message || "کد تخفیف معتبر نیست",
      });
    }
  };

  const handleUploadProof = async () => {
    if (!reservation) return;
    if (!/^\d{16}$/.test(sourceCard)) {
      setMessage({ type: "error", text: "شماره کارت مبدأ باید ۱۶ رقم باشد" });
      return;
    }
    if (!receiptImageUrl) {
      setMessage({ type: "error", text: "لطفاً تصویر رسید را آپلود کنید" });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await reservationApi.uploadPaymentProof(reservation.id, {
        sourceCardNumber: sourceCard,
        receiptImageUrl,
      });
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setTimeout(() => navigate("/user/dashboard/bookings"), 2000);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در آپلود رسید",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // قیمت هر نفر — اگر تور ویژه (تخفیف فعال) داشته باشد، قیمت تخفیف‌خورده اعمال می‌شود
  const unitPrice = tour?.discountedPrice ?? tour?.price ?? 0;
  const totalPrice = unitPrice * selectedSeatIds.length;
  const availableSeats = seats.filter(s => s.status === "AVAILABLE").length;
  const pendingSeats = seats.filter(s => s.status === "PENDING").length;
  const confirmedSeats = seats.filter(s => s.status === "CONFIRMED").length;
  // ظرفیت واقعی = تعداد صندلی‌های موجود (هماهنگ با دکمه‌های صندلی)
  const totalCapacity = seats.length > 0 ? seats.length : tour?.totalCapacity || 0;
  const capacityPercent = totalCapacity > 0 ? ((totalCapacity - availableSeats) / totalCapacity) * 100 : 0;

  const getSeatClassName = (seat: SeatStatus) => {
    if (seat.status === "CONFIRMED") return "seat-btn confirmed";
    if (seat.status === "PENDING") return "seat-btn pending";
    if (selectedSeatIds.includes(seat.seatId)) return "seat-btn selected";
    return "seat-btn available";
  };

  const getSeatIcon = (seat: SeatStatus) => {
    if (seat.seatType === "VIP") return "⭐";
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری اطلاعات تور...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="tour-booking-page">
        <div className="alert alert-error" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>تور مورد نظر یافت نشد</p>
          <button className="btn-secondary" onClick={() => navigate("/user/dashboard/tours")}>
            بازگشت به لیست تورها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-booking-page">
      <style>{seatStyles}</style>

      {/* هدر تور */}
      <div className="tour-booking-header-card">
        <div>
          <h1>🎫 {tour.baseTourName}</h1>
          <div className="header-meta">
            <span>📅 {formatDate(tour.departureDate)}</span>
            <span>🔙 {formatDate(tour.returnDate)}</span>
            <span>🏢 {tour.agencyName}</span>
            {tour.discountPercent ? (
              <span style={{ background: "rgba(239,68,68,0.25)", padding: "0.2rem 0.6rem", borderRadius: 8, fontWeight: 700 }}>
                🔥 ٪{tour.discountPercent} تخفیف ویژه فعال
              </span>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            className="btn-gradient-outline"
            onClick={async () => {
              try {
                const res = await userTourChatApi.start({ tourId: tour.id });
                if (res.success && res.data) {
                  navigate(`/user/dashboard/chat/${res.data.id}`);
                }
              } catch {
                /* در صورت خطا فقط نادیده بگیر */
              }
            }}
            style={{ background: "rgba(255,255,255,0.2)", color: "white", borderColor: "rgba(255,255,255,0.4)" }}
            title="گفتگو با مدیر آژانس قبل از رزرو"
          >
            💬 سوال از آژانس
          </button>
          <button className="btn-gradient-outline" onClick={() => navigate("/user/dashboard/tours")}
            style={{ background: "rgba(255,255,255,0.2)", color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
            ← بازگشت
          </button>
        </div>
      </div>

      {/* مراحل */}
      <div className="booking-steps">
        <span className={`step-badge ${step === "seats" ? "active" : selectedSeatIds.length ? "done" : ""}`}>
          ۱. انتخاب صندلی
        </span>
        <span className={`step-badge ${step === "passengers" ? "active" : step === "payment" ? "done" : ""}`}>
          ۲. اطلاعات مسافران
        </span>
        <span className={`step-badge ${step === "payment" ? "active" : ""}`}>
          ۳. پرداخت و رسید
        </span>
      </div>

      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      <div className="booking-layout">
        <div>
          {step === "seats" && (
            <>
              {/* نوار ظرفیت */}
              <div className="capacity-bar-wrapper">
                <div className="capacity-bar-header">
                  <span>💺 ظرفیت کل: <strong>{totalCapacity}</strong> نفر</span>
                  <span>✅ خالی: <strong style={{ color: "#22c55e" }}>{availableSeats}</strong></span>
                  <span>🟡 در انتظار: <strong style={{ color: "#f59e0b" }}>{pendingSeats}</strong></span>
                  <span>🔴 رزرو شده: <strong style={{ color: "#ef4444" }}>{confirmedSeats}</strong></span>
                </div>
                <div className="capacity-bar-track">
                  <div className="capacity-bar-fill" style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
                </div>
                <div className="capacity-legend">
                  <span><span className="seat-dot available"></span> آزاد</span>
                  <span><span className="seat-dot selected"></span> در حال انتخاب</span>
                  <span><span className="seat-dot pending"></span> در انتظار تأیید</span>
                  <span><span className="seat-dot confirmed"></span> رزرو نهایی</span>
                </div>
              </div>

              {/* انتخاب صندلی */}
              <div className="booking-panel">
                <div className="seats-panel-header">
                  <h3>انتخاب صندلی</h3>
                  <span className="selected-count">{selectedSeatIds.length} عدد انتخاب شده</span>
                </div>

                {seats.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
                    صندلی‌ای برای این تور تعریف نشده است.
                  </p>
                ) : (
                  <>
                    <div className="seats-grid">
                      {seats.map((seat) => (
                        <button
                          key={seat.seatId}
                          type="button"
                          className={getSeatClassName(seat)}
                          onClick={() => toggleSeat(seat)}
                          disabled={seat.status === "PENDING" || seat.status === "CONFIRMED"}
                          title={`ردیف ${seat.rowNumber} - ${seat.position === "LEFT" ? "چپ" : seat.position === "RIGHT" ? "راست" : "وسط"}${seat.seatType === "VIP" ? " (ویژه)" : ""}`}
                        >
                          {getSeatIcon(seat) && <span className="seat-icon">{getSeatIcon(seat)}</span>}
                          {seat.seatNumber}
                        </button>
                      ))}
                    </div>

                    <div className="btn-continue-wrapper">
                      <div className="info-text">
                        {selectedSeatIds.length > 0
                          ? `💰 مبلغ قابل پرداخت: ${formatPrice(totalPrice)}${tour.discountPercent ? ` (با ٪${tour.discountPercent} تخفیف ویژه)` : ""}`
                          : "صندلی‌های مورد نظر را انتخاب کنید"}
                      </div>
                      <button
                        className="btn-gradient"
                        disabled={selectedSeatIds.length === 0}
                        onClick={syncPassengersWithSeats}
                      >
                        ادامه و ثبت مسافران ←
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {step === "passengers" && (
            <div className="booking-panel">
              <h3>اطلاعات مسافران</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
                لطفاً اطلاعات {passengers.length} مسافر را وارد کنید
              </p>
              {/* کد تخفیف */}
              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label>🎟️ کد تخفیف (اختیاری)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setCodeCheck(null);
                    }}
                    placeholder="کد تخفیف خود را وارد کنید"
                    style={{
                      direction: "ltr",
                      textAlign: "left",
                      fontFamily: "monospace",
                      letterSpacing: "1px",
                      flex: 1,
                    }}
                  />
                  <button
                    type="button"
                    className="btn-gradient-outline"
                    style={{ whiteSpace: "nowrap", padding: "0.55rem 1rem", fontSize: "0.78rem" }}
                    onClick={handleCheckCode}
                    disabled={codeCheck?.checking || !discountCode.trim()}
                  >
                    {codeCheck?.checking ? "⏳..." : "بررسی کد"}
                  </button>
                </div>
                {codeCheck && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.55rem 0.8rem",
                      borderRadius: 10,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      background: codeCheck.valid ? "#dcfce7" : "#fee2e2",
                      color: codeCheck.valid ? "#166534" : "#991b1b",
                      border: `1px solid ${codeCheck.valid ? "#86efac" : "#fca5a5"}`,
                    }}
                  >
                    {codeCheck.valid
                      ? `✅ ${codeCheck.message} — ٪${codeCheck.percent} تخفیف روی مبلغ نهایی اعمال می‌شود`
                      : `❌ ${codeCheck.message}`}
                  </div>
                )}
                <small style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                  کدهای ارسال‌شده به اینباکس یا کدهای آژانس را اینجا وارد کنید — قبل از ثبت رزرو، «بررسی کد» را بزنید
                </small>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="passenger-card">
                  <h4>🧑 مسافر {index + 1} — صندلی شماره {selectedSeatIds[index]}</h4>
                  <div className="passenger-form-grid">
                    <div className="form-group">
                      <label>نام</label>
                      <input
                        value={passenger.firstName}
                        onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                        placeholder="نام"
                      />
                    </div>
                    <div className="form-group">
                      <label>نام خانوادگی</label>
                      <input
                        value={passenger.lastName}
                        onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                        placeholder="نام خانوادگی"
                      />
                    </div>
                    <div className="form-group">
                      <label>کد ملی</label>
                      <input
                        value={passenger.nationalCode}
                        onChange={(e) => updatePassenger(index, "nationalCode", e.target.value)}
                        maxLength={10}
                        placeholder="۱۰ رقم"
                      />
                    </div>
                    <div className="form-group">
                      <label>موبایل</label>
                      <input
                        value={passenger.mobile}
                        onChange={(e) => updatePassenger(index, "mobile", e.target.value)}
                        placeholder="0912xxxxxxx"
                      />
                    </div>
                    <div className="form-group">
                      <label>تاریخ تولد</label>
                      <input
                        type="date"
                        value={passenger.birthDate}
                        onChange={(e) => updatePassenger(index, "birthDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn-gradient-outline" onClick={() => setStep("seats")}>
                  ← بازگشت
                </button>
                <button
                  className="btn-gradient"
                  onClick={handleCreateReservation}
                  disabled={submitting}
                >
                  {submitting ? "⏳ در حال ثبت..." : " ثبت رزرو و رفتن به پرداخت"}
                </button>
              </div>
            </div>
          )}

          {step === "payment" && reservation && paymentInfo && (
            <div className="booking-panel">
              <h3>💳 پرداخت و آپلود رسید</h3>

              <div className="payment-card">
                <div className="pay-row">
                  <span className="label">🏦 آژانس</span>
                  <span className="value">{paymentInfo.agencyName}</span>
                </div>
                <div className="pay-row">
                  <span className="label">👤 صاحب حساب</span>
                  <span className="value">{paymentInfo.accountHolderName}</span>
                </div>
                <div className="pay-row">
                  <span className="label">🏛️ بانک</span>
                  <span className="value">{paymentInfo.bankName}</span>
                </div>
                <div className="pay-row">
                  <span className="label">💳 شماره کارت</span>
                  <span className="value" dir="ltr">{paymentInfo.cardNumber}</span>
                </div>
                <div className="pay-row">
                  <span className="label">🔢 شبا</span>
                  <span className="value" dir="ltr">{paymentInfo.iban}</span>
                </div>
                <div className="pay-row" style={{ borderBottom: "none" }}>
                  <span className="label" style={{ fontSize: "1rem", color: "#0d9488" }}>💰 مبلغ قابل پرداخت</span>
                  <span className="value" style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#0d9488" }}>{formatPrice(reservation.totalPrice)}</span>
                </div>
              </div>

              <div className="alert alert-info">
                ⏳ پس از واریز مبلغ به کارت بالا، رسید پرداخت را آپلود کنید.
                مدیر آژانس پس از تأیید، رزرو شما نهایی می‌شود.
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>💳 شماره کارت مبدأ (کارت شما)</label>
                <input
                  value={sourceCard}
                  onChange={(e) => setSourceCard(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="6037xxxxxxxxxxxx"
                  maxLength={16}
                  style={{ direction: "ltr", fontFamily: "monospace" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>📸 تصویر رسید پرداخت</label>
                <div
                  className={`upload-dropzone ${receiptImageUrl ? "has-image" : ""}`}
                  onClick={() => document.getElementById("receipt-upload")?.click()}
                >
                  {receiptImageUrl ? (
                    <>
                      <div className="upload-icon">✅</div>
                      <p>رسید با موفقیت آپلود شد</p>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">📁</div>
                      <p>برای آپلود رسید کلیک کنید</p>
                      <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>فرمت‌های مجاز: JPG, PNG</p>
                    </>
                  )}
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {receiptImageUrl && (
                <img src={receiptImageUrl} alt="رسید" className="receipt-preview" style={{ marginBottom: "1rem" }} />
              )}

              <button
                className="btn-gradient"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleUploadProof}
                disabled={submitting}
              >
                {submitting ? "⏳ در حال آپلود..." : " ثبت رسید پرداخت"}
              </button>
            </div>
          )}
        </div>

        {/* سایدبار خلاصه */}
        <div className="summary-box">
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "#1e293b" }}>📋 خلاصه رزرو</h3>
          <div className="summary-row">
            <span>تور</span>
            <span style={{ fontWeight: 600 }}>{tour.baseTourName}</span>
          </div>
          <div className="summary-row">
            <span>تاریخ حرکت</span>
            <span>{formatDate(tour.departureDate)}</span>
          </div>
          <div className="summary-row">
            <span>تعداد صندلی</span>
            <span style={{ fontWeight: 600 }}>{selectedSeatIds.length || "-"}</span>
          </div>
          <div className="summary-row">
            <span>قیمت هر نفر</span>
            <span>
              {tour.discountedPrice ? (
                <>
                  <span style={{ textDecoration: "line-through", color: "#94a3b8", marginLeft: "0.35rem" }}>
                    {formatPrice(tour.price)}
                  </span>
                  <strong style={{ color: "#dc2626" }}>{formatPrice(tour.discountedPrice)}</strong>
                </>
              ) : (
                formatPrice(tour.price)
              )}
            </span>
          </div>
          {discountCode.trim() && (
            <div className="summary-row">
              <span>کد تخفیف</span>
              <span style={{ fontFamily: "monospace", color: "#b45309", fontWeight: 700 }}>{discountCode.trim()}</span>
            </div>
          )}
          {codeCheck?.valid && (
            <div className="summary-row">
              <span>🎟️ تخفیف کد (٪{codeCheck.percent})</span>
              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                -{formatPrice((totalPrice * codeCheck.percent) / 100)}
              </span>
            </div>
          )}
          <div className="summary-row">
            <span>ظرفیت باقیمانده</span>
            <span style={{ color: availableSeats > 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {availableSeats} از {totalCapacity}
            </span>
          </div>
          <div className="summary-total">
            <span>جمع کل</span>
            <span>
              {codeCheck?.valid
                ? formatPrice(totalPrice - (totalPrice * codeCheck.percent) / 100)
                : formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourBooking;
