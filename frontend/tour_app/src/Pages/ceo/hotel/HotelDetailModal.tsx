import React from "react";
import { FaTimes } from "react-icons/fa";
import { Hotel } from "../../../Types/hotel";

interface HotelDetailModalProps {
  hotel: Hotel;
  onClose: () => void;
}

const HotelDetailModal: React.FC<HotelDetailModalProps> = ({ hotel, onClose }) => {
  if (!hotel) return null;

  const renderStars = (stars: number) => {
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hotel-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات هتل</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>اطلاعات اصلی</h4>
            <div className="detail-row">
              <span className="detail-label">نام هتل:</span>
              <span className="detail-value">{hotel.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">شهر:</span>
              <span className="detail-value">{hotel.city}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ستاره:</span>
              <span className="detail-value stars">{renderStars(hotel.stars)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">آدرس:</span>
              <span className="detail-value">{hotel.address}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>اطلاعات سیستمی</h4>
            <div className="detail-row">
              <span className="detail-label">تاریخ ثبت:</span>
              <span className="detail-value">
                {new Date(hotel.createdAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            {hotel.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">آخرین ویرایش:</span>
                <span className="detail-value">
                  {new Date(hotel.updatedAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailModal;