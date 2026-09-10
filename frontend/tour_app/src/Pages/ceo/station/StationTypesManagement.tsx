import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCity } from "react-icons/fa";
import { stationTypeApi } from "../../../Services/geoApi";
import { StationType, StationTypeCreateRequest, StationTypeUpdateRequest } from "../../../Types/geo";
import StationTypeForm from "./StationTypeForm";
import ConfirmModal from "../profile/ConfirmModal";
import "./StationManagement.css";

const StationTypesManagement: React.FC = () => {
  const [stationTypes, setStationTypes] = useState<StationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<StationType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchStationTypes();
  }, []);

  const fetchStationTypes = async () => {
    setLoading(true);
    try {
      const response = await stationTypeApi.getAllStationTypes();
      if (response.success) {
        setStationTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching station types:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست نوع ایستگاه‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: StationTypeCreateRequest) => {
    setIsSubmitting(true);
    try {
      const response = await stationTypeApi.createStationType(data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchStationTypes();
        setShowForm(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت نوع ایستگاه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: StationTypeUpdateRequest) => {
    if (!editingType) return;
    setIsSubmitting(true);
    try {
      const response = await stationTypeApi.updateStationType(editingType.id, data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchStationTypes();
        setShowForm(false);
        setEditingType(null);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش نوع ایستگاه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await stationTypeApi.deleteStationType(deletingId);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchStationTypes();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف نوع ایستگاه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="station-loading">
        <div className="station-spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="station-types-container">
      {message && (
        <div className={`station-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="station-header">
        <h2><FaCity /> مدیریت نوع ایستگاه‌ها</h2>
        <button className="station-btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن نوع ایستگاه
        </button>
      </div>

      {showForm && (
        <div className="station-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="station-modal" onClick={(e) => e.stopPropagation()}>
            <div className="station-modal-header">
              <h3>{editingType ? "ویرایش نوع ایستگاه" : "افزودن نوع ایستگاه جدید"}</h3>
              <button className="station-modal-close" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <StationTypeForm
              initialData={editingType || undefined}
              onSubmit={editingType ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingType(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="station-types-grid">
        {stationTypes.length === 0 ? (
          <div className="station-no-data">
            <FaCity />
            <p>هیچ نوع ایستگاهی ثبت نشده است</p>
            <button className="station-btn-add" onClick={() => setShowForm(true)}>
              افزودن نوع ایستگاه
            </button>
          </div>
        ) : (
          stationTypes.map((type) => (
            <div key={type.id} className="station-type-card">
              <div className="station-type-icon">🏪</div>
              <div className="station-type-info">
                <h3>{type.typeName}</h3>
                <div className="station-type-meta">
                  <span>تاریخ ثبت: {new Date(type.createdAt).toLocaleDateString("fa-IR")}</span>
                </div>
              </div>
              <div className="station-type-actions">
                <button className="station-btn-edit" onClick={() => {
                  setEditingType(type);
                  setShowForm(true);
                }}>
                  <FaEdit /> ویرایش
                </button>
                <button className="station-btn-delete" onClick={() => {
                  setDeletingId(type.id);
                  setShowDeleteModal(true);
                }}>
                  <FaTrash /> حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف نوع ایستگاه"
        message="آیا از حذف این نوع ایستگاه اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default StationTypesManagement;