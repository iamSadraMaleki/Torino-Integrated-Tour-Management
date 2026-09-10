import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { Position, PositionRequest } from "../../../Types/staff";

interface PositionFormProps {
  initialData?: Position;
  onSubmit: (data: PositionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PositionForm: React.FC<PositionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<PositionRequest>({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="position-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>عنوان سمت *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="مثال: مدیر فروش، کارشناس فنی، ..."
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label>توضیحات</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="توضیحات مربوط به این سمت..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش سمت" : "ثبت سمت"}
        </button>
      </div>
    </form>
  );
};

export default PositionForm;