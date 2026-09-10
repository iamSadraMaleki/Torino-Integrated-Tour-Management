import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from "react-icons/fa";
import { Hotel, HotelRequest } from "../../../Types/hotel";
import { hotelApi } from "../../../Services/hotelApi";
import HotelForm from "./HotelForm";
import HotelDetailModal from "./HotelDetailModal";
import ConfirmModal from "../../ceo/profile/ConfirmModal";

interface HotelsListProps {
  onHotelChange?: () => void;
}

const HotelsList: React.FC<HotelsListProps> = ({ onHotelChange }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState<string>("all");

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await hotelApi.getAllHotels();
      setHotels(data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست هتل‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCities = () => {
    const cities = hotels.map((h) => h.city);
    return ["all", ...new Set(cities)];
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hotel.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === "all" || hotel.city === filterCity;
    return matchesSearch && matchesCity;
  });

  const handleCreate = async (data: HotelRequest) => {
    setIsSubmitting(true);
    try {
      const newHotel = await hotelApi.createHotel(data);
      setHotels([newHotel, ...hotels]);
      setMessage({ type: "success", text: "هتل با موفقیت ثبت شد" });
      setShowForm(false);
      if (onHotelChange) onHotelChange();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت هتل" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: HotelRequest) => {
    if (!editingHotel) return;
    setIsSubmitting(true);
    try {
      const updatedHotel = await hotelApi.updateHotel(editingHotel.id, data);
      setHotels(hotels.map((h) => (h.id === updatedHotel.id ? updatedHotel : h)));
      setMessage({ type: "success", text: "هتل با موفقیت ویرایش شد" });
      setShowForm(false);
      setEditingHotel(null);
      if (onHotelChange) onHotelChange();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش هتل" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await hotelApi.deleteHotel(deletingId);
      setHotels(hotels.filter((h) => h.id !== deletingId));
      setMessage({ type: "success", text: "هتل با موفقیت حذف شد" });
      if (onHotelChange) onHotelChange();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف هتل" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const renderStars = (stars: number) => {
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="hotels-list-section">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-header-actions">
        <h3>لیست هتل‌ها</h3>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="جستجوی هتل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            {getUniqueCities().map((city) => (
              <option key={city} value={city}>
                {city === "all" ? "همه شهرها" : city}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <FaPlus /> افزودن هتل جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal form-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingHotel ? "ویرایش هتل" : "ثبت هتل جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <HotelForm
              initialData={editingHotel || undefined}
              onSubmit={editingHotel ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingHotel(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="hotels-table-wrapper">
        <table className="hotels-table">
          <thead>
            <tr>
              <th>نام هتل</th>
              <th>شهر</th>
              <th>ستاره</th>
              <th>آدرس</th>
              <th>تاریخ ثبت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.name}</td>
                <td>{hotel.city}</td>
                <td className="stars-cell">{renderStars(hotel.stars)}</td>
                <td>{hotel.address}</td>
                <td>{new Date(hotel.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn view"
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setShowDetailModal(true);
                    }}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingHotel(hotel);
                      setShowForm(true);
                    }}
                    title="ویرایش"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => {
                      setDeletingId(hotel.id);
                      setShowDeleteModal(true);
                    }}
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHotels.length === 0 && (
          <div className="empty-state">
            <p>هیچ هتلی ثبت نشده است</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن هتل جدید
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف هتل"
        message="آیا از حذف این هتل اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      {showDetailModal && selectedHotel && (
        <HotelDetailModal
          hotel={selectedHotel}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default HotelsList;