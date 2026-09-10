import React, { useState, useEffect } from "react";
import { CeoProfile, CeoProfileRequest } from "../../../Types/ceo";
import "./ProfileForm.css";

interface ProfileFormProps {
  initialData?: CeoProfile;
  onSubmit: (data: CeoProfileRequest) => Promise<void>;
  isLoading: boolean;
  mode: "create" | "edit";
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  mode,
}) => {
  const [formData, setFormData] = useState<CeoProfileRequest>({
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
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-group">
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

      <div className="form-group">
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

      <div className="form-group">
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

      <div className="form-group">
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

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : mode === "create" ? "ثبت اطلاعات" : "ویرایش اطلاعات"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;