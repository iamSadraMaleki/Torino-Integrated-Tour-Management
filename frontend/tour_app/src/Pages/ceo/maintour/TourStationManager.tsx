import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { tourApi } from "../../../Services/tourApi";
import { stationApiForTour } from "../../../Services/baseTourApi";
import { TourStationItem, TourStationAddRequest } from "../../../Types/tour";
import { Station } from "../../../Types/baseTour";
import ConfirmModal from "../profile/ConfirmModal";
import "./TourStationManager.css";

interface TourStationManagerProps {
  tourId: number;
  originStations: TourStationItem[];
  destinationStations: TourStationItem[];
  programStations: TourStationItem[];
  onClose: () => void;
  onRefresh: () => void;
}

type StationType = "origins" | "destinations" | "program";

const TourStationManager: React.FC<TourStationManagerProps> = ({
  tourId,
  originStations,
  destinationStations,
  programStations,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<StationType>("origins");
  const [stationsList, setStationsList] = useState<TourStationItem[]>([]);
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStation, setNewStation] = useState({ stationId: 0, minutesToNext: 0 });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadStationsList();
    fetchAvailableStations();
  }, [activeTab]);

  const loadStationsList = () => {
    if (activeTab === "origins") setStationsList([...originStations].sort((a, b) => a.orderNo - b.orderNo));
    else if (activeTab === "destinations") setStationsList([...destinationStations].sort((a, b) => a.orderNo - b.orderNo));
    else setStationsList([...programStations].sort((a, b) => a.orderNo - b.orderNo));
  };

  const fetchAvailableStations = async () => {
    try {
      const response = await stationApiForTour.getMyStations();
      setAvailableStations(response);
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  const getToggleApi = () => {
    if (activeTab === "origins") return tourApi.toggleOriginStation;
    if (activeTab === "destinations") return tourApi.toggleDestinationStation;
    return tourApi.toggleProgramStation;
  };

  // ✅ اصلاح: ارسال stationItemId به جای stationId
const handleToggle = async (station: TourStationItem) => {
  setLoading(true);
  try {
    const api = getToggleApi();
    
    // ✅ اگر میخوایم فعال کنیم، orderNo رو هم باید بفرستیم
    const requestData: any = {
      stationItemId: station.id,
      isActive: !station.isActive
    };
    
    // اگر در حال فعال کردن هستیم، orderNo رو هم اضافه کن
    if (!station.isActive) {
      // برای فعال کردن، آخرین ترتیب + 1 رو پیشنهاد بده
      const maxOrder = Math.max(...stationsList.map(s => s.orderNo), 0);
      requestData.orderNo = maxOrder + 1;
    }
    
    await api(tourId, requestData);
    
    setMessage({ type: "success", text: `ایستگاه ${station.isActive ? "غیرفعال" : "فعال"} شد` });
    setTimeout(() => setMessage(null), 3000);
    onRefresh();
  } catch (error) {
    console.error("Error toggling station:", error);
    setMessage({ type: "error", text: "خطا در تغییر وضعیت ایستگاه" });
  } finally {
    setLoading(false);
  }
};

  const handleAdd = async () => {
    if (!newStation.stationId) {
      setMessage({ type: "error", text: "لطفاً ایستگاه را انتخاب کنید" });
      return;
    }

    setLoading(true);
    try {
      let api;
      if (activeTab === "origins") api = tourApi.addOriginStation;
      else if (activeTab === "destinations") api = tourApi.addDestinationStation;
      else api = tourApi.addProgramStation;

      await api(tourId, {
        stationId: newStation.stationId,
        minutesToNext: newStation.minutesToNext,
      });
      setMessage({ type: "success", text: "ایستگاه با موفقیت اضافه شد" });
      setShowAddForm(false);
      setNewStation({ stationId: 0, minutesToNext: 0 });
      setTimeout(() => setMessage(null), 3000);
      onRefresh();
    } catch (error) {
      console.error("Error adding station:", error);
      setMessage({ type: "error", text: "خطا در افزودن ایستگاه" });
    } finally {
      setLoading(false);
    }
  };

  const getStationName = (stationId: number) => {
    return availableStations.find(s => s.id === stationId)?.stationName || "نامشخص";
  };

  if (loading && stationsList.length === 0) {
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
      <div className="tour-modal tour-modal-xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3>مدیریت ایستگاه‌های تور</h3>
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

          {/* تب‌ها */}
          <div className="tour-stations-tabs">
            <button className={`tab-btn ${activeTab === "origins" ? "active" : ""}`} onClick={() => setActiveTab("origins")}>
              📍 مبداها ({originStations.length})
            </button>
            <button className={`tab-btn ${activeTab === "destinations" ? "active" : ""}`} onClick={() => setActiveTab("destinations")}>
              🎯 مقصدها ({destinationStations.length})
            </button>
            <button className={`tab-btn ${activeTab === "program" ? "active" : ""}`} onClick={() => setActiveTab("program")}>
              📅 برنامه ({programStations.length})
            </button>
          </div>

          {/* دکمه افزودن */}
          <div className="tour-add-station-btn">
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add-station">
              <FaPlus /> افزودن ایستگاه جدید
            </button>
          </div>

          {/* فرم افزودن */}
          {showAddForm && (
            <div className="tour-add-station-form">
              <div className="form-row">
                <div className="form-group">
                  <label>انتخاب ایستگاه</label>
                  <select
                    value={newStation.stationId}
                    onChange={(e) => setNewStation({ ...newStation, stationId: parseInt(e.target.value) })}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {availableStations.map(s => (
                      <option key={s.id} value={s.id}>{s.stationName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>زمان تا ایستگاه بعدی (دقیقه)</label>
                  <input
                    type="number"
                    min="0"
                    value={newStation.minutesToNext}
                    onChange={(e) => setNewStation({ ...newStation, minutesToNext: parseInt(e.target.value) || 0 })}
                    placeholder="۰"
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleAdd} className="btn-submit-sm" disabled={!newStation.stationId}>ثبت</button>
                  <button onClick={() => setShowAddForm(false)} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* لیست ایستگاه‌ها */}
          <div className="tour-stations-manager-list">
            {stationsList.length === 0 ? (
              <div className="no-stations">هیچ ایستگاهی ثبت نشده است</div>
            ) : (
              stationsList.map((station) => (
                <div key={station.id} className={`manager-station-item ${!station.isActive ? "inactive" : ""}`}>
                  <div className="station-order">ردیف {station.orderNo}</div>
                  <div className="station-name">{station.stationName}</div>
                  <div className="station-duration">{station.minutesToNext} دقیقه</div>
                  <div className="station-status">
                    <button
                      className={`toggle-btn ${station.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggle(station)}
                      disabled={loading}
                    >
                      {station.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      {station.isActive ? "فعال" : "غیرفعال"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>بستن</button>
        </div>
      </div>
    </div>
  );
};

export default TourStationManager;