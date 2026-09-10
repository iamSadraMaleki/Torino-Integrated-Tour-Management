import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { VehicleFeature, VehicleFeatureRequest } from "../../../Types/vehicle";
import { vehicleFeatureApi } from "../../../Services/vehicleApi";
import VehicleFeatureForm from "../vehicles/VehicleFeatureForm";
import ConfirmModal from "../../ceo/profile/ConfirmModal";

interface VehicleFeaturesListProps {
  onFeatureChange?: () => void;
}

const VehicleFeaturesList: React.FC<VehicleFeaturesListProps> = ({ onFeatureChange }) => {
  const [features, setFeatures] = useState<VehicleFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<VehicleFeature | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const response = await vehicleFeatureApi.getAllFeatures();
      if (response.success) {
        setFeatures(response.data);
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست ویژگی‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: VehicleFeatureRequest) => {
    setIsSubmitting(true);
    try {
      const response = await vehicleFeatureApi.createFeature(data);
      if (response.success) {
        setFeatures([response.data, ...features]);
        setMessage({ type: "success", text: response.message });
        setShowForm(false);
        if (onFeatureChange) onFeatureChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت ویژگی" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: VehicleFeatureRequest) => {
    if (!editingFeature) return;
    setIsSubmitting(true);
    try {
      const response = await vehicleFeatureApi.updateFeature(editingFeature.id, data);
      if (response.success) {
        setFeatures(features.map((f) => (f.id === editingFeature.id ? response.data : f)));
        setMessage({ type: "success", text: response.message });
        setShowForm(false);
        setEditingFeature(null);
        if (onFeatureChange) onFeatureChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش ویژگی" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await vehicleFeatureApi.deleteFeature(deletingId);
      if (response.success) {
        setFeatures(features.filter((f) => f.id !== deletingId));
        setMessage({ type: "success", text: response.message });
        if (onFeatureChange) onFeatureChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف ویژگی" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="status-badge active">فعال</span>
    ) : (
      <span className="status-badge inactive">غیرفعال</span>
    );
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
    <div className="features-list-section">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-header-actions">
        <h3>لیست ویژگی‌های خودرو</h3>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن ویژگی جدید
        </button>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingFeature ? "ویرایش ویژگی" : "ثبت ویژگی جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <VehicleFeatureForm
              initialData={editingFeature || undefined}
              onSubmit={editingFeature ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingFeature(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="features-table-wrapper">
        <table className="features-table">
          <thead>
            <tr>
              <th>نام ویژگی</th>
              <th>توضیحات</th>
              <th>آیکون</th>
              <th>وضعیت</th>
              <th>تاریخ ثبت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id}>
                <td>{feature.name}</td>
                <td>{feature.description || "-"}</td>
                <td className="feature-icon-cell">{feature.icon || "🔧"}</td>
                <td>{getStatusBadge(feature.isActive)}</td>
                <td>{new Date(feature.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingFeature(feature);
                      setShowForm(true);
                    }}
                    title="ویرایش"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => {
                      setDeletingId(feature.id);
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
        {features.length === 0 && (
          <div className="empty-state">
            <p>هیچ ویژگی‌ای ثبت نشده است</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن ویژگی جدید
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف ویژگی"
        message="آیا از حذف این ویژگی اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VehicleFeaturesList;