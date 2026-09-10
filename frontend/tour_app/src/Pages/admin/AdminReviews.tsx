import React, { useCallback, useEffect, useState } from "react";
import { FaSyncAlt, FaSearch, FaTrash, FaCommentDots, FaShieldAlt } from "react-icons/fa";
import { adminReviewApi } from "../../Services/reviewApi";
import { TourReview } from "../../Types/review";
import RatingStars from "../../Components/Reviews/RatingStars";
import "../../Components/Reviews/Reviews.css";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fa-IR") : "—";

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminReviewApi.getReviews();
      if (res.success) setReviews(res.data || []);
      else setError(res.message || "خطا در دریافت نظرات");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت نظرات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (r: TourReview) => {
    if (!window.confirm(`نظر «${r.userUsername}» درباره ${r.tourName} حذف شود؟`)) return;
    setDeletingId(r.id);
    try {
      const res = await adminReviewApi.deleteReview(r.id);
      if (res.success) {
        setReviews((prev) => prev.filter((x) => x.id !== r.id));
        showNotice("✓ نظر حذف شد");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف نظر");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r.tourName || "").toLowerCase().includes(q) ||
      (r.tourCode || "").toLowerCase().includes(q) ||
      (r.userUsername || "").toLowerCase().includes(q) ||
      (r.agencyUsername || "").toLowerCase().includes(q) ||
      (r.comment || "").toLowerCase().includes(q)
    );
  });

  const avg =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  if (loading) {
    return (
      <div className="rw-loading">
        <div className="rw-spinner" />
        <p>در حال بارگذاری نظرات...</p>
      </div>
    );
  }

  return (
    <div className="rw-container">
      {notice && <div className="rw-notice">{notice}</div>}
      {error && <div className="rw-error">{error}</div>}

      <div className="rw-header">
        <div>
          <h1>🛡️ مانیتورینگ نظرات</h1>
          <p>نظرات همه کاربران روی همه تورهای پلتفرم — برای دلایل امنیتی</p>
        </div>
        <button className="rw-refresh" onClick={fetchReviews}>
          <FaSyncAlt /> بروزرسانی
        </button>
      </div>

      <div className="rw-summary-grid">
        <div className="rw-summary-card">
          <span className="rw-summary-icon">💬</span>
          <div>
            <strong>{reviews.length}</strong>
            <span>کل نظرات پلتفرم</span>
          </div>
        </div>
        <div className="rw-summary-card">
          <span className="rw-summary-icon">⭐</span>
          <div>
            <strong>{avg || "—"}</strong>
            <span>میانگین امتیاز</span>
          </div>
        </div>
        <div className="rw-summary-card green">
          <span className="rw-summary-icon">🏢</span>
          <div>
            <strong>{new Set(reviews.map((r) => r.agencyUsername)).size}</strong>
            <span>آژانس‌های دارای نظر</span>
          </div>
        </div>
        <div className="rw-summary-card blue">
          <span className="rw-summary-icon">
            <FaShieldAlt />
          </span>
          <div>
            <strong>{reviews.filter((r) => r.rating <= 2).length}</strong>
            <span>نظرات منفی (نیاز بررسی)</span>
          </div>
        </div>
      </div>

      <div className="rw-toolbar">
        <div className="rw-search">
          <FaSearch className="rw-search-icon" />
          <input
            type="text"
            placeholder="جستجوی مسافر، آژانس، تور یا متن نظر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rw-empty">
          <span className="rw-empty-icon">
            <FaCommentDots />
          </span>
          <p>{reviews.length === 0 ? "هنوز نظری ثبت نشده است" : "نظری مطابق جستجو پیدا نشد"}</p>
        </div>
      ) : (
        <div className="rw-grid">
          {filtered.map((r) => (
            <div className="rw-card" key={r.id}>
              <div className="rw-card-head">
                <span className="rw-avatar">
                  {(r.userUsername || "؟").charAt(0).toUpperCase()}
                </span>
                <div className="rw-user">
                  <strong>{r.userUsername}</strong>
                  <small dir="ltr">{r.userMobile}</small>
                </div>
                <RatingStars rating={r.rating} size={15} />
              </div>
              <div className="rw-card-body">
                <div className="rw-tour-info">
                  <span className="rw-tour-name">{r.tourName}</span>
                  <span className="rw-tour-code">{r.tourCode}</span>
                </div>
                <div className="rw-tour-info">
                  <span className="rw-tour-code">🏢 آژانس: {r.agencyUsername}</span>
                </div>
                {r.comment ? (
                  <p className="rw-comment">{r.comment}</p>
                ) : (
                  <p className="rw-comment" style={{ color: "#94a3b8" }}>
                    (بدون توضیح)
                  </p>
                )}
              </div>
              <div className="rw-card-foot">
                <span className="rw-date">🗓 {formatDate(r.createdAt)}</span>
                <button
                  className="rw-delete-btn"
                  disabled={deletingId === r.id}
                  onClick={() => handleDelete(r)}
                >
                  <FaTrash /> {deletingId === r.id ? "⏳..." : "حذف"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
