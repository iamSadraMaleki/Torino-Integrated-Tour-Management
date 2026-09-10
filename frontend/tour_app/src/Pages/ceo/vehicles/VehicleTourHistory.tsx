import React, { useCallback, useEffect, useState } from "react";
import { FaBus, FaRoute } from "react-icons/fa";
import { Vehicle, VehicleTourHistory } from "../../../Types/vehicle";
import { vehicleApi } from "../../../Services/vehicleApi";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }) : "-";

const VehicleTourHistory: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [tours, setTours] = useState<VehicleTourHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTours, setLoadingTours] = useState(false);
  const [error, setError] = useState("");

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.getAllVehicles();
      if (res.success) setVehicles(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت خودروها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const loadTours = useCallback(async (vehicleId: number) => {
    if (!vehicleId) {
      setTours([]);
      return;
    }
    setLoadingTours(true);
    setError("");
    try {
      const res: any = await vehicleApi.getVehicleTours(vehicleId);
      // پشتیبانی از هر دو شکل پاسخ: آرایه خام یا رپر { success, message, data }
      if (Array.isArray(res)) {
        setTours(res);
      } else if (res && res.success) {
        setTours(res.data || []);
      } else {
        setError((res && res.message) || "خطا در دریافت تاریخچه سفر");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تاریخچه سفر");
    } finally {
      setLoadingTours(false);
    }
  }, []);

  const handleSelect = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    loadTours(vehicleId);
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
    <div className="vehicles-list-section">
      {error && <div className="toast-message error">{error}</div>}

      <div className="section-header-actions">
        <h3>🚌 تاریخچه سفرهای خودرو</h3>
      </div>

      <div style={{ maxWidth: 400, marginBottom: "1rem" }}>
        <div className="form-group">
          <label>انتخاب خودرو</label>
          <select
            value={selectedVehicleId}
            onChange={(e) => handleSelect(Number(e.target.value))}
          >
            <option value={0}>انتخاب کنید...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.plateNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVehicleId === 0 ? (
        <div className="empty-state">
          <FaRoute size={40} style={{ marginBottom: "0.5rem" }} />
          <p>برای مشاهده تاریخچه سفرها، ابتدا یک خودرو را انتخاب کنید</p>
        </div>
      ) : loadingTours ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>در حال دریافت تاریخچه...</p>
        </div>
      ) : (
        <>
          {/* خلاصه */}
          <div className="vehicle-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>
            <div className="vehicle-stat-card" style={{ background: "#0d948815", border: "1px solid #0d948830" }}>
              <div className="vehicle-stat-icon" style={{ color: "#0d9488" }}><FaBus /></div>
              <div className="vehicle-stat-info">
                <h3>تعداد سفرها</h3>
                <p className="vehicle-stat-value">{tours.length} سفر</p>
              </div>
            </div>
            <div className="vehicle-stat-card" style={{ background: "#3b82f615", border: "1px solid #3b82f630" }}>
              <div className="vehicle-stat-icon" style={{ color: "#3b82f6" }}>🗓️</div>
              <div className="vehicle-stat-info">
                <h3>آخرین سفر</h3>
                <p className="vehicle-stat-value" style={{ fontSize: "1rem" }}>
                  {tours.length ? formatDate(tours[0].departureDate) : "-"}
                </p>
              </div>
            </div>
            <div className="vehicle-stat-card" style={{ background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
              <div className="vehicle-stat-icon" style={{ color: "#f59e0b" }}>📍</div>
              <div className="vehicle-stat-info">
                <h3>آخرین تخصیص</h3>
                <p className="vehicle-stat-value" style={{ fontSize: "0.9rem" }}>
                  {tours.length ? formatDateTime(tours[0].assignedAt) : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="vehicles-table-wrapper">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>تور</th>
                  <th>کد</th>
                  <th>تاریخ حرکت</th>
                  <th>تاریخ بازگشت</th>
                  <th>تاریخ تخصیص</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.tourName}</strong></td>
                    <td dir="ltr">{t.tourCode}</td>
                    <td>{formatDate(t.departureDate)}</td>
                    <td>{formatDate(t.returnDate)}</td>
                    <td>{formatDateTime(t.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tours.length === 0 && (
              <div className="empty-state">
                <p>این خودرو هنوز در هیچ توری تخصیص داده نشده است</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleTourHistory;
