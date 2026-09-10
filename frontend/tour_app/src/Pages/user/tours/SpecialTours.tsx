import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSyncAlt, FaFire, FaClock } from "react-icons/fa";
import { userDiscountApi } from "../../../Services/discountApi";
import { TourSpecialDiscount } from "../../../Types/discount";
import "./SpecialTours.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "—";

// تایمر شمارش معکوس
const useCountdown = (target: string) => {
  const [remaining, setRemaining] = useState(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(new Date(target).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (remaining <= 0) return { expired: true, text: "منقضی شد" };
  const totalSec = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return {
    expired: false,
    text: `${hours}س ${minutes}د ${seconds}ث`,
  };
};

const CountdownBadge: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
  const { expired, text } = useCountdown(expiresAt);
  return (
    <span className={`st-countdown ${expired ? "expired" : ""}`}>
      <FaClock /> {expired ? "پایان یافته" : `مانده تا پایان: ${text}`}
    </span>
  );
};

const SpecialTours: React.FC = () => {
  const [specials, setSpecials] = useState<TourSpecialDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSpecials = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userDiscountApi.getSpecialTours();
      if (res.success) setSpecials(res.data || []);
      else setError(res.message || "خطا در دریافت تورهای ویژه");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تورهای ویژه");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecials();
  }, []);

  if (loading) {
    return (
      <div className="st-loading">
        <div className="st-spinner" />
        <p>در حال بارگذاری تورهای ویژه...</p>
      </div>
    );
  }

  return (
    <div className="st-container">
      <div className="st-header">
        <div>
          <h1>🔥 تورهای ویژه</h1>
          <p>تخفیف‌های محدود و زمان‌دار — قبل از اتمام مهلت رزرو کن!</p>
        </div>
        <button className="st-refresh" onClick={fetchSpecials}>
          <FaSyncAlt /> بروزرسانی
        </button>
      </div>

      {error && <div className="st-error">{error}</div>}

      {specials.length === 0 ? (
        <div className="st-empty">
          <span className="st-empty-icon">🎁</span>
          <p>در حال حاضر تور ویژه‌ای فعال نیست — بعداً دوباره سر بزن!</p>
          <Link to="/user/dashboard/tours" className="st-btn st-btn-book">
            مشاهده همه تورها
          </Link>
        </div>
      ) : (
        <div className="st-grid">
          {specials.map((s) => (
            <div className="st-card" key={s.id}>
              <div className="st-card-badge">٪{s.discountPercent} تخفیف</div>
              <div className="st-card-head">
                <h3>{s.tourName}</h3>
                <small>{s.tourCode}</small>
              </div>

              <div className="st-card-meta">
                <span>📅 حرکت: {formatDate(s.startsAt)}</span>
                <span>🏢 آژانس: {s.createdByUsername}</span>
              </div>

              <div className="st-price-row">
                <div>
                  <span className="st-price-old">{formatPrice(s.originalPrice)}</span>
                  <span className="st-price-new">{formatPrice(s.discountedPrice)}</span>
                </div>
                <span className="st-price-save">
                  سود شما: {formatPrice(s.originalPrice - s.discountedPrice)}
                </span>
              </div>

              <div className="st-card-foot">
                <CountdownBadge expiresAt={s.expiresAt} />
                <Link to={`/user/dashboard/tours/${s.tourId}/book`} className="st-btn st-btn-book">
                  رزرو با تخفیف
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialTours;
