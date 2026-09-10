import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes, FaCar, FaSync } from "react-icons/fa";
import { tourVehicleApi, vehicleApiForTour } from "../../../Services/tourVehicleApi";
import { TourVehicle, VehicleForSelect } from "../../../Types/tourVehicle";
import ConfirmModal from "../profile/ConfirmModal";
import "./TourVehiclesManager.css";

interface TourVehiclesManagerProps {
  tourId: number;
  tourName: string;
  onClose: () => void;
  onRefresh: () => void;
}

const TourVehiclesManager: React.FC<TourVehiclesManagerProps> = ({
  tourId,
  tourName,
  onClose,
  onRefresh,
}) => {
  const [assignedVehicles, setAssignedVehicles] = useState<TourVehicle[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleForSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<TourVehicle | null>(null);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignedRes, availableRes] = await Promise.all([
        tourVehicleApi.getTourVehicles(tourId),
        vehicleApiForTour.getActiveVehicles(),
      ]);
      setAssignedVehicles(assignedRes);
      setAvailableVehicles(availableRes);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات خودروها" });
    } finally {
      setLoading(false);
    }
  };

  // گرفتن خودروهایی که هنوز به تور اختصاص داده نشدن
  const getUnassignedVehicles = () => {
    const assignedIds = assignedVehicles.map(v => v.vehicleId);
    return availableVehicles.filter(v => !assignedIds.includes(v.id));
  };

  const unassignedVehicles = getUnassignedVehicles();

  const handleAssign = async () => {
    if (!selectedVehicleId) {
      setMessage({ type: "error", text: "لطفاً خودرو را انتخاب کنید" });
      return;
    }

    setIsSubmitting(true);
    try {
      await tourVehicleApi.assignVehicle(tourId, { vehicleId: selectedVehicleId });
      setMessage({ type: "success", text: "خودرو با موفقیت به تور اضافه شد" });
      setSelectedVehicleId(null);
      setShowAssignForm(false);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در تخصیص خودرو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deletingVehicle) return;

    setIsSubmitting(true);
    try {
      await tourVehicleApi.removeVehicle(tourId, deletingVehicle.vehicleId);
      setMessage({ type: "success", text: "خودرو با موفقیت از تور حذف شد" });
      setShowDeleteModal(false);
      setDeletingVehicle(null);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف خودرو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVehicleInfo = (vehicleId: number) => {
    return availableVehicles.find(v => v.id === vehicleId);
  };

  if (loading) {
    return (
      <div className="tour-modal-overlay" onClick={onClose}>
        <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="tour-loading">
            <div className="tour-spinner-small"></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-modal-overlay" onClick={onClose}>
      <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3><FaCar /> مدیریت خودروهای تور - {tourName}</h3>
          <button className="tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tour-modal-body">
          {message && (
            <div className={`tour-toast ${message.type}`} style={{ position: "relative", top: 0, marginBottom: "1rem" }}>
              {message.text}
            </div>
          )}

          {/* دکمه افزودن خودرو */}
          <div className="tour-vehicles-add-btn">
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="btn-add-vehicle"
              disabled={unassignedVehicles.length === 0}
            >
              <FaPlus /> افزودن خودرو به تور
            </button>
            {unassignedVehicles.length === 0 && availableVehicles.length > 0 && (
              <span className="no-vehicle-warning">همه خودروهای فعال به این تور اضافه شده‌اند</span>
            )}
          </div>

          {/* فرم تخصیص خودرو */}
          {showAssignForm && (
            <div className="tour-assign-vehicle-form">
              <div className="form-row">
                <div className="form-group">
                  <label>انتخاب خودرو</label>
                  <select
                    value={selectedVehicleId || ""}
                    onChange={(e) => setSelectedVehicleId(parseInt(e.target.value))}
                    disabled={isSubmitting}
                  >
                    <option value="">انتخاب کنید...</option>
                    {unassignedVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.plateNumber} ({vehicle.manufacturer}) - {vehicle.seatCount} صندلی
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleAssign} className="btn-submit-sm" disabled={!selectedVehicleId || isSubmitting}>
                    {isSubmitting ? "در حال افزودن..." : "افزودن"}
                  </button>
                  <button onClick={() => setShowAssignForm(false)} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* لیست خودروهای تخصیص داده شده */}
          <div className="tour-vehicles-list">
            <h4>خودروهای تخصیص داده شده به تور</h4>
            {assignedVehicles.length === 0 ? (
              <div className="no-vehicles">
                <FaCar />
                <p>هیچ خودرویی به این تور تخصیص داده نشده است</p>
              </div>
            ) : (
              <div className="vehicles-list">
                {assignedVehicles.map(vehicle => {
                  const vehicleInfo = getVehicleInfo(vehicle.vehicleId);
                  return (
                    <div key={vehicle.id} className="vehicle-item">
                      <div className="vehicle-icon">🚗</div>
                      <div className="vehicle-info">
                        <div className="vehicle-name">{vehicle.vehicleName}</div>
                        {vehicleInfo && (
                          <div className="vehicle-details">
                            <span>پلاک: {vehicleInfo.plateNumber}</span>
                            <span>برند: {vehicleInfo.manufacturer}</span>
                            <span>صندلی: {vehicleInfo.seatCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="vehicle-actions">
                        <button
                          className="btn-remove-vehicle"
                          onClick={() => {
                            setDeletingVehicle(vehicle);
                            setShowDeleteModal(true);
                          }}
                          title="حذف از تور"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>بستن</button>
          <button className="tour-btn-refresh" onClick={fetchData}>
            <FaSync /> بروزرسانی
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف خودرو از تور"
        message={`آیا از حذف خودرو "${deletingVehicle?.vehicleName}" از این تور اطمینان دارید؟`}
        onConfirm={handleRemove}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingVehicle(null);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TourVehiclesManager;