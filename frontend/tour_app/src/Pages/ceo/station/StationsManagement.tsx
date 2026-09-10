import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaMapMarkerAlt, FaBuilding, FaImage } from "react-icons/fa";
import { stationApi, geoApi, stationTypeApi } from "../../../Services/stationApi";
import { Station, Province, City, StationType } from "../../../Types/station";
import StationForm from "./StationForm";
import StationDetailModal from "./StationDetailModal";
import ConfirmModal from "../profile/ConfirmModal";
import "./StationManagement.css";

const StationsManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // داده‌های کمکی برای فرم
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [stationTypes, setStationTypes] = useState<StationType[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterStations();
  }, [searchTerm, stations]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [stationsRes, provincesRes, typesRes] = await Promise.all([
        stationApi.getMyStations(),
        geoApi.getProvinces(),
        stationTypeApi.getAllStationTypes(),
      ]);
      if (stationsRes.success) setStations(stationsRes.data);
      setProvinces(provincesRes);
      setStationTypes(typesRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (provinceId: number) => {
    try {
      const citiesRes = await geoApi.getCitiesByProvince(provinceId);
      setCities(citiesRes);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const filterStations = () => {
    if (!searchTerm) {
      setFilteredStations(stations);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    setFilteredStations(
      stations.filter(
        (s) =>
          s.stationName.toLowerCase().includes(lowerSearch) ||
          s.provinceName.toLowerCase().includes(lowerSearch) ||
          s.cityName.toLowerCase().includes(lowerSearch) ||
          s.stationTypeName.toLowerCase().includes(lowerSearch)
      )
    );
  };

  const handleCreate = async (data: any, imageFile?: File) => {
    setIsSubmitting(true);
    try {
      const response = await stationApi.createStation(data, imageFile);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchAllData();
        setShowForm(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت ایستگاه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any, imageFile?: File) => {
    if (!editingStation) return;
    setIsSubmitting(true);
    try {
      const response = await stationApi.updateStation(editingStation.id, data, imageFile);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchAllData();
        setShowForm(false);
        setEditingStation(null);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش ایستگاه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await stationApi.deleteStation(deletingId);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        fetchAllData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف ایستگاه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="station-loading">
        <div className="station-spinner"></div>
        <p>در حال بارگذاری ایستگاه‌ها...</p>
      </div>
    );
  }

  return (
    <div className="stations-container">
      {message && (
        <div className={`station-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="station-header">
        <h2><FaMapMarkerAlt /> مدیریت ایستگاه‌ها</h2>
        <button className="station-btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن ایستگاه جدید
        </button>
      </div>

      <div className="station-search">
        <FaSearch className="station-search-icon" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام ایستگاه، استان، شهر یا نوع ایستگاه..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="station-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="station-modal station-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="station-modal-header">
              <h3>{editingStation ? "ویرایش ایستگاه" : "افزودن ایستگاه جدید"}</h3>
              <button className="station-modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <StationForm
              initialData={editingStation || undefined}
              provinces={provinces}
              cities={cities}
              stationTypes={stationTypes}
              selectedProvinceId={selectedProvinceId}
              onProvinceChange={(provinceId) => {
                setSelectedProvinceId(provinceId);
                fetchCities(provinceId);
              }}
              onSubmit={editingStation ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingStation(null);
                setSelectedProvinceId(null);
                setCities([]);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {filteredStations.length === 0 ? (
        <div className="station-no-data">
          <FaMapMarkerAlt />
          <p>هیچ ایستگاهی ثبت نشده است</p>
          <button className="station-btn-add" onClick={() => setShowForm(true)}>
            افزودن ایستگاه جدید
          </button>
        </div>
      ) : (
        <div className="stations-grid">
          {filteredStations.map((station) => (
            <div key={station.id} className="station-card">
              <div className="station-card-header">
                <div className="station-type-badge">{station.stationTypeName}</div>
                <div className="station-card-actions">
                  <button className="station-btn-view" onClick={() => {
                    setSelectedStation(station);
                    setShowDetailModal(true);
                  }}>
                    <FaEye />
                  </button>
                  <button className="station-btn-edit" onClick={() => {
                    setEditingStation(station);
                    setSelectedProvinceId(station.provinceId);
                    fetchCities(station.provinceId);
                    setShowForm(true);
                  }}>
                    <FaEdit />
                  </button>
                  <button className="station-btn-delete" onClick={() => {
                    setDeletingId(station.id);
                    setShowDeleteModal(true);
                  }}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="station-card-body">
                <h3>{station.stationName}</h3>
                <div className="station-location">
                  <span>📍 {station.provinceName} / {station.cityName}</span>
                </div>
                {station.location && (
                  <div className="station-address">
                    <span>📌 {station.location}</span>
                  </div>
                )}
              </div>
              <div className="station-card-footer">
                <span>📅 {new Date(station.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف ایستگاه"
        message="آیا از حذف این ایستگاه اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      {showDetailModal && selectedStation && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default StationsManagement;