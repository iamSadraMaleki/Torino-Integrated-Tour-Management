import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { SeatArrangement, SeatArrangementRequest, SeatArrangementPattern, SEAT_ARRANGEMENT_PATTERNS } from "../../../Types/seat";

interface SeatArrangementFormProps {
  initialData?: SeatArrangement;
  onSubmit: (data: SeatArrangementRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const SeatArrangementForm: React.FC<SeatArrangementFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<SeatArrangementRequest>({
    pattern: "LEFT_TO_RIGHT",
    name: "",
    description: "",
    isDefault: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        pattern: initialData.pattern,
        name: initialData.name,
        description: initialData.description || "",
        isDefault: initialData.isDefault,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="arrangement-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>نام الگو *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="مثال: الگوی استاندارد"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label>نوع الگو *</label>
        <select name="pattern" value={formData.pattern} onChange={handleChange} required disabled={isLoading}>
          {Object.entries(SEAT_ARRANGEMENT_PATTERNS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>توضیحات</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="توضیحات درباره این الگو..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>تنظیم به عنوان الگوی پیش‌فرض</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش الگو" : "ثبت الگو"}
        </button>
      </div>
    </form>
  );
};

export default SeatArrangementForm;