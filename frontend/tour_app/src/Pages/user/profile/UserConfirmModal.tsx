import React from "react";
import "./UserConfirmModal.css";

interface UserConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const UserConfirmModal: React.FC<UserConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="user-confirm-modal-overlay" onClick={onCancel}>
      <div className="user-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-confirm-modal-header">
          <h3>{title}</h3>
          <button className="user-confirm-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="user-confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="user-confirm-modal-footer">
          <button className="user-btn-cancel" onClick={onCancel} disabled={isLoading}>
            انصراف
          </button>
          <button className="user-btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "در حال پردازش..." : "تایید"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmModal;
