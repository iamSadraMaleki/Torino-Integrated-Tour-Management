import React, { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { userReviewApi } from "../../../Services/reviewApi";

interface ReviewModalProps {
  isOpen: boolean;
  tourId: number;
  tourName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, tourId, tourName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("لطفاً امتیاز بدهید");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await userReviewApi.create({
        tourId,
        rating,
        comment: comment.trim(),
      });
      if (res.success) {
        setRating(0);
        setComment("");
        onSuccess();
        onClose();
      } else {
        setError(res.message || "خطا در ثبت نظر");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ثبت نظر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rv-modal-header">
          <h3>⭐ ثبت نظر درباره تور</h3>
          <button className="rv-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rv-modal-body">
          <p className="rv-tour-name">{tourName}</p>

          <div className="rv-stars-input">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                className="rv-star-btn"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ color: s <= (hoverRating || rating) ? "#f59e0b" : "#d1d5db" }}
              >
                <FaStar size={26} />
              </button>
            ))}
          </div>

          <textarea
            className="rv-textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="تجربه‌تان از این سفر را بنویسید... (اختیاری)"
          />

          {error && <div className="rv-error">{error}</div>}
        </div>

        <div className="rv-modal-actions">
          <button className="rv-btn-cancel" onClick={onClose}>
            انصراف
          </button>
          <button className="rv-btn-submit" disabled={loading} onClick={handleSubmit}>
            {loading ? "⏳..." : "ثبت نظر"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
