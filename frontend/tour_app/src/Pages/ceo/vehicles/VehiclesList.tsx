import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes, FaSearch } from "react-icons/fa";
import { Vehicle, VehicleRequest, VehicleType, VehicleStatus, VehicleFeature, StaffMemberSimple } from "../../../Types/vehicle";
import { vehicleApi, vehicleFeatureApi, getStaffForDriver } from "../../../Services/vehicleApi";
import VehicleForm from "./VehicleForm";
import VehicleDetailModal from "./VehicleDetailModal";
import ConfirmModal from "../../ceo/profile/ConfirmModal";

interface VehiclesListProps {
  onVehicleChange?: () => void;
}

const VehiclesList: React.FC<VehiclesListProps> = ({ onVehicleChange }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [features, setFeatures] = useState<VehicleFeature[]>([]);
  const [drivers, setDrivers] = useState<StaffMemberSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "all">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, featuresRes, driversRes] = await Promise.all([
        vehicleApi.getAllVehicles(),
        vehicleFeatureApi.getActiveFeatures(),
        getStaffForDriver(),
      ]);
      if (vehiclesRes.success) setVehicles(vehiclesRes.data);
      if (featuresRes.success) setFeatures(featuresRes.data);
      setDrivers(driversRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات" });
    } finally {
      setLoading(false);
    }
  };

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
    const statuses: Record<VehicleStatus, string> = {
      ACTIVE: "فعال",
      UNDER_REPAIR: "در تعمیر",
      INACTIVE: "غیرفعال",
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: VehicleStatus): string => {
    const statuses: Record<VehicleStatus, string> = {
      ACTIVE: "#10b981",
      UNDER_REPAIR: "#f59e0b",
      INACTIVE: "#ef4444",
    };
    return statuses[status] || "#64748b";
  };

  const vehicleTypeOptions: { value: VehicleType; label: string }[] = [
    { value: "BUS", label: "اتوبوس" },
    { value: "MINIBUS", label: "مینی بوس" },
    { value: "CAR", label: "سواری" },
    { value: "VAN", label: "ون" },
    { value: "LUXURY_CAR", label: "سواری لوکس" },
    { value: "TOUR_BUS", label: "اتوبوس توریستی" },
  ];

  const vehicleStatusOptions: { value: VehicleStatus; label: string }[] = [
    { value: "ACTIVE", label: "فعال" },
    { value: "UNDER_REPAIR", label: "در تعمیر" },
    { value: "INACTIVE", label: "غیرفعال" },
  ];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.plateNumber.includes(searchTerm) ||
                          vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || vehicle.type === filterType;
    const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = async (data: VehicleRequest) => {
    setIsSubmitting(true);
    try {
      const response = await vehicleApi.createVehicle(data);
      if (response.success) {
        setVehicles([response.data, ...vehicles]);
        setMessage({ type: "success", text: response.message });
        setShowForm(false);
        if (onVehicleChange) onVehicleChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت خودرو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: VehicleRequest) => {
    if (!editingVehicle) return;
    setIsSubmitting(true);
    try {
      const response = await vehicleApi.updateVehicle(editingVehicle.id, data);
      if (response.success) {
        setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? response.data : v)));
        setMessage({ type: "success", text: response.message });
        setShowForm(false);
        setEditingVehicle(null);
        if (onVehicleChange) onVehicleChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش خودرو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await vehicleApi.deleteVehicle(deletingId);
      if (response.success) {
        setVehicles(vehicles.filter((v) => v.id !== deletingId));
        setMessage({ type: "success", text: response.message });
        if (onVehicleChange) onVehicleChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف خودرو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="vehicles-list-section">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-header-actions">
        <h3>لیست خودروها</h3>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="جستجوی خودرو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as VehicleType | "all")}
          >
            <option value="all">همه انواع</option>
            {vehicleTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as VehicleStatus | "all")}
          >
            <option value="all">همه وضعیت‌ها</option>
            {vehicleStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <FaPlus /> افزودن خودرو جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal form-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingVehicle ? "ویرایش خودرو" : "ثبت خودرو جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <VehicleForm
              initialData={editingVehicle || undefined}
              features={features}
              drivers={drivers}
              onSubmit={editingVehicle ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingVehicle(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="vehicles-table-wrapper">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>نام خودرو</th>
              <th>ساخت</th>
              <th>نوع</th>
              <th>پلاک</th>
              <th>رنگ</th>
              <th>وضعیت</th>
              <th>صندلی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.name}</td>
                <td>{vehicle.manufacturer}</td>
                <td>{getVehicleTypeLabel(vehicle.type)}</td>
                <td>{vehicle.plateNumber}</td>
                <td>{vehicle.color}</td>
                <td style={{ color: getStatusColor(vehicle.status), fontWeight: "bold" }}>
                  {getStatusLabel(vehicle.status)}
                </td>
                <td>{vehicle.seatCount}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn view"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDetailModal(true);
                    }}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingVehicle(vehicle);
                      setShowForm(true);
                    }}
                    title="ویرایش"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => {
                      setDeletingId(vehicle.id);
                      setShowDeleteModal(true);
                    }}
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredVehicles.length === 0 && (
          <div className="empty-state">
            <p>هیچ خودرویی ثبت نشده است</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن خودرو جدید
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف خودرو"
        message="آیا از حذف این خودرو اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      {showDetailModal && selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default VehiclesList;