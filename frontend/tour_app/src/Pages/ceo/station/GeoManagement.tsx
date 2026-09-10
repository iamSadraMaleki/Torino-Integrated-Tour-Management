import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaCity, FaSearch, FaArrowLeft } from "react-icons/fa";
import { geoApi } from "../../../Services/geoApi";
import { Province, City } from "../../../Types/geo";
import "./StationManagement.css";

const GeoManagement: React.FC = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const response = await geoApi.getProvinces();
      if (response.success) {
        setProvinces(response.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (provinceId: number) => {
    setLoadingCities(true);
    try {
      const response = await geoApi.getCitiesByProvince(provinceId);
      if (response.success) {
        setCities(response.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province);
    fetchCities(province.id);
  };

  const handleBack = () => {
    setSelectedProvince(null);
    setCities([]);
    setSearchTerm("");
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="station-loading">
        <div className="station-spinner"></div>
        <p>در حال بارگذاری استان‌ها...</p>
      </div>
    );
  }

  return (
    <div className="geo-container">
      <div className="station-header">
        <h2><FaMapMarkerAlt /> مدیریت استان‌ها و شهرها</h2>
      </div>

      {!selectedProvince ? (
        // نمایش لیست استان‌ها
        <div className="provinces-grid">
          {provinces.map((province) => (
            <div
              key={province.id}
              className="province-card"
              onClick={() => handleProvinceClick(province)}
            >
              <div className="province-icon">🗺️</div>
              <div className="province-info">
                <h3>{province.name}</h3>
                <span>{province.citiesCount} شهر</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // نمایش شهرهای استان انتخاب شده
        <div className="cities-section">
          <div className="cities-header">
            <button className="station-btn-back" onClick={handleBack}>
              <FaArrowLeft /> بازگشت به لیست استان‌ها
            </button>
            <h3>شهرهای استان {selectedProvince.name}</h3>
          </div>

          <div className="station-search">
            <FaSearch className="station-search-icon" />
            <input
              type="text"
              placeholder="جستجوی شهر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loadingCities ? (
            <div className="station-loading-small">
              <div className="station-spinner-small"></div>
              <p>در حال بارگذاری شهرها...</p>
            </div>
          ) : (
            <div className="cities-grid">
              {filteredCities.map((city) => (
                <div key={city.id} className="city-card">
                  <div className="city-icon">🏙️</div>
                  <div className="city-info">
                    <h4>{city.name}</h4>
                    {city.latitude && city.longitude && (
                      <span className="city-coords">
                        📍 {city.latitude}, {city.longitude}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredCities.length === 0 && (
                <div className="station-no-data">
                  <FaCity />
                  <p>هیچ شهری یافت نشد</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeoManagement;