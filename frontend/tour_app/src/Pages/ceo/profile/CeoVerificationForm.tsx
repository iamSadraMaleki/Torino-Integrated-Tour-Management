import React, { useState } from 'react';
import { FaSpinner, FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import api from '../../../Router/api';
import './CeoVerificationForm.css';

interface CeoVerificationFormProps {
  onClose: () => void;
}

const CeoVerificationForm: React.FC<CeoVerificationFormProps> = ({ onClose }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    agencyName: '',
    legalName: '',
    ceoName: '',
    registrationNumber: '',
    licenseExpiryDate: '',
    taxNumber: '',
    establishmentDate: '',
    companyEmail: '',
    companyPhone: ''
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
      await api.post('/api/ceo-verification/submit', formData);
      alert('درخواست احراز هویت با موفقیت ارسال شد!');
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'خطا در ارسال اطلاعات');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="verification-form-container">
      <div className="verification-form-header">
        <MdVerifiedUser className="form-header-icon" />
        <h2>فرم احراز هویت مدیرعامل</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="verification-form-dashboard">
        <div className="form-section">
          <h3>اطلاعات آژانس</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>نام آژانس *</label>
              <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>نام حقوقی *</label>
              <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>شماره ثبت *</label>
              <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>شماره مالیات *</label>
              <input type="text" name="taxNumber" value={formData.taxNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>تاریخ تاسیس *</label>
              <input type="date" name="establishmentDate" value={formData.establishmentDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>تاریخ انقضای مجوز *</label>
              <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>اطلاعات مدیرعامل و تماس</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>نام مدیرعامل *</label>
              <input type="text" name="ceoName" value={formData.ceoName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ایمیل شرکت *</label>
              <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>شماره تلفن شرکت *</label>
              <input type="tel" name="companyPhone" value={formData.companyPhone} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="form-error">
            <FaTimesCircle />
            <span>{submitError}</span>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={submitLoading}>
          {submitLoading ? <><FaSpinner className="spinner" /> در حال ارسال...</> : <><FaPaperPlane /> ارسال درخواست احراز هویت</>}
        </button>
      </form>
    </div>
  );
};

export default CeoVerificationForm;