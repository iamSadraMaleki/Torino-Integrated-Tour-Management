import React, { useState, useEffect } from "react";
import { UserProfile as UserProfileType, UserProfileRequest } from "../../../Types/user";
import { userProfileApi } from "../../../Services/userProfileApi";
import UserProfileForm from "./UserProfileForm";
import UserConfirmModal from "./UserConfirmModal";
import "./UserProfile.css";

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      const response = await userProfileApi.getProfile();
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

  const handleCreate = async (data: UserProfileRequest) => {
    setIsLoading(true);
    try {
      const response = await userProfileApi.createProfile(data);
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

  const handleUpdate = async (data: UserProfileRequest) => {
    setIsLoading(true);
    try {
      const response = await userProfileApi.updateProfile(data);
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
      const response = await userProfileApi.deleteProfile();
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
    <div className="user-profile-container">
      {message && (
        <div className={`user-toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="user-profile-header">
        <h2>اطلاعات کاربر</h2>
        {hasProfile && (
          <button
            className="user-btn-delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            🗑️ حذف اطلاعات
          </button>
        )}
      </div>

      <div className="user-profile-card">
        {isFetching ? (
          <div className="user-loading-state">
            <div className="user-spinner"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : hasProfile ? (
          <>
            <div className="user-profile-info">
              <div className="user-info-row">
                <span className="user-info-label">نام و نام خانوادگی:</span>
                <span className="user-info-value">{profile.fullName}</span>
              </div>
              <div className="user-info-row">
                <span className="user-info-label">کد ملی:</span>
                <span className="user-info-value">{profile.nationalCode}</span>
              </div>
              <div className="user-info-row">
                <span className="user-info-label">تاریخ تولد:</span>
                <span className="user-info-value">{profile.birthDate}</span>
              </div>
              <div className="user-info-row">
                <span className="user-info-label">شماره موبایل:</span>
                <span className="user-info-value">{profile.phoneNumber}</span>
              </div>
              <div className="user-info-row">
                <span className="user-info-label">تاریخ ثبت:</span>
                <span className="user-info-value">{new Date(profile.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="user-info-row">
                <span className="user-info-label">آخرین ویرایش:</span>
                <span className="user-info-value">{new Date(profile.updatedAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
            <div className="user-profile-form-wrapper">
              <h3>ویرایش اطلاعات</h3>
              <UserProfileForm
                initialData={profile}
                onSubmit={handleUpdate}
                isLoading={isLoading}
                mode="edit"
              />
            </div>
          </>
        ) : (
          <div className="user-no-data-state">
            <div className="user-no-data-icon">📝</div>
            <h3>اطلاعاتی ثبت نشده است</h3>
            <p>لطفاً اطلاعات کاربری خود را ثبت کنید</p>
            <div className="user-profile-form-wrapper">
              <UserProfileForm
                onSubmit={handleCreate}
                isLoading={isLoading}
                mode="create"
              />
            </div>
          </div>
        )}
      </div>

      <UserConfirmModal
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

export default UserProfile;
