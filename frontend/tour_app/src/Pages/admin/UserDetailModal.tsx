import React from "react";
import { FaTimes } from "react-icons/fa";
import { User } from "../../Types/admin";

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const getRolePersian = (roles: string[]) => {
    if (roles.includes("ROLE_SUPERADMIN")) return "سوپرادمین";
    if (roles.includes("ROLE_ADMIN")) return "ادمین";
    if (roles.includes("ROLE_CEO")) return "مدیر آژانس";
    return "کاربر عادی";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات کاربر</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">نام کاربری:</span>
            <span className="detail-value">{user.username}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ایمیل:</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">شماره موبایل:</span>
            <span className="detail-value">{user.mobile}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">نقش:</span>
            <span className="detail-value">{getRolePersian(user.roles)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">وضعیت:</span>
            <span className={`status-badge ${user.enabled ? "active" : "inactive"}`}>
              {user.enabled ? "فعال" : "غیرفعال"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">تاریخ ثبت:</span>
            <span className="detail-value">
              {new Date(user.createdAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">آخرین ویرایش:</span>
            <span className="detail-value">
              {new Date(user.updatedAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;