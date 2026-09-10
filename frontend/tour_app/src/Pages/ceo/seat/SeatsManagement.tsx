import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChair, FaCar } from "react-icons/fa";
import { vehicleApi } from "../../../Services/vehicleApi";
import "./SeatsManagement.css";

interface Vehicle {
  id: number;
  name: string;
  plateNumber: string;
  manufacturer: string;
  color: string;
  seatCount?: number;
}

const SeatsManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [searchTerm, vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleApi.getAllVehicles();
      if (response.success) {
        setVehicles(response.data);
        setFilteredVehicles(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    if (!searchTerm) {
      setFilteredVehicles(vehicles);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    setFilteredVehicles(
      vehicles.filter(
        (v) =>
          v.name.toLowerCase().includes(lowerSearch) ||
          v.plateNumber.toLowerCase().includes(lowerSearch) ||
          v.manufacturer.toLowerCase().includes(lowerSearch)
      )
    );
  };

  if (loading) {
    return (
      <div className="seats-loading">
        <div className="seats-loading-spinner"></div>
        <p>در حال بارگذاری خودروها...</p>
      </div>
    );
  }

  return (
    <div className="seats-management">
      <div className="seats-management-header">
        <h1><FaChair /> مدیریت صندلی‌های خودروها</h1>
        <p>برای مدیریت صندلی‌های هر خودرو، روی دکمه مربوطه کلیک کنید</p>
      </div>

      <div className="seats-search">
        <FaSearch className="seats-search-icon" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام، پلاک یا برند..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="seats-no-vehicles">
          <FaCar />
          <p>هیچ خودرویی یافت نشد</p>
        </div>
      ) : (
        <div className="seats-vehicles-grid">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="seats-vehicle-card">
              <div className="seats-vehicle-icon">🚐</div>
              <div className="seats-vehicle-info">
                <h3>{vehicle.name}</h3>
                <div className="seats-vehicle-details">
                  <span>پلاک: {vehicle.plateNumber}</span>
                  <span>برند: {vehicle.manufacturer}</span>
                  <span>رنگ: {vehicle.color}</span>
                </div>
                <button
                  className="seats-manage-btn"
                  onClick={() => navigate(`/ceo/dashboard/seats/${vehicle.id}`)}
                >
                  مدیریت صندلی‌ها
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatsManagement;