import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userTourApi } from "../../../Services/userTourApi";
import { userTourChatApi } from "../../../Services/tourChatApi";
import { wishlistApi } from "../../../Services/wishlistApi";
import { UserTour } from "../../../Types/reservation";
import "../../ceo/CeoDashboard.css";
import "../UserPages.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const AvailableTours: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<UserTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chattingTourId, setChattingTourId] = useState<number | null>(null);

  // لیست تورهای مورد علاقه
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<Set<number>>(new Set());

  const fetchWishlist = async () => {
    try {
      const res = await wishlistApi.getMyWishlist();
      if (res.success) {
        setWishlistIds(new Set((res.data || []).map((w) => w.tourId)));
      }
    } catch {
      // بی‌صدا — اگر خطا داد فقط بدون قلب نمایش بده
    }
  };

  const handleToggleWishlist = async (tourId: number) => {
    const isIn = wishlistIds.has(tourId);
    setWishlistLoading((prev) => new Set(prev).add(tourId));
    try {
      if (isIn) {
        const res = await wishlistApi.remove(tourId);
        if (res.success) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(tourId);
            return next;
          });
        }
      } else {
        const res = await wishlistApi.add(tourId);
        if (res.success) {
          setWishlistIds((prev) => new Set(prev).add(tourId));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در به‌روزرسانی مورد علاقه");
    } finally {
      setWishlistLoading((prev) => {
        const next = new Set(prev);
        next.delete(tourId);
        return next;
      });
    }
  };


  // شروع گفتگو با مدیر آژانس تور
  const handleStartChat = async (tourId: number) => {
    setChattingTourId(tourId);
    setError("");
    try {
      const res = await userTourChatApi.start({ tourId });
      if (res.success && res.data) {
        navigate(`/user/dashboard/chat/${res.data.id}`);
      } else {
        setError(res.message || "خطا در شروع گفتگو");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در شروع گفتگو");
    } finally {
      setChattingTourId(null);
    }
  };

  useEffect(() => {
    fetchTours();
    fetchWishlist();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userTourApi.getAvailableTours();
      if (res.success) {
        setTours(res.data || []);
      }
    } catch {
      setError("خطا در دریافت لیست تورها");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری تورها...</p>
      </div>
    );
  }

  return (
    <div className="available-tours-page">
      <div className="page-header">
        <h1 className="page-title">✈️ تورهای موجود</h1>
        <button className="btn-secondary" onClick={fetchTours}>
          بروزرسانی
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {tours.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <p>در حال حاضر تور فعالی موجود نیست.</p>
          </div>
        </div>
      ) : (
        <div className="tours-grid">
          {tours.map((tour) => (
            <div key={tour.id} className="tour-card">
              <div className="tour-card-top">
                <h3 className="tour-card-title">{tour.baseTourName}</h3>
                <button
                  className={`wishlist-heart-btn ${wishlistIds.has(tour.id) ? "active" : ""}`}
                  onClick={() => handleToggleWishlist(tour.id)}
                  disabled={wishlistLoading.has(tour.id)}
                  title={wishlistIds.has(tour.id) ? "حذف از مورد علاقه" : "افزودن به مورد علاقه"}
                >
                  {wishlistLoading.has(tour.id) ? "⏳" : wishlistIds.has(tour.id) ? "❤️" : "🤍"}
                </button>
              </div>
              <div className="tour-card-meta">
                <span>کد: {tour.baseTourCode}</span>
                <span>📅 حرکت: {formatDate(tour.departureDate)}</span>
                <span>🔙 بازگشت: {formatDate(tour.returnDate)}</span>
                <span>🏢 آژانس: {tour.createdByUsername}</span>
                <span>💺 ظرفیت: {tour.availableCapacity} نفر</span>
              </div>
              <div className="tour-card-footer">
                <span className="tour-card-price">{formatPrice(tour.price)}</span>
                <div className="tour-card-actions">
                  <button
                    className="btn-secondary"
                    style={{ padding: "0.5rem 0.9rem", fontSize: "0.8rem" }}
                    onClick={() => handleStartChat(tour.id)}
                    disabled={chattingTourId === tour.id}
                    title={`گفتگو با مدیر آژانس (${tour.createdByUsername})`}
                  >
                    {chattingTourId === tour.id ? "⏳..." : "💬 گفتگو با آژانس"}
                  </button>
                  <Link to={`/user/dashboard/tours/${tour.id}/book`} className="btn-primary">
                    رزرو تور
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableTours;
