import React, { useCallback, useEffect, useState } from "react";
import { FaSyncAlt, FaSearch, FaCommentDots } from "react-icons/fa";
import { ceoReviewApi } from "../../../Services/reviewApi";
import { TourReview } from "../../../Types/review";
import RatingStars from "../../../Components/Reviews/RatingStars";
import "../../../Components/Reviews/Reviews.css";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fa-IR") : "—";

const CeoReviews: React.FC = () => {
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ceoReviewApi.getReviews();
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

  const filtered = reviews.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r.tourName || "").toLowerCase().includes(q) ||
      (r.tourCode || "").toLowerCase().includes(q) ||
      (r.userUsername || "").toLowerCase().includes(q) ||
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
      {error && <div className="rw-error">{error}</div>}

      <div className="rw-header">
        <div>
          <h1>⭐ نظرات مسافران</h1>
          <p>بازخورد مسافران درباره تورهای آژانس شما</p>
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
            <span>کل نظرات</span>
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
          <span className="rw-summary-icon">👍</span>
          <div>
            <strong>{reviews.filter((r) => r.rating >= 4).length}</strong>
            <span>نظرات مثبت (۴+ امتیاز)</span>
          </div>
        </div>
        <div className="rw-summary-card blue">
          <span className="rw-summary-icon">📊</span>
          <div>
            <strong>{new Set(reviews.map((r) => r.tourId)).size}</strong>
            <span>تورهای دارای نظر</span>
          </div>
        </div>
      </div>

      <div className="rw-toolbar">
        <div className="rw-search">
          <FaSearch className="rw-search-icon" />
          <input
            type="text"
            placeholder="جستجوی مسافر، تور یا متن نظر..."
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
                <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>
                  {r.rating >= 4 ? "راضی ✅" : r.rating === 3 ? "خنثی ➖" : "ناراضی ⚠️"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CeoReviews;
