import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaSync, FaEdit, FaEye, FaTimes, FaArrowRight } from 'react-icons/fa';
import { seatApi } from '../../../Services/seatApi';
import { vehicleApi } from '../../../Services/vehicleApi';
import { Seat, SeatType, SEAT_TYPES, SeatStatistics } from '../../../Types/seat';
import './SeatManagement.css';

const SeatManagement: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);
  const [statistics, setStatistics] = useState<SeatStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterType, setFilterType] = useState<SeatType | null>(null);
  const [generateData, setGenerateData] = useState({
    rowCount: 10,
    seatsPerRow: 4,
    startRowNumber: 1,
    defaultSeatType: 'REGULAR' as SeatType,
    defaultIsActive: true
  });

  useEffect(() => {
    if (vehicleId) {
      fetchAllData();
    }
  }, [vehicleId, filterActive, filterType]);

  const fetchAllData = async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const vehicleIdNum = parseInt(vehicleId);
      const [vehicleRes, seatsRes, statsRes] = await Promise.all([
        vehicleApi.getVehicleById(vehicleIdNum),
        seatApi.getSeatsByFilters(vehicleIdNum, filterActive !== null ? filterActive : undefined, filterType || undefined),
        seatApi.getStatistics(vehicleIdNum)
      ]);
      
      if (vehicleRes.success) setVehicle(vehicleRes.data);
      if (seatsRes.success) setSeats(seatsRes.data);
      if (statsRes.success) setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    try {
      const response = await seatApi.generateSeats({
        vehicleId: parseInt(vehicleId),
        ...generateData
      });
      if (response.success) {
        alert(response.message);
        setShowGenerateForm(false);
        fetchAllData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در تولید صندلی‌ها');
    }
  };

  const handleUpdateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) return;
    try {
      const response = await seatApi.updateSeat(selectedSeat.id, {
        seatType: selectedSeat.seatType,
        isActive: selectedSeat.isActive,
        rowNumber: selectedSeat.rowNumber,
        position: selectedSeat.position,
        notes: selectedSeat.notes
      });
      if (response.success) {
        alert(response.message);
        setSelectedSeat(null);
        fetchAllData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ویرایش صندلی');
    }
  };

  const handleDeleteAllSeats = async () => {
    if (!vehicleId) return;
    if (!window.confirm('⚠️ آیا از حذف تمام صندلی‌های این خودرو اطمینان دارید؟')) return;
    try {
      const response = await seatApi.deleteSeatsByVehicle(parseInt(vehicleId));
      if (response.success) {
        alert(response.message);
        fetchAllData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در حذف صندلی‌ها');
    }
  };

  const handleResetFilters = () => {
    setFilterActive(null);
    setFilterType(null);
  };

  if (loading) {
    return (
      <div className="seat-loading">
        <div className="seat-loading-spinner"></div>
        <p>در حال بارگذاری اطلاعات صندلی‌ها...</p>
      </div>
    );
  }

  return (
    <div className="seat-management">
      {/* Header with Back Button */}
      <div className="seat-header">
        <button className="seat-back-btn" onClick={() => navigate('/ceo/dashboard/seats')}>
          <FaArrowRight /> بازگشت به لیست خودروها
        </button>
        <h1>مدیریت صندلی‌های {vehicle?.name || 'خودرو'}</h1>
      </div>

      {/* Vehicle Info */}
      {vehicle && (
        <div className="seat-vehicle-info">
          <div className="seat-vehicle-row">
            <span>🚗 {vehicle.name}</span>
            <span>📋 پلاک: {vehicle.plateNumber}</span>
            <span>🏭 {vehicle.manufacturer}</span>
            <span>🎨 {vehicle.color}</span>
            <span>💺 تعداد صندلی: {seats.length}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="seat-stats">
          <div className="seat-stat-card total">
            <span className="seat-stat-icon">📊</span>
            <div className="seat-stat-info">
              <strong>{statistics.totalSeats}</strong>
              <span>کل صندلی‌ها</span>
            </div>
          </div>
          <div className="seat-stat-card active">
            <span className="seat-stat-icon">✅</span>
            <div className="seat-stat-info">
              <strong>{statistics.activeSeats}</strong>
              <span>فعال</span>
            </div>
          </div>
          <div className="seat-stat-card inactive">
            <span className="seat-stat-icon">⛔</span>
            <div className="seat-stat-info">
              <strong>{statistics.inactiveSeats}</strong>
              <span>غیرفعال</span>
            </div>
          </div>
          <div className="seat-stat-card vip">
            <span className="seat-stat-icon">⭐</span>
            <div className="seat-stat-info">
              <strong>{statistics.vipSeats}</strong>
              <span>ویژه</span>
            </div>
          </div>
          <div className="seat-stat-card regular">
            <span className="seat-stat-icon">💺</span>
            <div className="seat-stat-info">
              <strong>{statistics.regularSeats}</strong>
              <span>معمولی</span>
            </div>
          </div>
          <div className="seat-stat-card wheelchair">
            <span className="seat-stat-icon">♿</span>
            <div className="seat-stat-info">
              <strong>{statistics.wheelchairSeats}</strong>
              <span>معلولین</span>
            </div>
          </div>
          <div className="seat-stat-card driver">
            <span className="seat-stat-icon">👨‍✈️</span>
            <div className="seat-stat-info">
              <strong>{statistics.driverSeats}</strong>
              <span>راننده</span>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="seat-toolbar">
        <button className="btn-generate" onClick={() => setShowGenerateForm(!showGenerateForm)}>
          <FaPlus /> {showGenerateForm ? 'بستن فرم' : 'تولید خودکار صندلی‌ها'}
        </button>
        <button className="btn-delete-all" onClick={handleDeleteAllSeats} disabled={seats.length === 0}>
          <FaTrash /> حذف تمام صندلی‌ها
        </button>
        <button className="btn-refresh" onClick={fetchAllData}>
          <FaSync /> بروزرسانی
        </button>
      </div>

      {/* Filters */}
      <div className="seat-filters">
        <select 
          value={filterActive === null ? '' : filterActive.toString()} 
          onChange={(e) => {
            const val = e.target.value;
            setFilterActive(val === '' ? null : val === 'true');
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="true">فعال</option>
          <option value="false">غیرفعال</option>
        </select>
        <select 
          value={filterType || ''} 
          onChange={(e) => setFilterType(e.target.value as SeatType || null)}
        >
          <option value="">همه انواع</option>
          {Object.entries(SEAT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.label}</option>
          ))}
        </select>
        <button className="btn-reset" onClick={handleResetFilters}>
          <FaTimes /> حذف فیلترها
        </button>
      </div>

      {/* Generate Form */}
      {showGenerateForm && (
        <form className="seat-generate-form" onSubmit={handleGenerateSeats}>
          <h3>تولید خودکار صندلی‌ها</h3>
          <div className="seat-form-grid">
            <div className="seat-form-field">
              <label>تعداد ردیف</label>
              <input type="number" value={generateData.rowCount} onChange={(e) => setGenerateData({...generateData, rowCount: parseInt(e.target.value)})} min={1} max={50} required />
            </div>
            <div className="seat-form-field">
              <label>صندلی در هر ردیف</label>
              <input type="number" value={generateData.seatsPerRow} onChange={(e) => setGenerateData({...generateData, seatsPerRow: parseInt(e.target.value)})} min={1} max={10} required />
            </div>
            <div className="seat-form-field">
              <label>شماره ردیف شروع</label>
              <input type="number" value={generateData.startRowNumber} onChange={(e) => setGenerateData({...generateData, startRowNumber: parseInt(e.target.value)})} min={1} required />
            </div>
            <div className="seat-form-field">
              <label>نوع پیش‌فرض</label>
              <select value={generateData.defaultSeatType} onChange={(e) => setGenerateData({...generateData, defaultSeatType: e.target.value as SeatType})}>
                {Object.entries(SEAT_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div className="seat-form-field checkbox">
              <label>
                <input type="checkbox" checked={generateData.defaultIsActive} onChange={(e) => setGenerateData({...generateData, defaultIsActive: e.target.checked})} />
                فعال
              </label>
            </div>
          </div>
          <div className="seat-form-preview">
            <span>📐 {generateData.rowCount} ردیف × {generateData.seatsPerRow} صندلی = </span>
            <strong>{generateData.rowCount * generateData.seatsPerRow} صندلی</strong>
          </div>
          <div className="seat-form-actions">
            <button type="submit" className="btn-submit">تولید صندلی‌ها</button>
            <button type="button" className="btn-cancel" onClick={() => setShowGenerateForm(false)}>انصراف</button>
          </div>
        </form>
      )}

      {/* Visualization */}
      <div className="seat-visualization">
        <div className="seat-viz-header">
          <div>
            <h3>🚌 چینش گرافیکی صندلی‌ها</h3>
            <p>برای ویرایش هر صندلی روی آن کلیک کنید</p>
          </div>
          <div className="seat-legend">
            {Object.entries(SEAT_TYPES).map(([key, val]) => (
              <span key={key} className="seat-legend-item">
                <span className="seat-legend-dot" style={{ backgroundColor: val.color }} />
                {val.label}
              </span>
            ))}
          </div>
        </div>
        {seats.length === 0 ? (
          <div className="seat-no-data">هیچ صندلی‌ای وجود ندارد. از دکمه "تولید خودکار صندلی‌ها" استفاده کنید.</div>
        ) : (
          <div className="seat-bus">
            <div className="seat-bus-front">
              <div className="bus-windshield">
                <span className="bus-front-icon">🚌</span>
                <span className="bus-front-label">جلو</span>
              </div>
            </div>
            <div className="seat-bus-body">
              {(() => {
                const seatsByRow: Record<number, Seat[]> = {};
                seats.forEach(seat => {
                  if (!seatsByRow[seat.rowNumber]) seatsByRow[seat.rowNumber] = [];
                  seatsByRow[seat.rowNumber].push(seat);
                });
                const renderSeat = (seat: Seat) => (
                  <div
                    key={seat.id}
                    className={`seat-box ${seat.seatType.toLowerCase()} ${seat.isActive ? 'active' : 'inactive'}`}
                    onClick={() => setSelectedSeat(seat)}
                    title={`صندلی ${seat.seatNumber} - ${SEAT_TYPES[seat.seatType]?.label} - ${seat.isActive ? 'فعال' : 'غیرفعال'}`}
                  >
                    <span className="seat-icon">{SEAT_TYPES[seat.seatType]?.icon}</span>
                    <span className="seat-number">{seat.seatNumber}</span>
                  </div>
                );
                return Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b)).map(rowNum => {
                  const rowSeats = seatsByRow[parseInt(rowNum)].sort((a, b) => a.seatNumber - b.seatNumber);
                  // تقسیم ردیف به دو نیمه: سمت چپ راهرو و سمت راست راهرو
                  const mid = Math.ceil(rowSeats.length / 2);
                  const left = rowSeats.slice(0, mid);
                  const right = rowSeats.slice(mid);
                  return (
                    <div key={rowNum} className="seat-bus-row">
                      <div className="seat-side seats-left">
                        {left.map(renderSeat)}
                      </div>
                      <div className="seat-aisle">
                        <span className="row-badge">ردیف {rowNum}</span>
                      </div>
                      <div className="seat-side seats-right">
                        {right.map(renderSeat)}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="seat-table-section">
        <h3>لیست کامل صندلی‌ها</h3>
        {seats.length === 0 ? (
          <div className="seat-no-data">هیچ صندلی‌ای وجود ندارد</div>
        ) : (
          <div className="seat-table-wrapper">
            <table className="seat-table">
              <thead>
                <tr><th>شماره</th><th>ردیف</th><th>موقعیت</th><th>نوع</th><th>وضعیت</th><th>عملیات</th></tr>
              </thead>
              <tbody>
                {seats.map(seat => (
                  <tr key={seat.id}>
                    <td>{seat.seatNumber}</td>
                    <td>{seat.rowNumber}</td>
                    <td>{seat.position ? `جایگاه ${seat.position}` : '—'}</td>
                    <td><span className="seat-type-badge" style={{ background: SEAT_TYPES[seat.seatType]?.color + '20', color: SEAT_TYPES[seat.seatType]?.color }}>{SEAT_TYPES[seat.seatType]?.icon} {SEAT_TYPES[seat.seatType]?.label}</span></td>
                    <td><span className={`seat-status ${seat.isActive ? 'active' : 'inactive'}`}>{seat.isActive ? 'فعال' : 'غیرفعال'}</span></td>
                    <td><button className="btn-edit" onClick={() => setSelectedSeat(seat)}><FaEdit /> ویرایش</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedSeat && (
        <div className="seat-modal" onClick={() => setSelectedSeat(null)}>
          <div className="seat-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="seat-modal-header">
              <h3>ویرایش صندلی {selectedSeat.seatNumber}</h3>
              <button className="seat-modal-close" onClick={() => setSelectedSeat(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdateSeat}>
              <div className="seat-modal-info">
                <div
                  className={`seat-modal-preview ${selectedSeat.seatType.toLowerCase()} ${selectedSeat.isActive ? 'active' : 'inactive'}`}
                  style={{ backgroundColor: selectedSeat.isActive ? SEAT_TYPES[selectedSeat.seatType]?.color : '#e2e8f0' }}
                >
                  <span className="seat-icon">{SEAT_TYPES[selectedSeat.seatType]?.icon}</span>
                  <span className="seat-number">{selectedSeat.seatNumber}</span>
                </div>
                <div className="seat-modal-meta">
                  <span>🚏 شماره: {selectedSeat.seatNumber}</span>
                  <span>📐 ردیف: {selectedSeat.rowNumber}</span>
                  <span>↔️ جایگاه: {selectedSeat.position || '—'}</span>
                </div>
              </div>
              <div className="seat-modal-field">
                <label>نوع صندلی</label>
                <select value={selectedSeat.seatType} onChange={(e) => setSelectedSeat({...selectedSeat, seatType: e.target.value as SeatType})}>
                  {Object.entries(SEAT_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>
              <div className="seat-modal-field">
                <label>ردیف</label>
                <input type="number" value={selectedSeat.rowNumber} onChange={(e) => setSelectedSeat({...selectedSeat, rowNumber: parseInt(e.target.value)})} />
              </div>
              <div className="seat-modal-field checkbox">
                <label><input type="checkbox" checked={selectedSeat.isActive} onChange={(e) => setSelectedSeat({...selectedSeat, isActive: e.target.checked})} /> فعال</label>
              </div>
              <div className="seat-modal-actions">
                <button type="submit" className="btn-save">ذخیره تغییرات</button>
                <button type="button" className="btn-cancel" onClick={() => setSelectedSeat(null)}>انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManagement;