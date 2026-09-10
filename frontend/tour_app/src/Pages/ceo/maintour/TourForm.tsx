import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { Tour, TourCreateRequest, BaseTourReference } from "../../../Types/tour";

interface TourFormProps {
  initialData?: Tour;
  baseTours: BaseTourReference[];
  onSubmit: (data: TourCreateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TourForm: React.FC<TourFormProps> = ({
  initialData,
  baseTours,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<TourCreateRequest>({
    baseTourId: 0,
    departureDate: "",
    returnDate: "",
    price: 0,
    capacity: 0,
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        baseTourId: initialData.baseTourId,
        departureDate: initialData.departureDate.split("T")[0],
        returnDate: initialData.returnDate.split("T")[0],
        price: initialData.price,
        capacity: initialData.capacity,
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "capacity" || name === "baseTourId" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // بررسی اعتبار تاریخ‌ها
  const minDate = new Date().toISOString().split("T")[0];
  const isReturnDateValid = formData.returnDate && formData.departureDate && formData.returnDate >= formData.departureDate;

  return (
    <form className="tour-form" onSubmit={handleSubmit}>
      <div className="tour-form-row">
        <div className="tour-form-group">
          <label>تور پایه *</label>
          <select
            name="baseTourId"
            value={formData.baseTourId || ""}
            onChange={handleChange}
            required
            disabled={isLoading || !!initialData}
          >
            <option value={0}>انتخاب تور پایه...</option>
            {baseTours.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.tourName} ({bt.tourCode}) - {bt.originCityName} → {bt.destinationCityName}
              </option>
            ))}
          </select>
          {initialData && (
            <small>تغییر تور پایه پس از ایجاد امکان‌پذیر نیست</small>
          )}
        </div>
      </div>

      <div className="tour-form-row">
        <div className="tour-form-group">
          <label>تاریخ حرکت *</label>
          <input
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            min={minDate}
            required
            disabled={isLoading}
          />
        </div>

        <div className="tour-form-group">
          <label>تاریخ بازگشت *</label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            min={formData.departureDate || minDate}
            required
            disabled={isLoading}
            className={!isReturnDateValid && formData.returnDate ? "invalid" : ""}
          />
          {!isReturnDateValid && formData.returnDate && (
            <small className="error-text">تاریخ بازگشت باید بعد از تاریخ حرکت باشد</small>
          )}
        </div>
      </div>

      <div className="tour-form-row">
        <div className="tour-form-group">
          <label>قیمت (تومان) *</label>
          <input
            type="number"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            placeholder="مثال: 2500000"
            min={0}
            required
            disabled={isLoading}
          />
        </div>

        <div className="tour-form-group">
          <label>ظرفیت (نفر) *</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity || ""}
            onChange={handleChange}
            placeholder="مثال: 40"
            min={1}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="tour-form-group">
        <label>توضیحات</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="توضیحات اضافی درباره تور..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="tour-form-actions">
        <button type="button" className="tour-btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button 
          type="submit" 
          className="tour-btn-submit" 
          disabled={isLoading || formData.baseTourId === 0 || !isReturnDateValid}
        >
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش تور" : "ثبت تور"}
        </button>
      </div>
    </form>
  );
};

export default TourForm;