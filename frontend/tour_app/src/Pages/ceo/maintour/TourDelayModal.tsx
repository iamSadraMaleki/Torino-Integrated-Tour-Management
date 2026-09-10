import React, { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { realScheduleApi } from "../../../Services/tourApi";
import "./TourDelayModal.css";

interface TourDelayModalProps {
  scheduleId: number;
  onClose: () => void;
}

const TourDelayModal: React.FC<TourDelayModalProps> = ({ scheduleId, onClose }) => {
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (delayMinutes <= 0) {
      alert("لطفاً مقدار تاخیر معتبر وارد کنید (بیشتر از 0)");
      return;
    }

    setLoading(true);
    try {
      await realScheduleApi.applyDelay({
        scheduleId,
        delayMinutes,
      });
      alert("تاخیر با موفقیت اعمال شد");
      onClose(); // بستن مودال و بازگشت برای بروزرسانی
    } catch (error: any) {
      console.error("Error applying delay:", error);
      alert(error.response?.data?.message || "خطا در اعمال تاخیر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tour-modal-overlay" onClick={onClose}>
      <div className="tour-modal tour-delay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3>اعمال تاخیر</h3>
          <button className="tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tour-modal-body">
          <div className="delay-form">
            <div className="form-group">
              <label>مقدار تاخیر (دقیقه) *</label>
              <input
                type="number"
                min="1"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                placeholder="مثال: 15"
                required
                autoFocus
              />
              <small>تاخیر وارد شده به این ایستگاه و تمام ایستگاه‌های بعدی اعمال خواهد شد</small>
            </div>
            <div className="form-actions">
              <button onClick={handleSubmit} className="btn-submit" disabled={loading || delayMinutes <= 0}>
                <FaSave /> {loading ? "در حال اعمال..." : "اعمال تاخیر"}
              </button>
            </div>
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>انصراف</button>
        </div>
      </div>
    </div>
  );
};

export default TourDelayModal;