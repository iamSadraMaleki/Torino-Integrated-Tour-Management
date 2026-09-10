import React, { useState, useEffect } from "react";
import { CeoProfile as CeoProfileType, CeoProfileRequest } from "../../../Types/ceo";
import { ceoProfileApi } from "../../../Services/ceoApi";
import ProfileForm from "../../../Pages/ceo/profile/ProfileForm";
import ConfirmModal from "../profile/ConfirmModal";
import "./CeoProfile.css";

const CeoProfile: React.FC = () => {
  const [profile, setProfile] = useState<CeoProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      const response = await ceoProfileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error: any) {
      // اگر 404 باشه یعنی پروفایلی وجود نداره
      if (error.response?.status !== 404) {
        setMessage({ type: "error", text: "خطا در دریافت اطلاعات" });
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCreate = async (data: CeoProfileRequest) => {
    setIsLoading(true);
    try {
      const response = await ceoProfileApi.createProfile(data);
      if (response.success) {
        setProfile(response.data);
        setMessage({ type: "success", text: response.message });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت اطلاعات" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: CeoProfileRequest) => {
    setIsLoading(true);
    try {
      const response = await ceoProfileApi.updateProfile(data);
      if (response.success) {
        setProfile(response.data);
        setMessage({ type: "success", text: response.message });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش اطلاعات" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await ceoProfileApi.deleteProfile();
      if (response.success) {
        setProfile(null);
        setMessage({ type: "success", text: response.message });
        setTimeout(() => setMessage(null), 3000);
        setShowDeleteModal(false);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف اطلاعات" });
    } finally {
      setIsLoading(false);
    }
  };

  const hasProfile = !!profile;

  return (
    <div className="ceo-profile-container">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-header">
        <h2>اطلاعات کاربر</h2>
        {hasProfile && (
          <button
            className="btn-delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            🗑️ حذف اطلاعات
          </button>
        )}
      </div>

      <div className="profile-card">
        {isFetching ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : hasProfile ? (
          <>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">نام و نام خانوادگی:</span>
                <span className="info-value">{profile.fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">کد ملی:</span>
                <span className="info-value">{profile.nationalCode}</span>
              </div>
              <div className="info-row">
                <span className="info-label">تاریخ تولد:</span>
                <span className="info-value">{profile.birthDate}</span>
              </div>
              <div className="info-row">
                <span className="info-label">شماره موبایل:</span>
                <span className="info-value">{profile.phoneNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">تاریخ ثبت:</span>
                <span className="info-value">{new Date(profile.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="info-row">
                <span className="info-label">آخرین ویرایش:</span>
                <span className="info-value">{new Date(profile.updatedAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
            <div className="profile-form-wrapper">
              <h3>ویرایش اطلاعات</h3>
              <ProfileForm
                initialData={profile}
                onSubmit={handleUpdate}
                isLoading={isLoading}
                mode="edit"
              />
            </div>
          </>
        ) : (
          <div className="no-data-state">
            <div className="no-data-icon">📝</div>
            <h3>اطلاعاتی ثبت نشده است</h3>
            <p>لطفاً اطلاعات کاربری خود را ثبت کنید</p>
            <div className="profile-form-wrapper">
              <ProfileForm
                onSubmit={handleCreate}
                isLoading={isLoading}
                mode="create"
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف اطلاعات کاربر"
        message="آیا از حذف اطلاعات کاربری خود اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CeoProfile;