import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { VehicleFeature, VehicleFeatureRequest } from "../../../Types/vehicle";

interface VehicleFeatureFormProps {
  initialData?: VehicleFeature;
  onSubmit: (data: VehicleFeatureRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const VehicleFeatureForm: React.FC<VehicleFeatureFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<VehicleFeatureRequest>({
    name: "",
    description: "",
    icon: "🔧",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        icon: initialData.icon || "🔧",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const iconOptions = [
    "🔧", "🚗", "🚌", "🚐", "❄️", "🔥", "📺", "🎵", "🔊", "📡", "💺", "🪟", "🔒", "🚪", "🧭", "⚡", "🛞"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="vehicle-feature-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>نام ویژگی *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="مثال: تهویه مطبوع، صندلی خواب، تلویزیون"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label>آیکون</label>
        <div className="icon-selector">
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="🔧"
            maxLength={2}
            disabled={isLoading}
          />
          <div className="icon-options">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`icon-option ${formData.icon === icon ? "active" : ""}`}
                onClick={() => setFormData((prev) => ({ ...prev, icon }))}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>توضیحات</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="توضیحات مربوط به این ویژگی..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش ویژگی" : "ثبت ویژگی"}
        </button>
      </div>
    </form>
  );
};

export default VehicleFeatureForm;