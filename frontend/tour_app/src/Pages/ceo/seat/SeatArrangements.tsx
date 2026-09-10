import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaStar, FaRegStar, FaTimes } from "react-icons/fa";
import { MdPattern } from "react-icons/md";
import { SeatArrangement, SeatArrangementRequest, SEAT_ARRANGEMENT_PATTERNS } from "../../../Types/seat";
import { seatArrangementApi } from "../../../Services/seatApi";
import SeatArrangementForm from "./SeatArrangementForm";
import ConfirmModal from "../../ceo/profile/ConfirmModal";
import './SeatArrangements.css';
const SeatArrangements: React.FC = () => {
  const [arrangements, setArrangements] = useState<SeatArrangement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArrangement, setEditingArrangement] = useState<SeatArrangement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchArrangements();
  }, []);

  const fetchArrangements = async () => {
    setLoading(true);
    try {
      const response = await seatArrangementApi.getAllArrangements();
      if (response.success) {
        setArrangements(response.data);
      } else {
        setArrangements([]);
      }
    } catch (error) {
      console.error("Error fetching arrangements:", error);
      setArrangements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: SeatArrangementRequest) => {
    setIsSubmitting(true);
    try {
      const response = await seatArrangementApi.createArrangement(data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchArrangements();
        setShowForm(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت الگو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: SeatArrangementRequest) => {
    if (!editingArrangement) return;
    setIsSubmitting(true);
    try {
      const response = await seatArrangementApi.updateArrangement(editingArrangement.id, data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchArrangements();
        setShowForm(false);
        setEditingArrangement(null);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش الگو" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await seatArrangementApi.setDefaultArrangement(id);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchArrangements();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در تنظیم الگوی پیش‌فرض" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await seatArrangementApi.deleteArrangement(deletingId);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchArrangements();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف الگو" });
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
    <div className="arrangements-container">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="arrangements-header">
        <h2>
          <MdPattern /> مدیریت الگوهای چینش صندلی
        </h2>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن الگو
        </button>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingArrangement ? "ویرایش الگو" : "افزودن الگوی جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <SeatArrangementForm
              initialData={editingArrangement || undefined}
              onSubmit={editingArrangement ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingArrangement(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="arrangements-grid">
        {arrangements.length === 0 ? (
          <div className="no-data">
            <MdPattern />
            <p>هیچ الگویی وجود ندارد</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن الگوی جدید
            </button>
          </div>
        ) : (
          arrangements.map((arr) => (
            <div key={arr.id} className={`arrangement-card ${arr.isDefault ? "default" : ""}`}>
              {arr.isDefault && (
                <div className="default-badge">
                  <FaStar /> پیش‌فرض
                </div>
              )}
              <div className="card-header">
                <h3>{arr.name}</h3>
                <div className="pattern-badge">{SEAT_ARRANGEMENT_PATTERNS[arr.pattern]}</div>
              </div>
              <div className="card-body">
                <p className="description">{arr.description || "بدون توضیحات"}</p>
                <div className="card-meta">
                  <span>ایجاد شده توسط: {arr.username}</span>
                </div>
              </div>
              <div className="card-actions">
                {!arr.isDefault && (
                  <button className="btn-set-default" onClick={() => handleSetDefault(arr.id)} disabled={isSubmitting}>
                    <FaRegStar /> پیش‌فرض
                  </button>
                )}
                <button className="btn-edit-sm" onClick={() => {
                  setEditingArrangement(arr);
                  setShowForm(true);
                }} disabled={isSubmitting}>
                  <FaEdit /> ویرایش
                </button>
                {!arr.isDefault && (
                  <button className="btn-delete-sm" onClick={() => {
                    setDeletingId(arr.id);
                    setShowDeleteModal(true);
                  }} disabled={isSubmitting}>
                    <FaTrash /> حذف
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف الگو"
        message="آیا از حذف این الگو اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SeatArrangements;