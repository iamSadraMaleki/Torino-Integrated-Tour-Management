import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { CeoVerification } from "../../Types/admin";

interface RejectModalProps {
  verification: CeoVerification;
  onConfirm: (id: number, reason: string) => void;
  onClose: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ verification, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("لطفاً دلیل رد را وارد کنید");
      return;
    }
    setLoading(true);
    onConfirm(verification.id, reason);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reject-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>رد درخواست احراز هویت</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p>
            در حال رد درخواست برای:
            <strong> {verification.agencyName}</strong>
          </p>
          <div className="form-group">
            <label>دلیل رد:</label>
            <textarea
              className="reject-reason-input"
              rows={4}
              placeholder="لطفاً دلیل رد درخواست را وارد کنید..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button className="btn-confirm-reject" onClick={handleSubmit} disabled={loading}>
            {loading ? "در حال رد..." : "رد درخواست"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;