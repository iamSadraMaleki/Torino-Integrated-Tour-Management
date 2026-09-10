import React, { useState, useEffect } from "react";
import { UserProfile, UserProfileRequest } from "../../../Types/user";
import "./UserProfileForm.css";

interface UserProfileFormProps {
  initialData?: UserProfile;
  onSubmit: (data: UserProfileRequest) => Promise<void>;
  isLoading: boolean;
  mode: "create" | "edit";
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  mode,
}) => {
  const [formData, setFormData] = useState<UserProfileRequest>({
    fullName: "",
    nationalCode: "",
    birthDate: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        fullName: initialData.fullName || "",
        nationalCode: initialData.nationalCode || "",
        birthDate: initialData.birthDate || "",
        phoneNumber: initialData.phoneNumber || "",
      });
    }
  }, [initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="user-profile-form" onSubmit={handleSubmit}>
      <div className="user-form-group">
        <label>نام و نام خانوادگی</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="نام و نام خانوادگی خود را وارد کنید"
          required
          disabled={isLoading}
        />
      </div>

      <div className="user-form-group">
        <label>کد ملی</label>
        <input
          type="text"
          name="nationalCode"
          value={formData.nationalCode}
          onChange={handleChange}
          placeholder="کد ملی خود را وارد کنید"
          maxLength={10}
          required
          disabled={isLoading}
        />
      </div>

      <div className="user-form-group">
        <label>تاریخ تولد</label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="user-form-group">
        <label>شماره موبایل</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="شماره موبایل خود را وارد کنید"
          required
          disabled={isLoading}
        />
      </div>

      <div className="user-form-actions">
        <button type="submit" className="user-btn-submit" disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : mode === "create" ? "ثبت اطلاعات" : "ویرایش اطلاعات"}
        </button>
      </div>
    </form>
  );
};

export default UserProfileForm;
