import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaClock, FaMapMarkerAlt, FaSync } from "react-icons/fa";
import { realScheduleApi } from "../../../Services/tourApi";
import { TourRealSchedule } from "../../../Types/tour";
import TourDelayModal from "./TourDelayModal";
import "./TourScheduleGenerator.css";

interface TourScheduleGeneratorProps {
  tourId: number;
  onClose: () => void;
  onDelay: (scheduleId: number) => void;
}

const TourScheduleGenerator: React.FC<TourScheduleGeneratorProps> = ({ tourId, onClose, onDelay }) => {
  const [schedule, setSchedule] = useState<TourRealSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    startTime: "08:00",
  });
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  // ✅ بارگذاری برنامه موجود هنگام باز شدن مودال
  useEffect(() => {
    loadExistingSchedule();
  }, [tourId]);

  const loadExistingSchedule = async () => {
    setLoading(true);
    try {
      const result = await realScheduleApi.getScheduleByTour(tourId);
      if (result && result.length > 0) {
        setSchedule(result);
        setGenerated(true);
        setHasExistingSchedule(true);
      } else {
        setHasExistingSchedule(false);
      }
    } catch (error) {
      console.error("Error loading existing schedule:", error);
      setHasExistingSchedule(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.startDate || !formData.startTime) {
      alert("لطفاً تاریخ و ساعت شروع را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const result = await realScheduleApi.generateSchedule({
        tourId,
        startDate: formData.startDate,
        startTime: formData.startTime,
      });
      setSchedule(result);
      setGenerated(true);
      setHasExistingSchedule(true);
      alert("برنامه زمانی با موفقیت تولید شد");
    } catch (error) {
      console.error("Error generating schedule:", error);
      alert("خطا در تولید برنامه زمانی");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadExistingSchedule();
  };

  const handleApplyDelay = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setShowDelayModal(true);
  };

  const handleDelayClose = async () => {
    setShowDelayModal(false);
    setSelectedScheduleId(null);
    // ✅ بعد از اعمال تاخیر، برنامه رو دوباره بارگذاری کن
    await loadExistingSchedule();
  };

  const formatTime = (time: string) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const getCategoryLabel = (category: string) => {
    if (category === "ORIGIN") return "مبدا";
    if (category === "DESTINATION") return "مقصد";
    return "برنامه";
  };

  const getCategoryIcon = (category: string) => {
    if (category === "ORIGIN") return "📍";
    if (category === "DESTINATION") return "🎯";
    return "📅";
  };

  return (
    <div className="tour-modal-overlay" onClick={onClose}>
      <div className="tour-modal tour-schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3><FaClock /> برنامه زمانی واقعی تور</h3>
          <button className="tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tour-modal-body">
          {/* نمایش وضعیت برنامه موجود */}
          {hasExistingSchedule && !loading && (
            <div className="schedule-info-bar">
              <span>✅ برنامه زمانی قبلاً تولید شده است</span>
              <button onClick={handleRefresh} className="btn-refresh-schedule" title="بروزرسانی">
                <FaSync /> بروزرسانی
              </button>
            </div>
          )}

          {!generated || !hasExistingSchedule ? (
            <div className="schedule-generate-form">
              <div className="form-row">
                <div className="form-group">
                  <label>تاریخ شروع *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ساعت شروع *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button onClick={handleGenerate} className="btn-generate" disabled={loading}>
                  {loading ? "در حال تولید..." : "تولید برنامه زمانی"}
                </button>
              </div>
            </div>
          ) : (
            <div className="schedule-result">
              <div className="schedule-timeline">
                {schedule.map((item, idx) => (
                  <div key={item.id} className="schedule-item">
                    <div className="schedule-timeline-marker">
                      <div className="marker-dot"></div>
                      {idx < schedule.length - 1 && <div className="marker-line"></div>}
                    </div>
                    <div className={`schedule-card ${item.stationCategory.toLowerCase()}`}>
                      <div className="schedule-card-header">
                        <span className="schedule-category">
                          {getCategoryIcon(item.stationCategory)} {getCategoryLabel(item.stationCategory)}
                        </span>
                        <span className="schedule-order">مرتبه {item.orderIndex}</span>
                      </div>
                      <div className="schedule-card-body">
                        <div className="schedule-station">
                          <FaMapMarkerAlt /> ایستگاه {item.stationId}
                        </div>
                        <div className="schedule-time">
                          <FaClock /> زمان ورود: {formatTime(item.plannedArrivalTime)}
                          {item.delayMinutes > 0 && (
                            <span className="delay-badge">+{item.delayMinutes} دقیقه تاخیر</span>
                          )}
                          {item.finalArrivalTime && item.finalArrivalTime !== item.plannedArrivalTime && (
                            <span className="final-time">ورود واقعی: {formatTime(item.finalArrivalTime)}</span>
                          )}
                        </div>
                      </div>
                      <div className="schedule-card-footer">
                        <button
                          className="btn-delay"
                          onClick={() => handleApplyDelay(item.id)}
                        >
                          اعمال تاخیر
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>بستن</button>
        </div>
      </div>

      {showDelayModal && selectedScheduleId && (
        <TourDelayModal
          scheduleId={selectedScheduleId}
          onClose={handleDelayClose}
        />
      )}
    </div>
  );
};

export default TourScheduleGenerator;