import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaRoute } from "react-icons/fa";
import { baseTourApi, stationApiForTour } from "../../../Services/baseTourApi";
import { geoApi } from "../../../Services/geoApi";
import { BaseTour, BaseTourDetails, Station } from "../../../Types/baseTour";
import { City, Province } from "../../../Types/geo";
import BaseTourForm from "./BaseTourForm";
import BaseTourDetailModal from "../tour/BaseTourDetailModal";
import TourStationsManager from "./TourStationsManager";
import ConfirmModal from "../profile/ConfirmModal";
import "./BaseTourManagement.css";

const BaseToursManagement: React.FC = () => {
  const [tours, setTours] = useState<BaseTour[]>([]);
  const [filteredTours, setFilteredTours] = useState<BaseTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState<BaseTour | null>(null);
  const [selectedTour, setSelectedTour] = useState<BaseTourDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStationsManager, setShowStationsManager] = useState(false);
  const [stationsManagerType, setStationsManagerType] = useState<"origins" | "destinations" | "program">("origins");
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // داده‌های کمکی
  const [stations, setStations] = useState<Station[]>([]);
  const [citiesMap, setCitiesMap] = useState<Map<number, City>>(new Map()); // ✅ مپ شهرها برای جستجوی سریع
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterTours();
  }, [searchTerm, tours]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [toursRes, stationsRes] = await Promise.all([
        baseTourApi.getMyTours(),
        stationApiForTour.getMyStations(),
      ]);
      
      if (toursRes.success) setTours(toursRes.data);
      setStations(stationsRes);
      
      // ✅ دریافت همه شهرها برای نمایش اسم شهر
      await fetchAllCities();
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ دریافت همه شهرها از همه استان‌ها
  const fetchAllCities = async () => {
    setLoadingCities(true);
    try {
      // دریافت استان‌ها
      const provincesRes = await geoApi.getProvinces();
      if (!provincesRes.success) return;
      
      const provinces: Province[] = provincesRes.data;
      const allCities: City[] = [];
      
      // دریافت شهرهای هر استان
      for (const province of provinces) {
        const citiesRes = await geoApi.getCitiesByProvince(province.id);
        if (citiesRes.success) {
          allCities.push(...citiesRes.data);
        }
      }
      
      // ساخت مپ برای جستجوی سریع
      const map = new Map<number, City>();
      allCities.forEach(city => {
        map.set(city.id, city);
      });
      setCitiesMap(map);
      
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // ✅ تابع کمکی برای گرفتن اسم شهر از روی ID
  const getCityName = (cityId: number): string => {
    const city = citiesMap.get(cityId);
    return city ? city.name : `کد ${cityId}`;
  };

  // ✅ تابع کمکی برای گرفتن اسم استان از روی شهر ID
  const getProvinceName = (cityId: number): string => {
    const city = citiesMap.get(cityId);
    return city ? city.provinceName : "";
  };

  const filterTours = () => {
    if (!searchTerm) {
      setFilteredTours(tours);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    setFilteredTours(
      tours.filter(
        (t) =>
          t.tourName.toLowerCase().includes(lowerSearch) ||
          t.tourCode.toLowerCase().includes(lowerSearch) ||
          getCityName(t.originCityId).toLowerCase().includes(lowerSearch) ||
          getCityName(t.destinationCityId).toLowerCase().includes(lowerSearch)
      )
    );
  };

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await baseTourApi.createBaseTour(data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchAllData();
        setShowForm(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت تور" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingTour) return;
    setIsSubmitting(true);
    try {
      const response = await baseTourApi.updateBaseTour(editingTour.id, data);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchAllData();
        setShowForm(false);
        setEditingTour(null);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش تور" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await baseTourApi.deleteBaseTour(deletingId);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchAllData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف تور" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleViewDetails = async (tourId: number) => {
    try {
      const response = await baseTourApi.getTourDetails(tourId);
      if (response.success) {
        setSelectedTour(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
      setMessage({ type: "error", text: "خطا در دریافت جزئیات تور" });
    }
  };

  const openStationsManager = (tourId: number, type: "origins" | "destinations" | "program") => {
    setSelectedTourId(tourId);
    setStationsManagerType(type);
    setShowStationsManager(true);
  };

  if (loading || loadingCities) {
    return (
      <div className="base-tour-loading">
        <div className="base-tour-spinner"></div>
        <p>در حال بارگذاری تورها...</p>
      </div>
    );
  }

  return (
    <div className="base-tours-container">
      {message && (
        <div className={`base-tour-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="base-tour-header">
        <h2><FaRoute /> مدیریت تورهای پایه</h2>
        <button className="base-tour-btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن تور جدید
        </button>
      </div>

      <div className="base-tour-search">
        <FaSearch className="base-tour-search-icon" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام تور، کد تور، شهر مبدا یا شهر مقصد..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="base-tour-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="base-tour-modal base-tour-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="base-tour-modal-header">
              <h3>{editingTour ? "ویرایش تور" : "افزودن تور جدید"}</h3>
              <button className="base-tour-modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <BaseTourForm
              initialData={editingTour || undefined}
              onSubmit={editingTour ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingTour(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {showStationsManager && selectedTourId && (
        <div className="base-tour-modal-overlay" onClick={() => setShowStationsManager(false)}>
          <div className="base-tour-modal base-tour-modal-xlarge" onClick={(e) => e.stopPropagation()}>
            <div className="base-tour-modal-header">
              <h3>
                مدیریت {stationsManagerType === "origins" ? "مبداها" : stationsManagerType === "destinations" ? "مقصدها" : "برنامه"} تور
              </h3>
              <button className="base-tour-modal-close" onClick={() => setShowStationsManager(false)}>
                ✕
              </button>
            </div>
            <TourStationsManager
              tourId={selectedTourId}
              type={stationsManagerType}
              stations={stations}
              onSave={() => {
                setShowStationsManager(false);
                fetchAllData();
              }}
              onCancel={() => setShowStationsManager(false)}
            />
          </div>
        </div>
      )}

      {filteredTours.length === 0 ? (
        <div className="base-tour-no-data">
          <FaRoute />
          <p>هیچ توری ثبت نشده است</p>
          <button className="base-tour-btn-add" onClick={() => setShowForm(true)}>
            افزودن تور جدید
          </button>
        </div>
      ) : (
        <div className="base-tours-grid">
          {filteredTours.map((tour) => (
            <div key={tour.id} className="base-tour-card">
              <div className="base-tour-card-header">
                <div className="base-tour-code">{tour.tourCode}</div>
                <div className="base-tour-card-actions">
                  <button className="base-tour-btn-view" onClick={() => handleViewDetails(tour.id)}>
                    <FaEye />
                  </button>
                  <button className="base-tour-btn-edit" onClick={() => {
                    setEditingTour(tour);
                    setShowForm(true);
                  }}>
                    <FaEdit />
                  </button>
                  <button className="base-tour-btn-delete" onClick={() => {
                    setDeletingId(tour.id);
                    setShowDeleteModal(true);
                  }}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="base-tour-card-body">
                <h3>{tour.tourName}</h3>
                <div className="base-tour-route">
                  <div className="base-tour-route-stop origin" title={getProvinceName(tour.originCityId)}>
                    <span className="route-stop-icon">📍</span>
                    <span className="route-stop-info">
                      <span className="route-stop-name">{getCityName(tour.originCityId)}</span>
                      {getProvinceName(tour.originCityId) && (
                        <small className="route-stop-province">{getProvinceName(tour.originCityId)}</small>
                      )}
                    </span>
                  </div>
                  <div className="base-tour-route-arrow">
                    <span className="route-arrow-line" />
                    <span className="route-arrow-icon">✈️</span>
                  </div>
                  <div className="base-tour-route-stop destination" title={getProvinceName(tour.destinationCityId)}>
                    <span className="route-stop-icon">🎯</span>
                    <span className="route-stop-info">
                      <span className="route-stop-name">{getCityName(tour.destinationCityId)}</span>
                      {getProvinceName(tour.destinationCityId) && (
                        <small className="route-stop-province">{getProvinceName(tour.destinationCityId)}</small>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="base-tour-card-footer">
                <div className="base-tour-station-actions">
                  <button className="btn-station station-origin" onClick={() => openStationsManager(tour.id, "origins")}>
                    📍 مبداها
                  </button>
                  <button className="btn-station station-dest" onClick={() => openStationsManager(tour.id, "destinations")}>
                    🎯 مقصدها
                  </button>
                  <button className="btn-station station-program" onClick={() => openStationsManager(tour.id, "program")}>
                    📅 برنامه
                  </button>
                </div>
                <span className="base-tour-created">📅 {new Date(tour.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف تور"
        message="آیا از حذف این تور اطمینان دارید؟ تمام اطلاعات مرتبط با ایستگاه‌ها نیز حذف خواهد شد."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      {showDetailModal && selectedTour && (
        <BaseTourDetailModal
          tourDetails={selectedTour}
          onClose={() => setShowDetailModal(false)}
          onEditStations={(type) => {
            setShowDetailModal(false);
            setSelectedTourId(selectedTour.tour.id);
            setStationsManagerType(type);
            setShowStationsManager(true);
          }}
        />
      )}
    </div>
  );
};

export default BaseToursManagement;