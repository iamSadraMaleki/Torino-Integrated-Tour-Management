import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaPaperPlane, FaClock } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import api from "../../Router/api";
import "./CeoVerification.css";

interface CeoVerificationProps {
  initialStatus: string;
  initialData?: any;
  onStatusChange: () => void;
}

interface FormData {
  agencyName: string;
  legalName: string;
  ceoName: string;
  registrationNumber: string;
  licenseExpiryDate: string;
  taxNumber: string;
  establishmentDate: string;
  companyEmail: string;
  companyPhone: string;
}

const CeoVerification: React.FC<CeoVerificationProps> = ({ initialStatus, initialData, onStatusChange }) => {
  const [verificationData, setVerificationData] = useState<any>(initialData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState(initialStatus);

  const [formData, setFormData] = useState<FormData>({
    agencyName: "",
    legalName: "",
    ceoName: "",
    registrationNumber: "",
    licenseExpiryDate: "",
    taxNumber: "",
    establishmentDate: "",
    companyEmail: "",
    companyPhone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);

    try {
      const response = await api.post("/api/ceo-verification/submit", formData);
      
      if (response.data.success || response.status === 201) {
        setVerificationStatus("PENDING");
        onStatusChange();
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "خطا در ارسال اطلاعات");
    } finally {
      setSubmitLoading(false);
    }
  };

  // وضعیت PENDING - در انتظار بررسی
  if (verificationStatus === "PENDING") {
    return (
      <div className="verification-container">
        <div className="verification-card pending">
          <div className="verification-icon">
            <FaClock />
          </div>
          <h2>در حال بررسی</h2>
          <p className="pending-message">
            درخواست احراز هویت شما با موفقیت ثبت شده و در حال بررسی است.
          </p>
          <div className="info-box">
            <p>📅 تاریخ ارسال: {verificationData?.submittedAt ? new Date(verificationData.submittedAt).toLocaleDateString("fa-IR") : "-"}</p>
            <p>⏳ وضعیت: در انتظار تایید مدیر</p>
          </div>
          <p className="help-text">
            به محض بررسی، از طریق ایمیل به شما اطلاع‌رسانی خواهد شد.
          </p>
        </div>
      </div>
    );
  }

  // وضعیت REJECTED - رد شده
  if (verificationStatus === "REJECTED") {
    return (
      <div className="verification-container">
        <div className="verification-card rejected">
          <div className="verification-icon">
            <FaTimesCircle />
          </div>
          <h2>درخواست رد شده</h2>
          <p>متأسفانه درخواست احراز هویت شما رد شده است.</p>
          {verificationData?.rejectionReason && (
            <div className="rejection-box">
              <strong>دلیل رد:</strong>
              <p>{verificationData.rejectionReason}</p>
            </div>
          )}
          <button 
            className="retry-button"
            onClick={() => {
              setVerificationStatus("NOT_VERIFIED");
              setFormData({
                agencyName: "",
                legalName: "",
                ceoName: "",
                registrationNumber: "",
                licenseExpiryDate: "",
                taxNumber: "",
                establishmentDate: "",
                companyEmail: "",
                companyPhone: ""
              });
            }}
          >
            ارسال مجدد درخواست
          </button>
        </div>
      </div>
    );
  }

  // وضعیت VERIFIED - نباید اینجا باشه چون قبلاً فیلتر شده
  if (verificationStatus === "VERIFIED") {
    return (
      <div className="verification-container">
        <div className="verification-card success">
          <div className="verification-icon">
            <FaCheckCircle />
          </div>
          <h2>احراز هویت تایید شده ✓</h2>
          <p className="success-message">
            🎉 از همکاری با شما خوشوقتیم!
          </p>
          <p>
            احراز هویت شما با موفقیت تایید شده است. هم اکنون می‌توانید از تمام امکانات سیستم استفاده کنید.
          </p>
        </div>
      </div>
    );
  }

  // وضعیت NOT_VERIFIED - نمایش فرم
  return (
    <div className="verification-container">
      <div className="verification-form-wrapper">
        <div className="form-header">
          <MdVerifiedUser className="form-header-icon" />
          <h1>احراز هویت مدیرعامل</h1>
          <p>برای تکمیل فرآیند احراز هویت، اطلاعات زیر را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-section">
            <h3>اطلاعات آژانس</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>نام آژانس *</label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  placeholder="نام آژانس را وارد کنید"
                  required
                />
              </div>

              <div className="form-group">
                <label>نام حقوقی *</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  placeholder="نام حقوقی شرکت"
                  required
                />
              </div>

              <div className="form-group">
                <label>شماره ثبت *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="شماره ثبت شرکت"
                  required
                />
              </div>

              <div className="form-group">
                <label>شماره مالیات *</label>
                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleChange}
                  placeholder="شماره مالیات"
                  required
                />
              </div>

              <div className="form-group">
                <label>تاریخ تاسیس *</label>
                <input
                  type="date"
                  name="establishmentDate"
                  value={formData.establishmentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>تاریخ انقضای مجوز *</label>
                <input
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>اطلاعات مدیرعامل و تماس</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>نام مدیرعامل *</label>
                <input
                  type="text"
                  name="ceoName"
                  value={formData.ceoName}
                  onChange={handleChange}
                  placeholder="نام کامل مدیرعامل"
                  required
                />
              </div>

              <div className="form-group">
                <label>ایمیل شرکت *</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="example@company.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>شماره تلفن شرکت *</label>
                <input
                  type="tel"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  placeholder="02112345678"
                  required
                />
              </div>
            </div>
          </div>

          {submitError && (
            <div className="form-error">
              <FaTimesCircle />
              <span>{submitError}</span>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={submitLoading}>
            {submitLoading ? (
              <>
                <FaSpinner className="spinner-icon" />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>ارسال درخواست احراز هویت</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CeoVerification;