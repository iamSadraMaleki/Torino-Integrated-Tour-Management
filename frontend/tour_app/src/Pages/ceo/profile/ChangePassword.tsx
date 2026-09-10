import React, { useState } from "react";
import { FaLock, FaEye, FaEyeSlash, FaSave, FaTimesCircle } from "react-icons/fa";
import { userApi } from "../../../Services/userApi";
import "./ChangePassword.css";

interface ChangePasswordProps {
  onClose?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // پاک کردن خطاها وقتی کاربر تایپ میکنه
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.oldPassword) {
      setError("رمز عبور فعلی را وارد کنید");
      return false;
    }
    if (!formData.newPassword) {
      setError("رمز عبور جدید را وارد کنید");
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError("رمز عبور جدید باید حداقل 6 کاراکتر باشد");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return false;
    }
    if (formData.oldPassword === formData.newPassword) {
      setError("رمز عبور جدید نمی‌تواند با رمز عبور فعلی یکسان باشد");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userApi.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      
      setSuccess("رمز عبور شما با موفقیت تغییر کرد");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // بعد از 3 ثانیه صفحه رو میبنده (اگر onClose وجود داشته باشه)
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error("Change password error:", err);
      setError(err.response?.data?.message || "خطا در تغییر رمز عبور. لطفاً رمز فعلی را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-header">
        <FaLock className="header-icon" />
        <h2>تغییر رمز عبور</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="change-password-form">
        {/* رمز فعلی */}
        <div className="form-group">
          <label>رمز عبور فعلی</label>
          <div className="input-wrapper">
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="رمز عبور فعلی خود را وارد کنید"
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* رمز جدید */}
        <div className="form-group">
          <label>رمز عبور جدید</label>
          <div className="input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="رمز عبور جدید را وارد کنید (حداقل 6 کاراکتر)"
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* تکرار رمز جدید */}
        <div className="form-group">
          <label>تکرار رمز عبور جدید</label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="رمز عبور جدید را مجدداً وارد کنید"
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* پیام خطا */}
        {error && (
          <div className="error-message">
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        {/* پیام موفقیت */}
        {success && (
          <div className="success-message">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* دکمه ارسال */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner-small"></div>
              <span>در حال تغییر رمز...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>تغییر رمز عبور</span>
            </>
          )}
        </button>
      </form>

      <div className="password-hint">
        <p>⚠️ نکات امنیتی:</p>
        <ul>
          <li>رمز عبور باید حداقل 6 کاراکتر باشد</li>
          <li>از ترکیب حروف، اعداد و نمادها استفاده کنید</li>
          <li>رمز عبور خود را با کسی به اشتراک نگذارید</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePassword;