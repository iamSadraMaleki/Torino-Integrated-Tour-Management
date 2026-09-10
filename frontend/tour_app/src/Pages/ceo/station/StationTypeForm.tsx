import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { StationType, StationTypeCreateRequest } from "../../../Types/geo";

interface StationTypeFormProps {
  initialData?: StationType;
  onSubmit: (data: StationTypeCreateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const StationTypeForm: React.FC<StationTypeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<StationTypeCreateRequest>({
    typeName: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        typeName: initialData.typeName,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="station-type-form" onSubmit={handleSubmit}>
      <div className="station-form-group">
        <label>نام نوع ایستگاه *</label>
        <input
          type="text"
          name="typeName"
          value={formData.typeName}
          onChange={handleChange}
          placeholder="مثال: ترمینال، ایستگاه راه‌آهن، فرودگاه، ایستگاه مترو"
          required
          disabled={isLoading}
        />
      </div>

      <div className="station-form-actions">
        <button type="button" className="station-btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="station-btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش" : "ثبت"}
        </button>
      </div>
    </form>
  );
};

export default StationTypeForm;