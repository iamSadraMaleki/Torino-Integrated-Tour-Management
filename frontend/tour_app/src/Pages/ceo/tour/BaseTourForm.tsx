import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { BaseTour, BaseTourCreateRequest } from "../../../Types/baseTour";
import { geoApi } from "../../../Services/geoApi";
import { Province, City } from "../../../Types/geo";

interface BaseTourFormProps {
  initialData?: BaseTour;
  onSubmit: (data: BaseTourCreateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const BaseTourForm: React.FC<BaseTourFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<BaseTourCreateRequest>({
    tourName: "",
    tourCode: "",
    originCityId: 0,
    destinationCityId: 0,
  });

  // داده‌های استان‌ها و شهرها
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // انتخاب‌های کاربر
  const [selectedOriginProvince, setSelectedOriginProvince] = useState<number | null>(null);
  const [selectedDestProvince, setSelectedDestProvince] = useState<number | null>(null);
  
  // شهرهای فیلتر شده بر اساس استان انتخاب شده
  const [originCities, setOriginCities] = useState<City[]>([]);
  const [destCities, setDestCities] = useState<City[]>([]);

  // دریافت استان‌ها
  useEffect(() => {
    fetchProvinces();
  }, []);

  // دریافت شهرهای مبدا بر اساس استان انتخاب شده
  useEffect(() => {
    if (selectedOriginProvince) {
      fetchCities(selectedOriginProvince, setOriginCities);
    } else {
      setOriginCities([]);
    }
  }, [selectedOriginProvince]);

  // دریافت شهرهای مقصد بر اساس استان انتخاب شده
  useEffect(() => {
    if (selectedDestProvince) {
      fetchCities(selectedDestProvince, setDestCities);
    } else {
      setDestCities([]);
    }
  }, [selectedDestProvince]);

  // پر کردن فرم در حالت ویرایش
  useEffect(() => {
    if (initialData) {
      setFormData({
        tourName: initialData.tourName,
        tourCode: initialData.tourCode,
        originCityId: initialData.originCityId,
        destinationCityId: initialData.destinationCityId,
      });
    }
  }, [initialData]);

  const fetchProvinces = async () => {
    try {
      const response = await geoApi.getProvinces();
      if (response.success) {
        setProvinces(response.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchCities = async (provinceId: number, setter: (cities: City[]) => void) => {
    setLoadingCities(true);
    try {
      const response = await geoApi.getCitiesByProvince(provinceId);
      if (response.success) {
        setter(response.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "originCityId" || name === "destinationCityId" ? parseInt(value) : value,
    }));
  };

  const handleOriginProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = parseInt(e.target.value);
    setSelectedOriginProvince(provinceId || null);
    setFormData((prev) => ({ ...prev, originCityId: 0 }));
  };

  const handleDestProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = parseInt(e.target.value);
    setSelectedDestProvince(provinceId || null);
    setFormData((prev) => ({ ...prev, destinationCityId: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="base-tour-form" onSubmit={handleSubmit}>
      <div className="base-tour-form-row">
        <div className="base-tour-form-group">
          <label>نام تور *</label>
          <input
            type="text"
            name="tourName"
            value={formData.tourName}
            onChange={handleChange}
            placeholder="مثال: تور مشهد مقدس"
            required
            disabled={isLoading}
          />
        </div>

        <div className="base-tour-form-group">
          <label>کد تور *</label>
          <input
            type="text"
            name="tourCode"
            value={formData.tourCode}
            onChange={handleChange}
            placeholder="مثال: TOUR-001"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* مبدا */}
      <div className="base-tour-form-row">
        <div className="base-tour-form-group">
          <label>استان مبدا *</label>
          <select
            value={selectedOriginProvince || ""}
            onChange={handleOriginProvinceChange}
            disabled={isLoading}
            required
          >
            <option value="">انتخاب استان مبدا...</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="base-tour-form-group">
          <label>شهر مبدا *</label>
          <select
            name="originCityId"
            value={formData.originCityId || ""}
            onChange={handleChange}
            disabled={isLoading || loadingCities || !selectedOriginProvince}
            required
          >
            <option value="">انتخاب شهر مبدا...</option>
            {originCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {originCities.length === 0 && selectedOriginProvince && !loadingCities && (
            <small>هیچ شهری برای این استان یافت نشد</small>
          )}
        </div>
      </div>

      {/* مقصد */}
      <div className="base-tour-form-row">
        <div className="base-tour-form-group">
          <label>استان مقصد *</label>
          <select
            value={selectedDestProvince || ""}
            onChange={handleDestProvinceChange}
            disabled={isLoading}
            required
          >
            <option value="">انتخاب استان مقصد...</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="base-tour-form-group">
          <label>شهر مقصد *</label>
          <select
            name="destinationCityId"
            value={formData.destinationCityId || ""}
            onChange={handleChange}
            disabled={isLoading || loadingCities || !selectedDestProvince}
            required
          >
            <option value="">انتخاب شهر مقصد...</option>
            {destCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {destCities.length === 0 && selectedDestProvince && !loadingCities && (
            <small>هیچ شهری برای این استان یافت نشد</small>
          )}
        </div>
      </div>

      <div className="base-tour-form-actions">
        <button type="button" className="base-tour-btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="base-tour-btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش تور" : "ثبت تور"}
        </button>
      </div>
    </form>
  );
};

export default BaseTourForm;