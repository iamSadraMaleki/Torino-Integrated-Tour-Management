import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { baseTourApi } from "../../../Services/baseTourApi";
import { Station, TourStationsUpsertRequest, TourStation } from "../../../Types/baseTour";

interface TourStationsManagerProps {
  tourId: number;
  type: "origins" | "destinations" | "program";
  stations: Station[];
  onSave: () => void;
  onCancel: () => void;
}

interface StationItem {
  stationId: number;
  orderNo: number;
  minutesToNext: number;
  stationName?: string;
  stationTypeName?: string;
  location?: string;
}

const TourStationsManager: React.FC<TourStationsManagerProps> = ({
  tourId,
  type,
  stations,
  onSave,
  onCancel,
}) => {
  const [items, setItems] = useState<StationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    setLoading(true);
    try {
      const response = await baseTourApi.getTourDetails(tourId);
      if (response.success) {
        const data = response.data;
        let existingItems: TourStation[] = [];
        if (type === "origins") existingItems = data.originStations || [];
        else if (type === "destinations") existingItems = data.destinationStations || [];
        else existingItems = data.programStations || [];

        setItems(
          existingItems.map((item, idx) => ({
            stationId: item.stationId,
            orderNo: idx + 1,
            minutesToNext: item.minutesToNext,
            stationName: item.stationName,
            stationTypeName: item.stationTypeName,
            location: item.location,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        stationId: 0,
        orderNo: items.length + 1,
        minutesToNext: 0,
      },
    ];
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      orderNo: idx + 1,
    }));
    setItems(reorderedItems);
  };

  const updateItem = (index: number, field: keyof StationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      orderNo: idx + 1,
    }));
    setItems(reorderedItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      orderNo: idx + 1,
    }));
    setItems(reorderedItems);
  };

  // ✅ تابع کمکی برای اعتبارسنجی آیتم‌ها
  const isValidItems = () => {
    if (items.length === 0) return false;
    // همه ایستگاه‌ها باید انتخاب شده باشن
    if (items.some(item => item.stationId === 0)) return false;
    return true;
  };

  const handleSave = async () => {
    // ✅ بازسازی order_no به صورت متوالی و یکتا قبل از ارسال
    const validItems = items.map((item, idx) => ({
      stationId: item.stationId,
      orderNo: idx + 1,
      minutesToNext: item.minutesToNext || 0,
    }));

    const requestData: TourStationsUpsertRequest = {
      items: validItems,
    };

    console.log("📤 Sending data:", JSON.stringify(requestData, null, 2));

    setLoading(true);
    try {
      let response;
      if (type === "origins") {
        response = await baseTourApi.upsertOrigins(tourId, requestData);
      } else if (type === "destinations") {
        response = await baseTourApi.upsertDestinations(tourId, requestData);
      } else {
        response = await baseTourApi.upsertProgram(tourId, requestData);
      }

      if (response.success) {
        setMessage({ type: "success", text: response.message });
        setTimeout(() => {
          setMessage(null);
          onSave();
        }, 1500);
      } else {
        setMessage({ type: "error", text: response.message || "خطا در ذخیره اطلاعات" });
      }
    } catch (error: any) {
      console.error("Error saving stations:", error);
      const errorMsg = error.response?.data?.message || error.message || "خطا در ذخیره اطلاعات";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const getTypeTitle = () => {
    if (type === "origins") return "مبداها";
    if (type === "destinations") return "مقصدها";
    return "برنامه تور";
  };

  return (
    <div className="tour-stations-manager">
      {message && (
        <div className={`tour-stations-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tour-stations-header">
        <h3>مدیریت {getTypeTitle()}</h3>
        <button 
          className="tour-stations-btn-add" 
          onClick={addItem} 
          disabled={loading}
        >
          <FaPlus /> افزودن ایستگاه
        </button>
      </div>

      <div className="tour-stations-table-wrapper">
        <table className="tour-stations-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ترتیب</th>
              <th>ایستگاه</th>
              <th>نوع ایستگاه</th>
              <th>موقعیت</th>
              <th style={{ width: "140px" }}>زمان تا بعد (دقیقه)</th>
              <th style={{ width: "90px" }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="tour-stations-empty">
                  <div className="empty-state-icon">📍</div>
                  <p>هیچ ایستگاهی ثبت نشده است</p>
                  <button 
                    className="empty-add-btn" 
                    onClick={addItem} 
                    disabled={loading}
                  >
                    <FaPlus /> افزودن ایستگاه
                  </button>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index}>
                  <td className="tour-stations-order">
                    <button 
                      className="move-btn" 
                      onClick={() => moveUp(index)} 
                      disabled={index === 0 || loading}
                      title="انتقال به بالا"
                    >
                      <FaArrowUp />
                    </button>
                    <span className="order-number">{index + 1}</span>
                    <button 
                      className="move-btn" 
                      onClick={() => moveDown(index)} 
                      disabled={index === items.length - 1 || loading}
                      title="انتقال به پایین"
                    >
                      <FaArrowDown />
                    </button>
                  </td>
                  <td>
                    <select
                      value={item.stationId}
                      onChange={(e) => updateItem(index, "stationId", parseInt(e.target.value))}
                      disabled={loading}
                      className={item.stationId === 0 ? "invalid" : ""}
                    >
                      <option value={0}>انتخاب ایستگاه...</option>
                      {stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.stationName} ({s.cityName})
                        </option>
                      ))}
                    </select>
                    {item.stationId === 0 && (
                      <span className="validation-error">* الزامی</span>
                    )}
                  </td>
                  <td>
                    {stations.find((s) => s.id === item.stationId)?.stationTypeName || "-"}
                  </td>
                  <td>
                    {stations.find((s) => s.id === item.stationId)?.location || "-"}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={item.minutesToNext}
                      onChange={(e) => updateItem(index, "minutesToNext", parseInt(e.target.value) || 0)}
                      disabled={loading}
                      placeholder="دقیقه"
                      className="minutes-input"
                    />
                  </td>
                  <td className="tour-stations-actions">
                    <button 
                      className="remove-btn" 
                      onClick={() => removeItem(index)} 
                      disabled={loading || items.length === 1}
                      title="حذف ایستگاه"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="tour-stations-info">
          <p className="info-text">
            ⚠️ ترتیب ایستگاه‌ها مهم است. با استفاده از دکمه‌های بالا و پایین می‌توانید ترتیب را تغییر دهید.
          </p>
        </div>
      )}

      <div className="tour-stations-form-actions">
        <button 
          className="tour-stations-btn-cancel" 
          onClick={onCancel} 
          disabled={loading}
        >
          <FaTimes /> انصراف
        </button>
        <button 
          className="tour-stations-btn-save" 
          onClick={handleSave} 
          disabled={loading || !isValidItems()}
        >
          <FaSave /> {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </div>
  );
};

export default TourStationsManager;