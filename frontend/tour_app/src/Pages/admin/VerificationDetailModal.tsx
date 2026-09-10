import React from "react";
import { FaTimes } from "react-icons/fa";
import { CeoVerification } from "../../Types/admin";

interface VerificationDetailModalProps {
  verification: CeoVerification;
  onClose: () => void;
}

const VerificationDetailModal: React.FC<VerificationDetailModalProps> = ({ verification, onClose }) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "VERIFIED":
        return "status-verified";
      case "REJECTED":
        return "status-rejected";
      default:
        return "status-not-verified";
    }
  };

  const getStatusPersian = (status: string) => {
    switch (status) {
      case "PENDING":
        return "در انتظار بررسی";
      case "VERIFIED":
        return "تایید شده";
      case "REJECTED":
        return "رد شده";
      default:
        return "احراز نشده";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content verification-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات درخواست احراز هویت</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>اطلاعات آژانس</h4>
            <div className="detail-row">
              <span className="detail-label">نام آژانس:</span>
              <span className="detail-value">{verification.agencyName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">نام حقوقی:</span>
              <span className="detail-value">{verification.legalName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">شماره ثبت:</span>
              <span className="detail-value">{verification.registrationNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">شماره مالیات:</span>
              <span className="detail-value">{verification.taxNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تاریخ تاسیس:</span>
              <span className="detail-value">
                {new Date(verification.establishmentDate).toLocaleDateString("fa-IR")}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تاریخ انقضای مجوز:</span>
              <span className="detail-value">
                {new Date(verification.licenseExpiryDate).toLocaleDateString("fa-IR")}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4>اطلاعات مدیرعامل و تماس</h4>
            <div className="detail-row">
              <span className="detail-label">نام مدیرعامل:</span>
              <span className="detail-value">{verification.ceoName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ایمیل شرکت:</span>
              <span className="detail-value">{verification.companyEmail}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تلفن شرکت:</span>
              <span className="detail-value">{verification.companyPhone}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>وضعیت</h4>
            <div className="detail-row">
              <span className="detail-label">وضعیت درخواست:</span>
              <span className={`status-badge-verification ${getStatusBadgeClass(verification.status)}`}>
                {getStatusPersian(verification.status)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">تاریخ ارسال:</span>
              <span className="detail-value">
                {new Date(verification.submittedAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            {verification.reviewedAt && (
              <div className="detail-row">
                <span className="detail-label">تاریخ بررسی:</span>
                <span className="detail-value">
                  {new Date(verification.reviewedAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
            )}
            {verification.rejectionReason && (
              <div className="detail-row">
                <span className="detail-label">دلیل رد:</span>
                <span className="detail-value rejection-text">{verification.rejectionReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailModal;