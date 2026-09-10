import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";  // ← FaTimes رو اضافه کن
import { Position, PositionRequest } from "../../../Types/staff";
import { positionApi } from "../../../Services/staffApi";
import PositionForm from "./PositionForm";
import ConfirmModal from "../../ceo/profile/ConfirmModal";

interface PositionsListProps {
  onPositionChange?: () => void;
}

const PositionsList: React.FC<PositionsListProps> = ({ onPositionChange }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await positionApi.getAllPositions();
      if (response.success) {
        setPositions(response.data);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست سمت‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: PositionRequest) => {
    setIsSubmitting(true);
    try {
      const response = await positionApi.createPosition(data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchPositions();
        setShowForm(false);
        if (onPositionChange) onPositionChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت سمت" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: PositionRequest) => {
    if (!editingPosition) return;
    setIsSubmitting(true);
    try {
      const response = await positionApi.updatePosition(editingPosition.id, data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchPositions();
        setShowForm(false);
        setEditingPosition(null);
        if (onPositionChange) onPositionChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش سمت" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await positionApi.deletePosition(deletingId);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchPositions();
        if (onPositionChange) onPositionChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف سمت" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
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
    <div className="positions-section">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-header-actions">
        <h3>لیست سمت‌ها</h3>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن سمت جدید
        </button>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingPosition ? "ویرایش سمت" : "ثبت سمت جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <PositionForm
              initialData={editingPosition || undefined}
              onSubmit={editingPosition ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingPosition(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="positions-table-wrapper">
        <table className="positions-table">
          <thead>
            <tr>
              <th>عنوان سمت</th>
              <th>توضیحات</th>
              <th>وضعیت</th>
              <th>تاریخ ایجاد</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id}>
                <td>{position.title}</td>
                <td className="description-cell">{position.description || "-"}</td>
                <td>{getStatusBadge(position.isActive)}</td>
                <td>{new Date(position.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingPosition(position);
                      setShowForm(true);
                    }}
                    title="ویرایش"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => openDeleteModal(position.id)}
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {positions.length === 0 && (
          <div className="empty-state">
            <p>هیچ سمنتی ثبت نشده است</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن سمت جدید
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف سمت"
        message="آیا از حذف این سمت اطمینان دارید؟ در صورت وجود کارمند در این سمت، امکان حذف وجود ندارد."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PositionsList;