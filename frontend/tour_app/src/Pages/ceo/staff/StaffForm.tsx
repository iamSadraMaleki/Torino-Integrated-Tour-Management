import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { StaffMember, StaffMemberRequest, Position } from "../../../Types/staff";

interface StaffFormProps {
  initialData?: StaffMember;
  positions: Position[];
  onSubmit: (data: StaffMemberRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const StaffForm: React.FC<StaffFormProps> = ({
  initialData,
  positions,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<StaffMemberRequest>({
    fullName: "",
    nationalCode: "",
    fatherName: "",
    birthDate: "",
    phoneNumber: "",
    workExperience: 0,
    address: "",
    positionId: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        nationalCode: initialData.nationalCode,
        fatherName: initialData.fatherName,
        birthDate: initialData.birthDate,
        phoneNumber: initialData.phoneNumber,
        workExperience: initialData.workExperience || 0,
        address: initialData.address || "",
        positionId: initialData.position.id,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="staff-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>نام و نام خانوادگی *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="نام کامل کارمند"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>کد ملی *</label>
          <input
            type="text"
            name="nationalCode"
            value={formData.nationalCode}
            onChange={handleChange}
            placeholder="۱۰ رقم"
            maxLength={10}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>نام پدر *</label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="نام پدر"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>تاریخ تولد *</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>شماره موبایل *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="09123456789"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>سمت *</label>
          <select
            name="positionId"
            value={formData.positionId}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value={0}>انتخاب سمت...</option>
            {positions.filter(p => p.isActive).map((position) => (
              <option key={position.id} value={position.id}>
                {position.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>سابقه کار (سال)</label>
          <input
            type="number"
            name="workExperience"
            value={formData.workExperience}
            onChange={handleChange}
            placeholder="مثال: 5"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>تاریخ استخدام</label>
          <input
            type="date"
            name="hireDate"
            value={formData.hireDate || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>آدرس</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="آدرس کامل"
          rows={2}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش کارمند" : "ثبت کارمند"}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;