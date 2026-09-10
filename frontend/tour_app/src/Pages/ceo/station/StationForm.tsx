import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaImage, FaTrash } from "react-icons/fa";
import { Station, Province, City, StationType, StationCreateRequest } from "../../../Types/station";
import { stationApi } from "../../../Services/stationApi";

interface StationFormProps {
  initialData?: Station;
  provinces: Province[];
  cities: City[];
  stationTypes: StationType[];
  selectedProvinceId: number | null;
  onProvinceChange: (provinceId: number) => void;
  onSubmit: (data: StationCreateRequest, imageFile?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const StationForm: React.FC<StationFormProps> = ({
  initialData,
  provinces,
  cities,
  stationTypes,
  selectedProvinceId,
  onProvinceChange,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<StationCreateRequest>({
    provinceId: 0,
    cityId: 0,
    stationTypeId: 0,
    stationName: "",
    location: "",
    imageDescription: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        provinceId: initialData.provinceId,
        cityId: initialData.cityId,
        stationTypeId: initialData.stationTypeId,
        stationName: initialData.stationName,
        location: initialData.location || "",
        imageDescription: "",
      });
      if (initialData.stationImageId) {
        setExistingImage(stationApi.getStationImage(initialData.stationImageId));
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "provinceId" || name === "cityId" || name === "stationTypeId" ? parseInt(value) : value }));
    
    if (name === "provinceId") {
      onProvinceChange(parseInt(value));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, imageFile || undefined);
  };

  return (
    <form className="station-form" onSubmit={handleSubmit}>
      <div className="station-form-row">
        <div className="station-form-group">
          <label>استان *</label>
          <select name="provinceId" value={formData.provinceId} onChange={handleChange} required disabled={isLoading}>
            <option value={0}>انتخاب استان...</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="station-form-group">
          <label>شهر *</label>
          <select name="cityId" value={formData.cityId} onChange={handleChange} required disabled={isLoading || !selectedProvinceId}>
            <option value={0}>انتخاب شهر...</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="station-form-row">
        <div className="station-form-group">
          <label>نوع ایستگاه *</label>
          <select name="stationTypeId" value={formData.stationTypeId} onChange={handleChange} required disabled={isLoading}>
            <option value={0}>انتخاب نوع ایستگاه...</option>
            {stationTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.typeName}</option>
            ))}
          </select>
        </div>

        <div className="station-form-group">
          <label>نام ایستگاه *</label>
          <input
            type="text"
            name="stationName"
            value={formData.stationName}
            onChange={handleChange}
            placeholder="مثال: ترمینال شرق"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="station-form-group">
        <label>آدرس / موقعیت</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="آدرس دقیق ایستگاه"
          disabled={isLoading}
        />
      </div>

      {/* تصویر ایستگاه */}
      <div className="station-form-group">
        <label>تصویر ایستگاه</label>
        <div className="station-image-upload">
          {(imagePreview || existingImage) && (
            <div className="station-image-preview">
              <img src={imagePreview || existingImage || ""} alt="پیش‌نمایش" />
              <button type="button" className="station-image-remove" onClick={handleRemoveImage}>
                <FaTrash /> حذف تصویر
              </button>
            </div>
          )}
          <label className="station-image-label">
            <FaImage /> {imagePreview || existingImage ? "تغییر تصویر" : "انتخاب تصویر"}
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
          <p className="station-image-hint">فرمت‌های مجاز: JPG, PNG, GIF (حداکثر 5MB)</p>
        </div>
      </div>

      <div className="station-form-actions">
        <button type="button" className="station-btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="station-btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش ایستگاه" : "ثبت ایستگاه"}
        </button>
      </div>
    </form>
  );
};

export default StationForm;