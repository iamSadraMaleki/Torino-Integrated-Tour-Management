import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaTimes, FaTools, FaWrench } from "react-icons/fa";
import { Vehicle, VehicleRepair, VehicleRepairRequest, VehicleRepairStats, VehicleRepairType } from "../../../Types/vehicle";
import { vehicleApi, vehicleRepairApi } from "../../../Services/vehicleApi";
import ConfirmModal from "../profile/ConfirmModal";

const REPAIR_TYPE_META: Record<VehicleRepairType, { icon: string; label: string }> = {
  ROUTINE_SERVICE: { icon: "🛠️", label: "سرویس دوره‌ای" },
  REPAIR: { icon: "🔧", label: "تعمیر" },
  ACCIDENT: { icon: "⚠️", label: "تصادف" },
  OTHER: { icon: "📋", label: "سایر" },
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const formatMonth = (month?: string) => {
  if (!month) return "-";
  const [y, m] = month.split("-");
  return `${y}/${m}`;
};

const VehicleRepairs: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [repairs, setRepairs] = useState<VehicleRepair[]>([]);
  const [stats, setStats] = useState<VehicleRepairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // فرم ثبت سرویس
  const [form, setForm] = useState({
    vehicleId: 0,
    repairDate: "",
    cost: "",
    repairType: "ROUTINE_SERVICE" as VehicleRepairType,
    title: "",
    description: "",
    workshopName: "",
  });

  // فیلتر
  const [filterVehicle, setFilterVehicle] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<"ALL" | VehicleRepairType>("ALL");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRepair, setDeletingRepair] = useState<VehicleRepair | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehRes, repRes, statsRes] = await Promise.all([
        vehicleApi.getAllVehicles(),
        vehicleRepairApi.getAll(),
        vehicleRepairApi.getStatistics(),
      ]);
      if (vehRes.success) setVehicles(vehRes.data || []);
      if (repRes.success) setRepairs(repRes.data || []);
      if (statsRes.success) setStats(statsRes.data || null);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در دریافت اطلاعات" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      if (filterVehicle !== "all" && r.vehicleId !== filterVehicle) return false;
      if (filterType !== "ALL" && r.repairType !== filterType) return false;
      return true;
    });
  }, [repairs, filterVehicle, filterType]);

  const resetForm = () =>
    setForm({ vehicleId: 0, repairDate: "", cost: "", repairType: "ROUTINE_SERVICE", title: "", description: "", workshopName: "" });

  const handleSubmit = async () => {
    if (!form.vehicleId) {
      setMessage({ type: "error", text: "خودرو را انتخاب کنید" });
      return;
    }
    const cost = Number(form.cost);
    if (!cost || cost < 0) {
      setMessage({ type: "error", text: "هزینه معتبر وارد کنید" });
      return;
    }
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "عنوان (دلیل سرویس) را وارد کنید" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload: VehicleRepairRequest = {
        vehicleId: form.vehicleId,
        repairDate: form.repairDate || new Date().toISOString().slice(0, 10),
        cost,
        repairType: form.repairType,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        workshopName: form.workshopName.trim() || undefined,
      };
      const res = await vehicleRepairApi.record(payload);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        resetForm();
        setShowForm(false);
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت سرویس" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRepair) return;
    setIsSubmitting(true);
    try {
      const res = await vehicleRepairApi.remove(deletingRepair.id);
      if (res.success) {
        setMessage({ type: "success", text: "سرویس حذف شد" });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف سرویس" });
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingRepair(null);
    }
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
      {message && <div className={`toast-message ${message.type}`}>{message.text}</div>}

      {/* آمار خلاصه */}
      <div className="vehicle-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>
        <div className="vehicle-stat-card" style={{ background: "#ef444415", border: "1px solid #ef444430" }}>
          <div className="vehicle-stat-icon" style={{ color: "#ef4444" }}><FaTools /></div>
          <div className="vehicle-stat-info">
            <h3>کل هزینه تعمیرات</h3>
            <p className="vehicle-stat-value" style={{ fontSize: "1rem" }}>{formatPrice(stats?.totalCost || 0)}</p>
          </div>
        </div>
        <div className="vehicle-stat-card" style={{ background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
          <div className="vehicle-stat-icon" style={{ color: "#f59e0b" }}><FaWrench /></div>
          <div className="vehicle-stat-info">
            <h3>تعداد سرویس‌ها</h3>
            <p className="vehicle-stat-value">{stats?.repairCount || 0} سرویس</p>
          </div>
        </div>
        <div className="vehicle-stat-card" style={{ background: "#0d948815", border: "1px solid #0d948830" }}>
          <div className="vehicle-stat-icon" style={{ color: "#0d9488" }}>🚗</div>
          <div className="vehicle-stat-info">
            <h3>خودروهای دارای سرویس</h3>
            <p className="vehicle-stat-value">{stats?.vehicleCount || 0} خودرو</p>
          </div>
        </div>
      </div>

      <div className="section-header-actions">
        <h3>🔧 دفتر تعمیرات خودرو</h3>
        <div className="header-actions">
          <select
            className="filter-select"
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">همه خودروها</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name} — {v.plateNumber}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "ALL" | VehicleRepairType)}
          >
            <option value="ALL">همه انواع</option>
            <option value="ROUTINE_SERVICE">🛠️ سرویس دوره‌ای</option>
            <option value="REPAIR">🔧 تعمیر</option>
            <option value="ACCIDENT">⚠️ تصادف</option>
            <option value="OTHER">📋 سایر</option>
          </select>
          <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            <FaPlus /> ثبت سرویس جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3><FaWrench /> ثبت سرویس / تعمیر خودرو</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="vehicle-form">
              <div className="form-row">
                <div className="form-group">
                  <label>خودرو</label>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: Number(e.target.value) })}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} — {v.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>نوع سرویس</label>
                  <select
                    value={form.repairType}
                    onChange={(e) => setForm({ ...form, repairType: e.target.value as VehicleRepairType })}
                  >
                    <option value="ROUTINE_SERVICE">🛠️ سرویس دوره‌ای</option>
                    <option value="REPAIR">🔧 تعمیر</option>
                    <option value="ACCIDENT">⚠️ تصادف</option>
                    <option value="OTHER">📋 سایر</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>تاریخ سرویس</label>
                  <input
                    type="date"
                    value={form.repairDate}
                    onChange={(e) => setForm({ ...form, repairDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>هزینه (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="مثال: 2500000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>عنوان / دلیل سرویس</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: تعویض روغن، تعمیر ترمز، تعویض لاستیک"
                  maxLength={200}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>نام تعمیرگاه / مکانیک (اختیاری)</label>
                  <input
                    type="text"
                    value={form.workshopName}
                    onChange={(e) => setForm({ ...form, workshopName: e.target.value })}
                    placeholder="مثال: تعمیرگاه مرکزی"
                    maxLength={150}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>توضیحات (اختیاری)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="توضیحات تکمیلی درباره سرویس..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>انصراف</button>
                <button className="btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "در حال ثبت..." : "ثبت سرویس"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="vehicles-table-wrapper">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>خودرو</th>
              <th>پلاک</th>
              <th>نوع</th>
              <th>عنوان / دلیل</th>
              <th>تعمیرگاه</th>
              <th>هزینه</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepairs.map((r) => {
              const meta = REPAIR_TYPE_META[r.repairType] || { icon: "📋", label: r.repairType };
              return (
                <tr key={r.id}>
                  <td>{formatDate(r.repairDate)}</td>
                  <td><strong>{r.vehicleName}</strong></td>
                  <td dir="ltr">{r.plateNumber}</td>
                  <td>
                    <span className="status-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
                      {meta.icon} {meta.label}
                    </span>
                  </td>
                  <td title={r.description || ""}>{r.title}</td>
                  <td>{r.workshopName || "-"}</td>
                  <td style={{ fontWeight: 700, color: "#dc2626" }}>{formatPrice(r.cost)}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn delete"
                      title="حذف سرویس"
                      onClick={() => { setDeletingRepair(r); setShowDeleteModal(true); }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredRepairs.length === 0 && (
          <div className="empty-state">
            <p>هنوز سرویسی ثبت نشده است</p>
            <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
              ثبت اولین سرویس
            </button>
          </div>
        )}
      </div>

      {/* آمار به تفکیک خودرو و نوع */}
      {(stats?.perVehicle?.length || stats?.perType?.length) ? (
        <div className="vehicle-stats-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "1.5rem", gap: "1rem" }}>
          {stats?.perVehicle?.length ? (
            <div className="vehicles-list-section" style={{ boxShadow: "none", border: "1px solid #e2e8f0", padding: "1rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#1e293b" }}>📊 هزینه به تفکیک خودرو</h4>
              <div className="vehicles-table-wrapper">
                <table className="vehicles-table">
                  <thead>
                    <tr>
                      <th>خودرو</th>
                      <th>تعداد سرویس</th>
                      <th>مجموع هزینه</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.perVehicle.map((v) => (
                      <tr key={v.vehicleId}>
                        <td><strong>{v.vehicleName}</strong> <span dir="ltr" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>({v.plateNumber})</span></td>
                        <td>{v.repairCount}</td>
                        <td style={{ fontWeight: 700, color: "#dc2626" }}>{formatPrice(v.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          {stats?.perType?.length ? (
            <div className="vehicles-list-section" style={{ boxShadow: "none", border: "1px solid #e2e8f0", padding: "1rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#1e293b" }}>📊 هزینه به تفکیک نوع سرویس</h4>
              <div className="vehicles-table-wrapper">
                <table className="vehicles-table">
                  <thead>
                    <tr>
                      <th>نوع</th>
                      <th>تعداد</th>
                      <th>مجموع هزینه</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.perType.map((t, i) => (
                      <tr key={i}>
                        <td>{REPAIR_TYPE_META[t.repairType]?.icon || "📋"} {t.repairTypePersian}</td>
                        <td>{t.repairCount}</td>
                        <td style={{ fontWeight: 700, color: "#dc2626" }}>{formatPrice(t.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {stats?.perMonth?.length ? (
        <div className="vehicles-list-section" style={{ boxShadow: "none", border: "1px solid #e2e8f0", padding: "1rem", marginTop: "1rem" }}>
          <h4 style={{ margin: "0 0 0.75rem 0", color: "#1e293b" }}>📅 هزینه به تفکیک ماه</h4>
          <div className="vehicles-table-wrapper">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>ماه</th>
                  <th>تعداد سرویس</th>
                  <th>مجموع هزینه</th>
                </tr>
              </thead>
              <tbody>
                {stats.perMonth.map((m, i) => (
                  <tr key={i}>
                    <td dir="ltr">{formatMonth(m.month)}</td>
                    <td>{m.repairCount}</td>
                    <td style={{ fontWeight: 700, color: "#dc2626" }}>{formatPrice(m.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف سرویس"
        message={`آیا از حذف سرویس «${deletingRepair?.title || ""}» (${deletingRepair ? formatPrice(deletingRepair.cost) : ""}) اطمینان دارید؟`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setDeletingRepair(null); }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VehicleRepairs;
