import React from "react";
import { FaTimes, FaCar, FaCog, FaUser, FaCalendar, FaPalette, FaIdCard } from "react-icons/fa";
import { Vehicle, VehicleStatus, VehicleType } from "../../../Types/vehicle";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  const getVehicleTypeLabel = (type: VehicleType): string => {
    const types: Record<VehicleType, string> = {
      BUS: "اتوبوس",
      MINIBUS: "مینی بوس",
      CAR: "سواری",
      VAN: "ون",
      LUXURY_CAR: "سواری لوکس",
      TOUR_BUS: "اتوبوس توریستی",
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: VehicleStatus): string => {
    const statuses: Record<VehicleStatus, { label: string; color: string }> = {
      ACTIVE: { label: "فعال", color: "#10b981" },
      UNDER_REPAIR: { label: "در تعمیر", color: "#f59e0b" },
      INACTIVE: { label: "غیرفعال", color: "#ef4444" },
    };
    return statuses[status]?.label || status;
  };

  const getStatusColor = (status: VehicleStatus): string => {
    const statuses: Record<VehicleStatus, string> = {
      ACTIVE: "#10b981",
      UNDER_REPAIR: "#f59e0b",
      INACTIVE: "#ef4444",
    };
    return statuses[status] || "#64748b";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content vehicle-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات خودرو</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>اطلاعات اصلی</h4>
            <div className="detail-row">
              <span className="detail-label"><FaCar /> نام خودرو:</span>
              <span className="detail-value">{vehicle.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ساخت (برند):</span>
              <span className="detail-value">{vehicle.manufacturer}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">نوع:</span>
              <span className="detail-value">{getVehicleTypeLabel(vehicle.type)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">وضعیت:</span>
              <span className="detail-value" style={{ color: getStatusColor(vehicle.status), fontWeight: "bold" }}>
                {getStatusLabel(vehicle.status)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><FaIdCard /> شماره پلاک:</span>
              <span className="detail-value">{vehicle.plateNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><FaPalette /> رنگ:</span>
              <span className="detail-value">{vehicle.color}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><FaCalendar /> سال ساخت:</span>
              <span className="detail-value">{vehicle.modelYear}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>اطلاعات فنی</h4>
            <div className="detail-row">
              <span className="detail-label">تعداد ردیف‌ها:</span>
              <span className="detail-value">{vehicle.rowCount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تعداد صندلی‌ها:</span>
              <span className="detail-value">{vehicle.seatCount}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4><FaUser /> اطلاعات راننده</h4>
            {vehicle.currentDriver ? (
              <>
                <div className="detail-row">
                  <span className="detail-label">نام:</span>
                  <span className="detail-value">{vehicle.currentDriver.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">کد ملی:</span>
                  <span className="detail-value">{vehicle.currentDriver.nationalCode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">شماره تماس:</span>
                  <span className="detail-value">{vehicle.currentDriver.phoneNumber}</span>
                </div>
              </>
            ) : (
              <div className="detail-row">
                <span className="detail-value">راننده‌ای تعیین نشده است</span>
              </div>
            )}
          </div>

          {vehicle.features && vehicle.features.length > 0 && (
            <div className="detail-section">
              <h4><FaCog /> ویژگی‌ها</h4>
              <div className="features-list-modal">
                {vehicle.features.map((feature) => (
                  <span key={feature.id} className="feature-tag-modal">
                    {feature.icon || "🔧"} {feature.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {vehicle.description && (
            <div className="detail-section">
              <h4>توضیحات</h4>
              <div className="detail-row">
                <span className="detail-value">{vehicle.description}</span>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4>اطلاعات سیستمی</h4>
            <div className="detail-row">
              <span className="detail-label">تاریخ ثبت:</span>
              <span className="detail-value">
                {new Date(vehicle.createdAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            {vehicle.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">آخرین ویرایش:</span>
                <span className="detail-value">
                  {new Date(vehicle.updatedAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;