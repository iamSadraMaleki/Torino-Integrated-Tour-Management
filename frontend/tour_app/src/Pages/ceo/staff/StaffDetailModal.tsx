import React from "react";
import { FaTimes } from "react-icons/fa";
import { StaffMember } from "../../../Types/staff";

interface StaffDetailModalProps {
  staff: StaffMember;
  onClose: () => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ staff, onClose }) => {
  if (!staff) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content staff-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات کارمند</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>اطلاعات شخصی</h4>
            <div className="detail-row">
              <span className="detail-label">نام و نام خانوادگی:</span>
              <span className="detail-value">{staff.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">کد ملی:</span>
              <span className="detail-value">{staff.nationalCode}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">نام پدر:</span>
              <span className="detail-value">{staff.fatherName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تاریخ تولد:</span>
              <span className="detail-value">{new Date(staff.birthDate).toLocaleDateString("fa-IR")}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">شماره موبایل:</span>
              <span className="detail-value">{staff.phoneNumber}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>اطلاعات شغلی</h4>
            <div className="detail-row">
              <span className="detail-label">سمت:</span>
              <span className="detail-value">{staff.position?.title || "-"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">سابقه کار:</span>
              <span className="detail-value">{staff.workExperience || 0} سال</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تاریخ استخدام:</span>
              <span className="detail-value">{staff.hireDate ? new Date(staff.hireDate).toLocaleDateString("fa-IR") : "-"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">وضعیت:</span>
              <span className={`status-badge ${staff.isActive ? "active" : "inactive"}`}>
                {staff.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>
          </div>

          {staff.address && (
            <div className="detail-section">
              <h4>آدرس</h4>
              <div className="detail-row">
                <span className="detail-value">{staff.address}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;