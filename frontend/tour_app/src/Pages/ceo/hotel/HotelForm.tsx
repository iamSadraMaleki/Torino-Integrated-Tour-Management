import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { Hotel, HotelRequest } from "../../../Types/hotel";

interface HotelFormProps {
  initialData?: Hotel;
  onSubmit: (data: HotelRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<HotelRequest>({
    name: "",
    address: "",
    stars: 3,
    city: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        stars: initialData.stars,
        city: initialData.city,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stars" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const starsOptions = [1, 2, 3, 4, 5];

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>نام هتل *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: هتل پارس ائل گلی"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>شهر *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="مثال: تبریز"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>ستاره *</label>
          <select
            name="stars"
            value={formData.stars}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            {starsOptions.map((star) => (
              <option key={star} value={star}>
                {"★".repeat(star)} {star} ستاره
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>آدرس *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="آدرس کامل هتل"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش هتل" : "ثبت هتل"}
        </button>
      </div>
    </form>
  );
};

export default HotelForm;