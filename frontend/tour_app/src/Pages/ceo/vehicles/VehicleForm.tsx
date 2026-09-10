import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { Vehicle, VehicleRequest, VehicleType, VehicleStatus, VehicleFeature, StaffMemberSimple } from "../../../Types/vehicle";

interface VehicleFormProps {
  initialData?: Vehicle;
  features: VehicleFeature[];
  drivers: StaffMemberSimple[];
  onSubmit: (data: VehicleRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  features = [],
  drivers = [],
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<VehicleRequest>({
    name: "",
    manufacturer: "",
    type: "CAR",
    status: "ACTIVE",
    plateNumber: "",
    color: "",
    rowCount: 0,
    seatCount: 0,
    currentDriverId: null,
    modelYear: new Date().getFullYear(),
    description: "",
    featureIds: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        manufacturer: initialData.manufacturer || "",
        type: initialData.type || "CAR",
        status: initialData.status || "ACTIVE",
        plateNumber: initialData.plateNumber || "",
        color: initialData.color || "",
        rowCount: initialData.rowCount || 0,
        seatCount: initialData.seatCount || 0,
        currentDriverId: initialData.currentDriver?.id || null,
        modelYear: initialData.modelYear || new Date().getFullYear(),
        description: initialData.description || "",
        featureIds: initialData.features?.map((f) => f.id) || [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rowCount" || name === "seatCount" || name === "modelYear" ? parseInt(value) || 0 : value,
    }));
  };

  const handleFeatureToggle = (featureId: number) => {
    setFormData((prev) => ({
      ...prev,
      featureIds: prev.featureIds.includes(featureId)
        ? prev.featureIds.filter((id) => id !== featureId)
        : [...prev.featureIds, featureId],
    }));
  };

  const vehicleTypeOptions: { value: VehicleType; label: string }[] = [
    { value: "BUS", label: "اتوبوس" },
    { value: "MINIBUS", label: "مینی بوس" },
    { value: "CAR", label: "سواری" },
    { value: "VAN", label: "ون" },
    { value: "LUXURY_CAR", label: "سواری لوکس" },
    { value: "TOUR_BUS", label: "اتوبوس توریستی" },
  ];

  const vehicleStatusOptions: { value: VehicleStatus; label: string; color: string }[] = [
    { value: "ACTIVE", label: "فعال", color: "#10b981" },
    { value: "UNDER_REPAIR", label: "در تعمیر", color: "#f59e0b" },
    { value: "INACTIVE", label: "غیرفعال", color: "#ef4444" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // دیباگ: لاگ کردن اطلاعات برای پیدا کردن مشکل
  console.log("VehicleForm - features:", features);
  console.log("VehicleForm - drivers:", drivers);
  console.log("VehicleForm - formData:", formData);

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>نام خودرو *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: اسکانیا K410"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>ساخت (برند) *</label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            placeholder="مثال: اسکانیا، مرسدس، ایران خودرو"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>نوع خودرو *</label>
          <select name="type" value={formData.type} onChange={handleChange} required disabled={isLoading}>
            {vehicleTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>وضعیت *</label>
          <select name="status" value={formData.status} onChange={handleChange} required disabled={isLoading}>
            {vehicleStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>شماره پلاک *</label>
          <input
            type="text"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            placeholder="مثال: 12-345-678"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>رنگ *</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="مثال: سفید، مشکی، نقره‌ای"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>سال ساخت *</label>
          <input
            type="number"
            name="modelYear"
            value={formData.modelYear}
            onChange={handleChange}
            placeholder="مثال: 1402"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>راننده</label>
          <select name="currentDriverId" value={formData.currentDriverId || ""} onChange={handleChange} disabled={isLoading}>
            <option value="">انتخاب راننده (اختیاری)</option>
            {drivers && drivers.length > 0 ? (
              drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.fullName} - {driver.phoneNumber}
                </option>
              ))
            ) : (
              <option disabled>هیچ راننده‌ای ثبت نشده است</option>
            )}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>تعداد ردیف‌ها *</label>
          <input
            type="number"
            name="rowCount"
            value={formData.rowCount}
            onChange={handleChange}
            placeholder="مثال: 10"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>تعداد صندلی‌ها *</label>
          <input
            type="number"
            name="seatCount"
            value={formData.seatCount}
            onChange={handleChange}
            placeholder="مثال: 44"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>توضیحات</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="توضیحات اضافی درباره خودرو..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="form-section">
        <label>ویژگی‌های خودرو</label>
        <div className="features-checkbox-group">
          {features && features.length > 0 ? (
            features.filter(f => f.isActive).map((feature) => (
              <label key={feature.id} className="feature-checkbox">
                <input
                  type="checkbox"
                  checked={formData.featureIds.includes(feature.id)}
                  onChange={() => handleFeatureToggle(feature.id)}
                  disabled={isLoading}
                />
                <span className="feature-icon">{feature.icon || "🔧"}</span>
                <span className="feature-name">{feature.name}</span>
              </label>
            ))
          ) : (
            <p className="no-features-hint">هیچ ویژگی‌ای تعریف نشده است. ابتدا از بخش مدیریت ویژگی‌ها ویژگی اضافه کنید.</p>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش خودرو" : "ثبت خودرو"}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;