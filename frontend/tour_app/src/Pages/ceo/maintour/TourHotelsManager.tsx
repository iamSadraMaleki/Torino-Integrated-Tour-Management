import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaHotel, FaSync, FaSave } from "react-icons/fa";
import { tourHotelApi, baseHotelApi } from "../../../Services/tourHotelApi";
import { TourHotel, BaseHotel, TourHotelRequest, TourHotelUpdateRequest } from "../../../Types/tourHotel";
import ConfirmModal from "../profile/ConfirmModal";
import "./TourHotelsManager.css";

interface TourHotelsManagerProps {
  tourId: number;
  tourName: string;
  onClose: () => void;
  onRefresh: () => void;
}

const TourHotelsManager: React.FC<TourHotelsManagerProps> = ({
  tourId,
  tourName,
  onClose,
  onRefresh,
}) => {
  const [tourHotels, setTourHotels] = useState<TourHotel[]>([]);
  const [availableHotels, setAvailableHotels] = useState<BaseHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<TourHotel | null>(null);
  const [formData, setFormData] = useState({
    baseHotelId: 0,
    nightCount: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingHotel, setDeletingHotel] = useState<TourHotel | null>(null);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, availableRes] = await Promise.all([
        tourHotelApi.getHotelsByTourId(tourId),
        baseHotelApi.getAllHotels(),
      ]);
      setTourHotels(hotelsRes);
      setAvailableHotels(availableRes);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات هتل‌ها" });
    } finally {
      setLoading(false);
    }
  };

  // گرفتن هتل‌هایی که هنوز به تور اضافه نشدن
  const getUnassignedHotels = () => {
    const assignedIds = tourHotels.map(h => h.baseHotelId);
    return availableHotels.filter(h => !assignedIds.includes(h.id));
  };

  const unassignedHotels = getUnassignedHotels();

  const handleAdd = async () => {
    if (!formData.baseHotelId) {
      setMessage({ type: "error", text: "لطفاً هتل را انتخاب کنید" });
      return;
    }
    if (formData.nightCount < 1) {
      setMessage({ type: "error", text: "تعداد شب اقامت باید حداقل 1 باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: TourHotelRequest = {
        tourId: tourId,
        baseHotelId: formData.baseHotelId,
        nightCount: formData.nightCount,
      };
      await tourHotelApi.addHotelToTour(request);
      setMessage({ type: "success", text: "هتل با موفقیت به تور اضافه شد" });
      setFormData({ baseHotelId: 0, nightCount: 1 });
      setShowAddForm(false);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در افزودن هتل" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingHotel) return;
    if (formData.nightCount < 1) {
      setMessage({ type: "error", text: "تعداد شب اقامت باید حداقل 1 باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: TourHotelUpdateRequest = {
        nightCount: formData.nightCount,
      };
      await tourHotelApi.updateTourHotel(editingHotel.id, request);
      setMessage({ type: "success", text: "هتل با موفقیت ویرایش شد" });
      setEditingHotel(null);
      setFormData({ baseHotelId: 0, nightCount: 1 });
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش هتل" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deletingHotel) return;

    setIsSubmitting(true);
    try {
      await tourHotelApi.removeHotelFromTour(deletingHotel.id);
      setMessage({ type: "success", text: "هتل با موفقیت از تور حذف شد" });
      setShowDeleteModal(false);
      setDeletingHotel(null);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف هتل" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (hotel: TourHotel) => {
    setEditingHotel(hotel);
    setFormData({
      baseHotelId: hotel.baseHotelId,
      nightCount: hotel.nightCount,
    });
  };

  const cancelEdit = () => {
    setEditingHotel(null);
    setFormData({ baseHotelId: 0, nightCount: 1 });
  };

  const renderStars = (stars: number) => {
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  if (loading) {
    return (
      <div className="tour-modal-overlay" onClick={onClose}>
        <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="tour-loading">
            <div className="tour-spinner-small"></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-modal-overlay" onClick={onClose}>
      <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3><FaHotel /> مدیریت هتل‌های تور - {tourName}</h3>
          <button className="tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tour-modal-body">
          {message && (
            <div className={`tour-toast ${message.type}`} style={{ position: "relative", top: 0, marginBottom: "1rem" }}>
              {message.text}
            </div>
          )}

          {/* دکمه افزودن هتل */}
          <div className="tour-hotels-add-btn">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add-hotel"
              disabled={unassignedHotels.length === 0}
            >
              <FaPlus /> افزودن هتل به تور
            </button>
            {unassignedHotels.length === 0 && availableHotels.length > 0 && (
              <span className="no-hotel-warning">همه هتل‌ها به این تور اضافه شده‌اند</span>
            )}
          </div>

          {/* فرم افزودن هتل */}
          {showAddForm && (
            <div className="tour-add-hotel-form">
              <div className="form-row">
                <div className="form-group">
                  <label>انتخاب هتل</label>
                  <select
                    value={formData.baseHotelId}
                    onChange={(e) => setFormData({ ...formData, baseHotelId: parseInt(e.target.value) })}
                    disabled={isSubmitting}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {unassignedHotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} - {hotel.city} ({renderStars(hotel.stars)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>تعداد شب اقامت</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nightCount}
                    onChange={(e) => setFormData({ ...formData, nightCount: parseInt(e.target.value) || 1 })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleAdd} className="btn-submit-sm" disabled={!formData.baseHotelId || isSubmitting}>
                    {isSubmitting ? "در حال افزودن..." : "افزودن"}
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* فرم ویرایش هتل */}
          {editingHotel && (
            <div className="tour-edit-hotel-form">
              <div className="form-header">
                <h4>ویرایش هتل: {editingHotel.hotelName}</h4>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>تعداد شب اقامت</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nightCount}
                    onChange={(e) => setFormData({ ...formData, nightCount: parseInt(e.target.value) || 1 })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleUpdate} className="btn-submit-sm" disabled={isSubmitting}>
                    <FaSave /> {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
                  </button>
                  <button onClick={cancelEdit} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* لیست هتل‌های تور */}
          <div className="tour-hotels-list">
            <h4>هتل‌های تخصیص داده شده به تور</h4>
            {tourHotels.length === 0 ? (
              <div className="no-hotels">
                <FaHotel />
                <p>هیچ هتلی به این تور اضافه نشده است</p>
              </div>
            ) : (
              <div className="hotels-list">
                {tourHotels.map(hotel => (
                  <div key={hotel.id} className="hotel-item">
                    <div className="hotel-icon">🏨</div>
                    <div className="hotel-info">
                      <div className="hotel-name">{hotel.hotelName}</div>
                      <div className="hotel-details">
                        <span>📍 {hotel.hotelCity}</span>
                        <span>⭐ {renderStars(hotel.hotelStars)}</span>
                        <span>🌙 {hotel.nightCount} شب</span>
                      </div>
                    </div>
                    <div className="hotel-actions">
                      <button
                        className="btn-edit-hotel"
                        onClick={() => startEdit(hotel)}
                        title="ویرایش تعداد شب"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-remove-hotel"
                        onClick={() => {
                          setDeletingHotel(hotel);
                          setShowDeleteModal(true);
                        }}
                        title="حذف از تور"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>بستن</button>
          <button className="tour-btn-refresh" onClick={fetchData}>
            <FaSync /> بروزرسانی
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف هتل از تور"
        message={`آیا از حذف هتل "${deletingHotel?.hotelName}" از این تور اطمینان دارید؟`}
        onConfirm={handleRemove}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingHotel(null);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TourHotelsManager;