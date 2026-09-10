import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle } from 'react-icons/fa';
import './VerificationStatusCard.css';

interface VerificationStatusCardProps {
  status: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationData?: {
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  } | null;
  onAction?: () => void;  // برای دکمه تکمیل احراز هویت یا ارسال مجدد
}

const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ 
  status, 
  verificationData, 
  onAction 
}) => {
  
  // وضعیت NOT_VERIFIED - هنوز فرم رو پر نکرده (نمایش دکمه)
  if (status === 'NOT_VERIFIED') {
    return (
      <div className="verification-status-card not-verified">
        <div className="status-icon-wrapper">
          <FaInfoCircle className="status-icon" />
        </div>
        <div className="status-content">
          <h3>تکمیل احراز هویت</h3>
          <p>برای استفاده از امکانات کامل پنل مدیر آژانس، لطفاً فرم احراز هویت را تکمیل کنید.</p>
          <button onClick={onAction} className="verification-action-btn">
            تکمیل احراز هویت
          </button>
        </div>
      </div>
    );
  }

  // وضعیت PENDING - در انتظار بررسی (بدون دکمه)
  if (status === 'PENDING') {
    return (
      <div className="verification-status-card pending">
        <div className="status-icon-wrapper">
          <FaClock className="status-icon pending-icon" />
        </div>
        <div className="status-content">
          <h3>در حال بررسی درخواست</h3>
          <p>درخواست احراز هویت شما با موفقیت ثبت شده و در حال بررسی است.</p>
          <div className="verification-details">
            <span>📅 تاریخ ارسال: </span>
            <strong>{verificationData?.submittedAt ? new Date(verificationData.submittedAt).toLocaleDateString('fa-IR') : '-'}</strong>
          </div>
          <div className="verification-note">
            <span>⏳</span>
            <span>پس از تأیید، تمامی امکانات پنل برای شما فعال خواهد شد.</span>
          </div>
        </div>
      </div>
    );
  }

  // وضعیت REJECTED - رد شده (نمایش دکمه ارسال مجدد)
  if (status === 'REJECTED') {
    return (
      <div className="verification-status-card rejected">
        <div className="status-icon-wrapper">
          <FaTimesCircle className="status-icon rejected-icon" />
        </div>
        <div className="status-content">
          <h3>درخواست رد شده</h3>
          <p>متأسفانه درخواست احراز هویت شما رد شده است.</p>
          {verificationData?.rejectionReason && (
            <div className="rejection-reason-box">
              <strong>دلیل رد:</strong>
              <p>{verificationData.rejectionReason}</p>
            </div>
          )}
          <button onClick={onAction} className="verification-action-btn retry">
            ارسال مجدد درخواست
          </button>
        </div>
      </div>
    );
  }

  // وضعیت VERIFIED - تایید شده (فقط اطلاع‌رسانی، بدون دکمه)
  return (
    <div className="verification-status-card verified">
      <div className="status-icon-wrapper">
        <FaCheckCircle className="status-icon verified-icon" />
      </div>
      <div className="status-content">
        <h3>احراز هویت تأیید شد ✓</h3>
        <p>احراز هویت شما با موفقیت تأیید شده است.</p>
        <div className="verification-details">
          <div>📅 تاریخ تأیید: <strong>{verificationData?.reviewedAt ? new Date(verificationData.reviewedAt).toLocaleDateString('fa-IR') : '-'}</strong></div>
        </div>
        <div className="verification-note success">
          <span>🎉</span>
          <span>از همکاری با شما خوشوقتیم!</span>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusCard;