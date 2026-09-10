import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from "react-icons/fa";  // ← FaTimes رو اضافه کن
import { StaffMember, StaffMemberRequest, Position } from "../../../Types/staff";
import { staffMemberApi, positionApi } from "../../../Services/staffApi";
import StaffForm from "./StaffForm";
import ConfirmModal from "../../ceo/profile/ConfirmModal";
import StaffDetailModal from "./StaffDetailModal";
interface StaffListProps {
  onStaffChange?: () => void;
}

const StaffList: React.FC<StaffListProps> = ({ onStaffChange }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterPosition, setFilterPosition] = useState<number | "all">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, positionsRes] = await Promise.all([
        staffMemberApi.getAllStaffMembers(),
        positionApi.getAllPositions(),
      ]);
      if (staffRes.success) setStaff(staffRes.data);
      if (positionsRes.success) setPositions(positionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات" });
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = filterPosition === "all"
    ? staff
    : staff.filter((s) => s.position.id === filterPosition);

  const handleCreate = async (data: StaffMemberRequest) => {
    setIsSubmitting(true);
    try {
      const response = await staffMemberApi.createStaffMember(data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchData();
        setShowForm(false);
        if (onStaffChange) onStaffChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت کارمند" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: StaffMemberRequest) => {
    if (!editingStaff) return;
    setIsSubmitting(true);
    try {
      const response = await staffMemberApi.updateStaffMember(editingStaff.id, data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchData();
        setShowForm(false);
        setEditingStaff(null);
        if (onStaffChange) onStaffChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش کارمند" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await staffMemberApi.deleteStaffMember(deletingId);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchData();
        if (onStaffChange) onStaffChange();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف کارمند" });
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
    <div className="staff-list-section">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-header-actions">
        <h3>لیست کارمندان</h3>
        <div className="header-actions">
          <select
            className="filter-select"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">همه سمت‌ها</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <FaPlus /> افزودن کارمند جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal form-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingStaff ? "ویرایش کارمند" : "ثبت کارمند جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <StaffForm
              initialData={editingStaff || undefined}
              positions={positions}
              onSubmit={editingStaff ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingStaff(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="staff-table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>نام و نام خانوادگی</th>
              <th>کد ملی</th>
              <th>شماره موبایل</th>
              <th>سمت</th>
              <th>وضعیت</th>
              <th>تاریخ استخدام</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member.id}>
                <td>{member.fullName}</td>
                <td>{member.nationalCode}</td>
                <td>{member.phoneNumber}</td>
                <td>{member.position.title}</td>
                <td>{getStatusBadge(member.isActive)}</td>
                <td>{new Date(member.hireDate).toLocaleDateString("fa-IR")}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn view"
                    onClick={() => {
                      setSelectedStaff(member);
                      setShowDetailModal(true);
                    }}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingStaff(member);
                      setShowForm(true);
                    }}
                    title="ویرایش"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => {
                      setDeletingId(member.id);
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
        {filteredStaff.length === 0 && (
          <div className="empty-state">
            <p>هیچ کارمندی ثبت نشده است</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن کارمند جدید
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف کارمند"
        message="آیا از حذف این کارمند اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      {showDetailModal && selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default StaffList;