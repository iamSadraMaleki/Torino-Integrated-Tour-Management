import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes, FaUsers, FaSync, FaMoneyBillWave } from "react-icons/fa";
import { tourStaffApi, staffMemberApiForTour } from "../../../Services/tourStaffApi";
import { TourStaff, StaffMemberForSelect, AssignStaffRequest } from "../../../Types/tourStaff";
import ConfirmModal from "../profile/ConfirmModal";
import "./TourStaffManager.css";

interface TourStaffManagerProps {
  tourId: number;
  tourName: string;
  onClose: () => void;
  onRefresh: () => void;
}

const TourStaffManager: React.FC<TourStaffManagerProps> = ({
  tourId,
  tourName,
  onClose,
  onRefresh,
}) => {
  const [assignedStaff, setAssignedStaff] = useState<TourStaff[]>([]);
  const [availableStaff, setAvailableStaff] = useState<StaffMemberForSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    staffMemberId: 0,
    paymentAmount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<TourStaff | null>(null);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignedRes, availableRes] = await Promise.all([
        tourStaffApi.getStaffByTourId(tourId),
        staffMemberApiForTour.getActiveStaffMembers(),
      ]);
      setAssignedStaff(assignedRes);
      setAvailableStaff(availableRes);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات کارمندان" });
    } finally {
      setLoading(false);
    }
  };

  // گرفتن کارمندانی که هنوز به تور تخصیص داده نشدن
  const getUnassignedStaff = () => {
    const assignedIds = assignedStaff.map(s => s.staffMemberId);
    return availableStaff.filter(s => !assignedIds.includes(s.id));
  };

  const unassignedStaff = getUnassignedStaff();

  const handleAssign = async () => {
    if (!formData.staffMemberId) {
      setMessage({ type: "error", text: "لطفاً کارمند را انتخاب کنید" });
      return;
    }
    if (formData.paymentAmount < 0) {
      setMessage({ type: "error", text: "مبلغ پرداختی نمی‌تواند منفی باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: AssignStaffRequest = {
        tourId: tourId,
        staffMemberId: formData.staffMemberId,
        paymentAmount: formData.paymentAmount,
      };
      await tourStaffApi.assignStaffToTour(request);
      setMessage({ type: "success", text: "کارمند با موفقیت به تور اضافه شد" });
      setFormData({ staffMemberId: 0, paymentAmount: 0 });
      setShowAddForm(false);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در تخصیص کارمند" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deletingStaff) return;

    setIsSubmitting(true);
    try {
      await tourStaffApi.removeStaffFromTour(tourId, deletingStaff.staffMemberId);
      setMessage({ type: "success", text: "کارمند با موفقیت از تور حذف شد" });
      setShowDeleteModal(false);
      setDeletingStaff(null);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف کارمند" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
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
          <h3><FaUsers /> مدیریت کارمندان تور - {tourName}</h3>
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

          {/* دکمه افزودن کارمند */}
          <div className="tour-staff-add-btn">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add-staff"
              disabled={unassignedStaff.length === 0}
            >
              <FaPlus /> افزودن کارمند به تور
            </button>
            {unassignedStaff.length === 0 && availableStaff.length > 0 && (
              <span className="no-staff-warning">همه کارمندان فعال به این تور اضافه شده‌اند</span>
            )}
          </div>

          {/* فرم تخصیص کارمند */}
          {showAddForm && (
            <div className="tour-assign-staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>انتخاب کارمند</label>
                  <select
                    value={formData.staffMemberId}
                    onChange={(e) => setFormData({ ...formData, staffMemberId: parseInt(e.target.value) })}
                    disabled={isSubmitting}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {unassignedStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName} - {staff.positionTitle} ({staff.phoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><FaMoneyBillWave /> مبلغ پرداختی (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.paymentAmount || ""}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseInt(e.target.value) || 0 })}
                    placeholder="مثال: 2500000"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleAssign} className="btn-submit-sm" disabled={!formData.staffMemberId || isSubmitting}>
                    {isSubmitting ? "در حال افزودن..." : "افزودن"}
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* لیست کارمندان تخصیص داده شده */}
          <div className="tour-staff-list">
            <h4>کارمندان تخصیص داده شده به تور</h4>
            {assignedStaff.length === 0 ? (
              <div className="no-staff">
                <FaUsers />
                <p>هیچ کارمندی به این تور تخصیص داده نشده است</p>
              </div>
            ) : (
              <div className="staff-list">
                {assignedStaff.map(staff => {
                  const staffInfo = availableStaff.find(s => s.id === staff.staffMemberId);
                  return (
                    <div key={staff.id} className="staff-item">
                      <div className="staff-icon">👤</div>
                      <div className="staff-info">
                        <div className="staff-name">{staff.fullName}</div>
                        <div className="staff-details">
                          {staffInfo && (
                            <>
                              <span>📋 {staffInfo.positionTitle}</span>
                              <span>📞 {staffInfo.phoneNumber}</span>
                            </>
                          )}
                          <span className="payment-amount">💰 {formatPrice(staff.paymentAmount)}</span>
                        </div>
                      </div>
                      <div className="staff-actions">
                        <button
                          className="btn-remove-staff"
                          onClick={() => {
                            setDeletingStaff(staff);
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
        title="حذف کارمند از تور"
        message={`آیا از حذف کارمند "${deletingStaff?.fullName}" از این تور اطمینان دارید؟`}
        onConfirm={handleRemove}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingStaff(null);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TourStaffManager;