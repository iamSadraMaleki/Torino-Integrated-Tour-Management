import React, { useState } from "react";
import { FaTimes, FaCalendarAlt, FaMoneyBillWave, FaUsers, FaRoute, FaClock, FaPlay, FaCar, FaHotel, FaUtensils, FaShieldAlt, FaChevronLeft } from "react-icons/fa";
import { TourDetails, TourStationItem } from "../../../Types/tour";
import TourStationManager from "./TourStationManager";
import TourScheduleGenerator from "./TourScheduleGenerator";
import TourVehiclesManager from "./TourVehiclesManager";
import TourDelayModal from "./TourDelayModal";
import TourHotelsManager from "./TourHotelsManager";
import TourStaffManager from "./TourStaffManager";
import TourFoodManager from "./TourFoodManager";
import TourInsurancesManager from "./TourInsurancesManager";
import "./ToursManagement.css";

interface TourDetailsModalProps {
  tourDetails: TourDetails;
  onClose: () => void;
  onRefresh: () => void;
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({ tourDetails, onClose, onRefresh }) => {
  const { tour, originStations, destinationStations, programStations } = tourDetails;
  const [activeTab, setActiveTab] = useState<"origins" | "destinations" | "program">("origins");
  const [showStationManager, setShowStationManager] = useState(false);
  const [showScheduleGenerator, setShowScheduleGenerator] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [showVehiclesManager, setShowVehiclesManager] = useState(false);
  const [showHotelsManager, setShowHotelsManager] = useState(false);
  const [showStaffManager, setShowStaffManager] = useState(false);
  const [showFoodManager, setShowFoodManager] = useState(false);
  const [showInsurancesManager, setShowInsurancesManager] = useState(false);

  const getTourDays = () => {
    const start = new Date(tour.departureDate);
    const end = new Date(tour.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const getActiveCount = (stations: TourStationItem[]) => {
    return stations.filter(s => s.isActive).length;
  };

  const getTotalDuration = (stations: TourStationItem[]) => {
    const total = stations.reduce((sum, s) => sum + (s.minutesToNext || 0), 0);
    if (total === 0) return "نامشخص";
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return hours > 0 ? `${hours} ساعت و ${minutes} دقیقه` : `${minutes} دقیقه`;
  };

  return (
    <div className="tour-modal-overlay" onClick={onClose}>
      <div className="tour-modal tour-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3><FaRoute /> جزئیات تور</h3>
          <button className="tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tour-modal-body">
          {/* اطلاعات اصلی تور */}
          <div className="tour-info-section">
            <div className="tour-info-grid">
              <div className="tour-info-item">
                <span className="info-label">نام تور:</span>
                <span className="info-value">{tour.baseTourName}</span>
              </div>
              <div className="tour-info-item">
                <span className="info-label">کد تور:</span>
                <span className="info-value">{tour.baseTourCode}</span>
              </div>
              <div className="tour-info-item">
                <span className="info-label"><FaCalendarAlt /> تاریخ حرکت:</span>
                <span className="info-value">{new Date(tour.departureDate).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="tour-info-item">
                <span className="info-label"><FaCalendarAlt /> تاریخ بازگشت:</span>
                <span className="info-value">{new Date(tour.returnDate).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="tour-info-item">
                <span className="info-label"><FaMoneyBillWave /> قیمت:</span>
                <span className="info-value price">{formatPrice(tour.price)}</span>
              </div>
              <div className="tour-info-item">
                <span className="info-label"><FaUsers /> ظرفیت:</span>
                <span className="info-value">{tour.capacity} نفر</span>
              </div>
            </div>
            {tour.description && (
              <div className="tour-description">
                <p>{tour.description}</p>
              </div>
            )}
          </div>

          {/* دکمه تولید برنامه زمانی - تمام عرض */}
          <button 
            className="tour-generate-schedule-btn"
            onClick={() => setShowScheduleGenerator(true)}
          >
            <FaPlay /> تولید برنامه زمانی واقعی
          </button>

          {/* گرید منابع تور - کارت‌های مدیریت */}
          <div className="tour-resources-section">
            <div className="tour-resources-header">
              <div className="tour-resources-title">
                <span className="tour-resources-icon">🛠️</span>
                <div>
                  <h4>منابع و تجهیزات تور</h4>
                  <p>خودرو، هتل، کارمند، غذا و بیمه این تور را مدیریت کنید</p>
                </div>
              </div>
            </div>
            <div className="tour-management-buttons">
              <button 
                className="tour-vehicles-manage-btn"
                onClick={() => setShowVehiclesManager(true)}
              >
                <span className="manage-btn-icon"><FaCar /></span>
                <span className="manage-btn-text">
                  <span className="manage-btn-title">خودروها</span>
                  <span className="manage-btn-desc">تخصیص خودرو به تور</span>
                </span>
                <span className="manage-btn-arrow"><FaChevronLeft /></span>
              </button>

              <button 
                className="tour-hotels-manage-btn"
                onClick={() => setShowHotelsManager(true)}
              >
                <span className="manage-btn-icon"><FaHotel /></span>
                <span className="manage-btn-text">
                  <span className="manage-btn-title">هتل‌ها</span>
                  <span className="manage-btn-desc">اقامت‌گاه‌های تور</span>
                </span>
                <span className="manage-btn-arrow"><FaChevronLeft /></span>
              </button>

              <button 
                className="tour-staff-manage-btn"
                onClick={() => setShowStaffManager(true)}
              >
                <span className="manage-btn-icon"><FaUsers /></span>
                <span className="manage-btn-text">
                  <span className="manage-btn-title">کارمندان</span>
                  <span className="manage-btn-desc">عوامل اجرایی تور</span>
                </span>
                <span className="manage-btn-arrow"><FaChevronLeft /></span>
              </button>

              <button 
                className="tour-food-manage-btn"
                onClick={() => setShowFoodManager(true)}
              >
                <span className="manage-btn-icon"><FaUtensils /></span>
                <span className="manage-btn-text">
                  <span className="manage-btn-title">غذاها</span>
                  <span className="manage-btn-desc">منوی وعده‌های غذایی</span>
                </span>
                <span className="manage-btn-arrow"><FaChevronLeft /></span>
              </button>

              <button 
                className="tour-insurance-manage-btn"
                onClick={() => setShowInsurancesManager(true)}
              >
                <span className="manage-btn-icon"><FaShieldAlt /></span>
                <span className="manage-btn-text">
                  <span className="manage-btn-title">بیمه</span>
                  <span className="manage-btn-desc">پوشش بیمه مسافران</span>
                </span>
                <span className="manage-btn-arrow"><FaChevronLeft /></span>
              </button>
            </div>
          </div>

          {/* تب‌های ایستگاه‌ها */}
          <div className="tour-stations-tabs">
            <button
              className={`tab-btn ${activeTab === "origins" ? "active" : ""}`}
              onClick={() => setActiveTab("origins")}
            >
              <span className="tab-btn-label">📍 مبداها</span>
              <span className="tab-count">{getActiveCount(originStations)}/{originStations.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "destinations" ? "active" : ""}`}
              onClick={() => setActiveTab("destinations")}
            >
              <span className="tab-btn-label">🎯 مقصدها</span>
              <span className="tab-count">{getActiveCount(destinationStations)}/{destinationStations.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "program" ? "active" : ""}`}
              onClick={() => setActiveTab("program")}
            >
              <span className="tab-btn-label">📅 برنامه</span>
              <span className="tab-count">{getActiveCount(programStations)}/{programStations.length}</span>
            </button>
            <button
              className="tab-btn manage-btn"
              onClick={() => setShowStationManager(true)}
            >
              <span className="tab-btn-label">✏️ مدیریت ایستگاه‌ها</span>
            </button>
          </div>

          {/* نمایش ایستگاه‌های تب انتخاب شده */}
          <div className="tour-stations-list">
            {(activeTab === "origins" ? originStations : activeTab === "destinations" ? destinationStations : programStations).map((station) => (
              <div key={station.id} className={`tour-station-item ${!station.isActive ? "inactive" : ""}`}>
                <div className="station-order">{station.orderNo}</div>
                <div className="station-info">
                  <div className="station-name">{station.stationName}</div>
                  {station.minutesToNext > 0 && (
                    <div className="station-duration">
                      <FaClock /> {station.minutesToNext} دقیقه تا ایستگاه بعدی
                    </div>
                  )}
                </div>
                <div className="station-status">
                  {station.isActive ? (
                    <span className="status-badge active">فعال</span>
                  ) : (
                    <span className="status-badge inactive">غیرفعال</span>
                  )}
                </div>
              </div>
            ))}
            {activeTab === "origins" && originStations.length === 0 && (
              <div className="no-stations">هیچ ایستگاه مبدایی ثبت نشده است</div>
            )}
            {activeTab === "destinations" && destinationStations.length === 0 && (
              <div className="no-stations">هیچ ایستگاه مقصدی ثبت نشده است</div>
            )}
            {activeTab === "program" && programStations.length === 0 && (
              <div className="no-stations">هیچ ایستگاه برنامه‌ای ثبت نشده است</div>
            )}
          </div>

          {/* خلاصه مسیر */}
          <div className="tour-route-summary">
            <div className="summary-item">
              <span>📍 تعداد مبداها:</span>
              <strong>{getActiveCount(originStations)}/{originStations.length} فعال</strong>
            </div>
            <div className="summary-item">
              <span>🎯 تعداد مقصدها:</span>
              <strong>{getActiveCount(destinationStations)}/{destinationStations.length} فعال</strong>
            </div>
            <div className="summary-item">
              <span>📅 تعداد برنامه:</span>
              <strong>{getActiveCount(programStations)}/{programStations.length} فعال</strong>
            </div>
            <div className="summary-item">
              <span>⏱️ زمان کل سفر (مبداها):</span>
              <strong>{getTotalDuration(originStations)}</strong>
            </div>
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>بستن</button>
        </div>
      </div>

      {/* مودال مدیریت ایستگاه‌ها */}
      {showStationManager && (
        <TourStationManager
          tourId={tour.id}
          originStations={originStations}
          destinationStations={destinationStations}
          programStations={programStations}
          onClose={() => setShowStationManager(false)}
          onRefresh={() => {
            setShowStationManager(false);
            onRefresh();
            onClose();
          }}
        />
      )}

      {/* مودال تولید برنامه زمانی */}
      {showScheduleGenerator && (
        <TourScheduleGenerator
          tourId={tour.id}
          onClose={() => setShowScheduleGenerator(false)}
          onDelay={(scheduleId) => {
            setSelectedScheduleId(scheduleId);
            setShowScheduleGenerator(false);
            setShowDelayModal(true);
          }}
        />
      )}

      {/* مودال اعمال تاخیر */}
      {showDelayModal && selectedScheduleId && (
        <TourDelayModal
          scheduleId={selectedScheduleId}
          onClose={() => {
            setShowDelayModal(false);
            setSelectedScheduleId(null);
          }}
        />
      )}

      {/* مودال مدیریت خودروهای تور */}
      {showVehiclesManager && (
        <TourVehiclesManager
          tourId={tour.id}
          tourName={tour.baseTourName}
          onClose={() => setShowVehiclesManager(false)}
          onRefresh={onRefresh}
        />
      )}

      {/* مودال مدیریت هتل‌های تور */}
      {showHotelsManager && (
        <TourHotelsManager
          tourId={tour.id}
          tourName={tour.baseTourName}
          onClose={() => setShowHotelsManager(false)}
          onRefresh={onRefresh}
        />
      )}

      {/* مودال مدیریت کارمندان تور */}
      {showStaffManager && (
        <TourStaffManager
          tourId={tour.id}
          tourName={tour.baseTourName}
          onClose={() => setShowStaffManager(false)}
          onRefresh={onRefresh}
        />
      )}

      {/* مودال مدیریت غذاها و منوی تور */}
      {showFoodManager && (
        <TourFoodManager
          tourId={tour.id}
          tourName={tour.baseTourName}
          tourDays={getTourDays()}
          onClose={() => setShowFoodManager(false)}
          onRefresh={onRefresh}
        />
      )}

      {/* مودال مدیریت بیمه‌های تور */}
      {showInsurancesManager && (
        <TourInsurancesManager
          tourId={tour.id}
          tourName={tour.baseTourName}
          onClose={() => setShowInsurancesManager(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default TourDetailsModal;