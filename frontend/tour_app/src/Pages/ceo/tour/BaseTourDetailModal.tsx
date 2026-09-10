import React from "react";
import { FaTimes, FaRoute, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { BaseTourDetails } from "../../../Types/baseTour";

interface BaseTourDetailModalProps {
  tourDetails: BaseTourDetails;
  onClose: () => void;
  onEditStations: (type: "origins" | "destinations" | "program") => void;
}

const BaseTourDetailModal: React.FC<BaseTourDetailModalProps> = ({
  tourDetails,
  onClose,
  onEditStations,
}) => {
  const { tour, originStations, destinationStations, programStations } = tourDetails;

  const renderStationsList = (stations: any[], title: string, type: "origins" | "destinations" | "program") => (
    <div className="base-tour-detail-section">
      <div className="section-header">
        <h4>
          {title}
          <span className={`stations-count-badge ${type}`}>{stations.length}</span>
        </h4>
        <button className="edit-stations-btn" onClick={() => onEditStations(type)}>
          ✏️ ویرایش
        </button>
      </div>
      {stations.length === 0 ? (
        <p className="no-stations">هیچ ایستگاهی ثبت نشده است</p>
      ) : (
        <div className="stations-timeline">
          {stations.map((station, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="station-name">
                  <FaMapMarkerAlt /> {station.stationName}
                </div>
                <div className="station-details">
                  <span className="station-type">{station.stationTypeName}</span>
                  <span className="station-location">{station.location || station.cityName}</span>
                </div>
                {station.minutesToNext > 0 && (
                  <div className="station-duration">
                    <FaClock /> {station.minutesToNext} دقیقه تا ایستگاه بعدی
                  </div>
                )}
              </div>
              {idx < stations.length - 1 && (
                <div className="timeline-connector">
                  <div className="connector-line"></div>
                  <div className="connector-duration">{station.minutesToNext} دقیقه</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="base-tour-modal-overlay" onClick={onClose}>
      <div className="base-tour-modal base-tour-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="base-tour-modal-header">
          <h3><FaRoute /> جزئیات تور</h3>
          <button className="base-tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="base-tour-modal-body">
          {/* اطلاعات اصلی تور */}
          <div className="base-tour-info">
            <div className="info-row">
              <span className="info-label">نام تور:</span>
              <span className="info-value">{tour.tourName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">کد تور:</span>
              <span className="info-value">{tour.tourCode}</span>
            </div>
            <div className="info-row">
              <span className="info-label">شهر مبدا:</span>
              <span className="info-value">کد {tour.originCityId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">شهر مقصد:</span>
              <span className="info-value">کد {tour.destinationCityId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">تاریخ ایجاد:</span>
              <span className="info-value">{new Date(tour.createdAt).toLocaleDateString("fa-IR")}</span>
            </div>
          </div>

          {/* مبداها */}
          {renderStationsList(originStations, "📍 مبداها", "origins")}

          {/* مقصدها */}
          {renderStationsList(destinationStations, "🎯 مقصدها", "destinations")}

          {/* برنامه تور */}
          {renderStationsList(programStations, "📅 برنامه تور", "program")}
        </div>
        <div className="base-tour-modal-footer">
          <button className="base-tour-btn-close" onClick={onClose}>بستن</button>
        </div>
      </div>
    </div>
  );
};

export default BaseTourDetailModal;