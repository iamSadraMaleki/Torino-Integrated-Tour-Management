import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSyncAlt, FaHeart, FaRegHeart, FaTrash, FaTicketAlt, FaCommentDots, FaStar } from "react-icons/fa";
import { reservationApi } from "../../../Services/reservationApi";
import { wishlistApi } from "../../../Services/wishlistApi";
import { userTourChatApi } from "../../../Services/tourChatApi";
import { userReviewApi } from "../../../Services/reviewApi";
import {
  Reservation,
  ReservationStatus,
  ReservationStatusColors,
  ReservationStatusPersian,
} from "../../../Types/reservation";
import { WishlistItem } from "../../../Types/wishlist";
import TicketModal from "../bookings/TicketModal";
import ReviewModal from "./ReviewModal";
import "./MyTrips.css";

type TripsTab = "upcoming" | "past" | "wishlist";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "—";

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

interface MyTripsProps {
  initialTab?: TripsTab;
}

const MyTrips: React.FC<MyTripsProps> = ({ initialTab = "upcoming" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TripsTab>(initialTab);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [chattingTourId, setChattingTourId] = useState<number | null>(null);
  const [removingTourId, setRemovingTourId] = useState<number | null>(null);

  // بلیط
  const [ticketModal, setTicketModal] = useState<{ open: boolean; reservationId: number }>({
    open: false,
    reservationId: 0,
  });

  // ثبت نظر
  const [reviewModal, setReviewModal] = useState<{ open: boolean; tourId: number; tourName: string }>({
    open: false,
    tourId: 0,
    tourName: "",
  });
  const [reviewedTourIds, setReviewedTourIds] = useState<Set<number>>(new Set());

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [resRes, wishRes] = await Promise.all([
        reservationApi.getMyReservations(),
        wishlistApi.getMyWishlist(),
      ]);
      if (resRes.success) setReservations(resRes.data || []);
      if (wishRes.success) setWishlist(wishRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت سفرها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchMyReviews();
  }, [fetchAll]);

  const fetchMyReviews = async () => {
    try {
      const res = await userReviewApi.getMine();
      if (res.success) {
        setReviewedTourIds(new Set((res.data || []).map((r) => r.tourId)));
      }
    } catch {
      // بی‌صدا
    }
  };

  // دسته‌بندی رزروها
  const now = todayStart();
  const upcoming = reservations
    .filter((r) => {
      const d = r.departureDate ? new Date(r.departureDate) : null;
      if (!d) return false;
      return (
        d >= now &&
        r.status !== ReservationStatus.CANCELLED &&
        r.status !== ReservationStatus.REJECTED
      );
    })
    .sort((a, b) => (a.departureDate > b.departureDate ? 1 : -1));

  const past = reservations
    .filter((r) => {
      const d = r.departureDate ? new Date(r.departureDate) : null;
      if (!d) return false;
      return d < now;
    })
    .sort((a, b) => (a.departureDate < b.departureDate ? 1 : -1));

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

  const handleToggleWishlist = async (item: WishlistItem) => {
    setRemovingTourId(item.tourId);
    try {
      const res = await wishlistApi.remove(item.tourId);
      if (res.success) {
        setWishlist((prev) => prev.filter((w) => w.tourId !== item.tourId));
        showNotice("✓ از لیست مورد علاقه حذف شد");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف از لیست مورد علاقه");
    } finally {
      setRemovingTourId(null);
    }
  };

  const renderStatus = (r: Reservation) => {
    const color = ReservationStatusColors[r.status as ReservationStatus];
    return (
      <span className="mt-status" style={{ background: `${color}22`, color }}>
        {r.statusPersian || ReservationStatusPersian[r.status as ReservationStatus]}
      </span>
    );
  };

  const renderTripCard = (r: Reservation, isPast: boolean) => (
    <div className="mt-trip-card" key={r.id}>
      <div className="mt-trip-head">
        <div className="mt-trip-title">
          <h4>{r.tourName}</h4>
          <small>{r.tourCode}</small>
        </div>
        {renderStatus(r)}
      </div>

      <div className="mt-trip-body">
        <div className="mt-trip-meta">
          <span>📅 حرکت: <strong>{formatDate(r.departureDate)}</strong></span>
          <span>🔙 بازگشت: <strong>{formatDate(r.returnDate)}</strong></span>
          <span>👥 مسافران: <strong>{r.passengerCount} نفر</strong></span>
          <span>💵 مبلغ: <strong>{formatPrice(r.totalPrice)}</strong></span>
        </div>

        {r.passengers && r.passengers.length > 0 && (
          <div className="mt-passengers">
            {r.passengers.map((p, i) => (
              <span key={i} className="mt-passenger-chip">
                {p.firstName} {p.lastName}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-trip-actions">
        {r.status === ReservationStatus.CONFIRMED && (
          <button
            className="mt-btn"
            onClick={() => setTicketModal({ open: true, reservationId: r.id })}
            title="دریافت بلیط سفر"
          >
            <FaTicketAlt /> بلیط
          </button>
        )}
        <button
          className="mt-btn mt-btn-chat"
          disabled={chattingTourId === r.tourId}
          onClick={() => handleStartChat(r.tourId)}
          title="گفتگو با مدیر آژانس"
        >
          <FaCommentDots /> {chattingTourId === r.tourId ? "⏳..." : "گفتگو با آژانس"}
        </button>
        {!isPast && r.status === ReservationStatus.CONFIRMED && (
          <Link to={`/user/dashboard/tours/${r.tourId}/book`} className="mt-btn mt-btn-book">
            رزرو مجدد
          </Link>
        )}
        {isPast && r.status === ReservationStatus.CONFIRMED && (
          reviewedTourIds.has(r.tourId) ? (
            <span className="mt-btn mt-btn-reviewed" title="نظر شما برای این تور ثبت شده">
              <FaStar /> نظر ثبت شد
            </span>
          ) : (
            <button
              className="mt-btn mt-btn-review"
              onClick={() => setReviewModal({ open: true, tourId: r.tourId, tourName: r.tourName })}
              title="ثبت نظر و امتیاز برای این سفر"
            >
              <FaStar /> ثبت نظر
            </button>
          )
        )}
      </div>
    </div>
  );

  const renderWishlistCard = (item: WishlistItem) => (
    <div className="mt-trip-card mt-wish-card" key={item.tourId}>
      <div className="mt-trip-head">
        <div className="mt-trip-title">
          <h4>{item.baseTourName}</h4>
          <small>{item.baseTourCode}</small>
        </div>
        <span className="mt-wish-heart">
          <FaHeart />
        </span>
      </div>

      <div className="mt-trip-body">
        <div className="mt-trip-meta">
          <span>📅 حرکت: <strong>{formatDate(item.departureDate)}</strong></span>
          <span>🔙 بازگشت: <strong>{formatDate(item.returnDate)}</strong></span>
          <span>🏢 آژانس: <strong>{item.createdByUsername}</strong></span>
          <span>💺 ظرفیت: <strong>{item.availableCapacity} نفر</strong></span>
        </div>
      </div>

      <div className="mt-trip-actions">
        <button
          className="mt-btn mt-btn-danger"
          disabled={removingTourId === item.tourId}
          onClick={() => handleToggleWishlist(item)}
        >
          <FaTrash /> حذف
        </button>
        <Link to={`/user/dashboard/tours/${item.tourId}/book`} className="mt-btn mt-btn-book">
          رزرو تور
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-loading">
        <div className="mt-spinner" />
        <p>در حال بارگذاری سفرها...</p>
      </div>
    );
  }

  return (
    <div className="mt-container">
      {notice && <div className="mt-notice">{notice}</div>}
      {error && <div className="mt-error">{error}</div>}

      <div className="mt-header">
        <div>
          <h1>✈️ سفرهای من</h1>
          <p>سفرهای پیش رو، گذشته و تورهای مورد علاقه</p>
        </div>
        <button className="mt-refresh" onClick={fetchAll}>
          <FaSyncAlt /> بروزرسانی
        </button>
      </div>

      {/* تب‌ها */}
      <div className="mt-tabs">
        <button
          className={`mt-tab ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          📅 سفرهای پیش رو {upcoming.length > 0 && <span className="mt-tab-count">{upcoming.length}</span>}
        </button>
        <button
          className={`mt-tab ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          ✅ سفرهای گذشته {past.length > 0 && <span className="mt-tab-count">{past.length}</span>}
        </button>
        <button
          className={`mt-tab ${activeTab === "wishlist" ? "active" : ""}`}
          onClick={() => setActiveTab("wishlist")}
        >
          📌 مورد علاقه {wishlist.length > 0 && <span className="mt-tab-count">{wishlist.length}</span>}
        </button>
      </div>

      {/* تب پیش رو */}
      {activeTab === "upcoming" && (
        <div className="mt-section">
          {upcoming.length === 0 ? (
            <div className="mt-empty">
              <span className="mt-empty-icon">🧳</span>
              <p>سفر پیش رویی ندارید — یک تور رزرو کنید!</p>
              <Link to="/user/dashboard/tours" className="mt-btn mt-btn-book">
                مشاهده تورها
              </Link>
            </div>
          ) : (
            <div className="mt-grid">{upcoming.map((r) => renderTripCard(r, false))}</div>
          )}
        </div>
      )}

      {/* تب گذشته */}
      {activeTab === "past" && (
        <div className="mt-section">
          {past.length === 0 ? (
            <div className="mt-empty">
              <span className="mt-empty-icon">🏁</span>
              <p>هنوز سفری به پایان نرسیده</p>
            </div>
          ) : (
            <div className="mt-grid">{past.map((r) => renderTripCard(r, true))}</div>
          )}
        </div>
      )}

      {/* تب مورد علاقه */}
      {activeTab === "wishlist" && (
        <div className="mt-section">
          {wishlist.length === 0 ? (
            <div className="mt-empty">
              <span className="mt-empty-icon">
                <FaRegHeart />
              </span>
              <p>تور مورد علاقه‌ای ندارید — از لیست تورها با قلب ❤️ ذخیره کنید</p>
              <Link to="/user/dashboard/tours" className="mt-btn mt-btn-book">
                مشاهده تورها
              </Link>
            </div>
          ) : (
            <div className="mt-grid">{wishlist.map(renderWishlistCard)}</div>
          )}
        </div>
      )}

      {/* مودال بلیط */}
      <TicketModal
        isOpen={ticketModal.open}
        reservationId={ticketModal.reservationId}
        onClose={() => setTicketModal({ open: false, reservationId: 0 })}
      />

      {/* مودال ثبت نظر */}
      <ReviewModal
        isOpen={reviewModal.open}
        tourId={reviewModal.tourId}
        tourName={reviewModal.tourName}
        onClose={() => setReviewModal({ open: false, tourId: 0, tourName: "" })}
        onSuccess={() => {
          showNotice("✓ نظر شما ثبت شد");
          fetchMyReviews();
        }}
      />
    </div>
  );
};

export default MyTrips;
