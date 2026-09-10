import React, { useState, useEffect } from "react";
import { FaTimes, FaMapMarkerAlt, FaBuilding, FaCalendar, FaImage } from "react-icons/fa";
import { Station } from "../../../Types/station";
import { stationApi } from "../../../Services/stationApi";

interface StationDetailModalProps {
  station: Station;
  onClose: () => void;
}

const StationDetailModal: React.FC<StationDetailModalProps> = ({ station, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (station.stationImageId) {
      setImageUrl(stationApi.getStationImage(station.stationImageId));
    }
  }, [station]);

  if (!station) return null;

  return (
    <div className="station-modal-overlay" onClick={onClose}>
      <div className="station-modal station-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="station-modal-header">
          <h3>جزئیات ایستگاه</h3>
          <button className="station-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="station-modal-body">
          {/* تصویر */}
          {imageUrl && !imageError && (
            <div className="station-detail-image">
              <img
                src={imageUrl}
                alt={station.stationName}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          <div className="station-detail-info">
            <div className="station-detail-row">
              <span className="station-detail-label">نام ایستگاه:</span>
              <span className="station-detail-value">{station.stationName}</span>
            </div>
            <div className="station-detail-row">
              <span className="station-detail-label">نوع ایستگاه:</span>
              <span className="station-detail-value">{station.stationTypeName}</span>
            </div>
            <div className="station-detail-row">
              <span className="station-detail-label">استان:</span>
              <span className="station-detail-value">{station.provinceName}</span>
            </div>
            <div className="station-detail-row">
              <span className="station-detail-label">شهر:</span>
              <span className="station-detail-value">{station.cityName}</span>
            </div>
            {station.location && (
              <div className="station-detail-row">
                <span className="station-detail-label">آدرس:</span>
                <span className="station-detail-value">{station.location}</span>
              </div>
            )}
            <div className="station-detail-row">
              <span className="station-detail-label">تاریخ ثبت:</span>
              <span className="station-detail-value">{new Date(station.createdAt).toLocaleDateString("fa-IR")}</span>
            </div>
            {station.updatedAt !== station.createdAt && (
              <div className="station-detail-row">
                <span className="station-detail-label">آخرین ویرایش:</span>
                <span className="station-detail-value">{new Date(station.updatedAt).toLocaleDateString("fa-IR")}</span>
              </div>
            )}
          </div>
        </div>
        <div className="station-modal-footer">
          <button className="station-btn-close" onClick={onClose}>بستن</button>
        </div>
      </div>
    </div>
  );
};

export default StationDetailModal;