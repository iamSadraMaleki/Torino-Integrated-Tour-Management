import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch, FaMinus, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";
import {
  InventoryItem,
  InventoryItemRequest,
  InventoryStats,
  InventoryCategory,
  INVENTORY_CATEGORY_META,
} from "../../../Types/nutrition";
import { inventoryApi } from "../../../Services/nutritionApi";
import ConfirmModal from "../profile/ConfirmModal";

const formatQty = (qty: number) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(qty);

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<InventoryCategory | "all">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // فرم
  const [form, setForm] = useState({
    name: "",
    category: "FOOD" as InventoryCategory,
    unit: "عدد",
    quantity: "",
    minQuantity: "",
    description: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        inventoryApi.getAll(),
        inventoryApi.getStatistics(),
      ]);
      if (itemsRes.success) setItems(itemsRes.data || []);
      if (statsRes.success) setStats(statsRes.data || null);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در دریافت اطلاعات انبار" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, filterCategory]);

  const resetForm = () =>
    setForm({ name: "", category: "FOOD", unit: "عدد", quantity: "", minQuantity: "", description: "" });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setMessage({ type: "error", text: "نام قلم را وارد کنید" });
      return;
    }
    const quantity = Number(form.quantity);
    if (form.quantity !== "" && (isNaN(quantity) || quantity < 0)) {
      setMessage({ type: "error", text: "موجودی معتبر وارد کنید" });
      return;
    }
    const minQuantity = Number(form.minQuantity);
    if (form.minQuantity !== "" && (isNaN(minQuantity) || minQuantity < 0)) {
      setMessage({ type: "error", text: "حداقل موجودی معتبر وارد کنید" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload: InventoryItemRequest = {
        name: form.name.trim(),
        category: form.category,
        unit: form.unit.trim() || "عدد",
        quantity: form.quantity === "" ? 0 : quantity,
        minQuantity: form.minQuantity === "" ? 0 : minQuantity,
        description: form.description.trim() || undefined,
      };
      const res = editingItem
        ? await inventoryApi.update(editingItem.id, payload)
        : await inventoryApi.create(payload);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        resetForm();
        setShowForm(false);
        setEditingItem(null);
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ذخیره قلم" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjust = async (item: InventoryItem, delta: number) => {
    setIsSubmitting(true);
    try {
      const res = await inventoryApi.adjust(item.id, delta);
      if (res.success) {
        setItems(items.map((i) => (i.id === item.id ? res.data : i)));
        const statsRes = await inventoryApi.getStatistics();
        if (statsRes.success) setStats(statsRes.data);
        setMessage({ type: "success", text: `موجودی ${delta > 0 ? "افزایش" : "کاهش"} یافت` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در تغییر موجودی" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const res = await inventoryApi.remove(deletingId);
      if (res.success) {
        setItems(items.filter((i) => i.id !== deletingId));
        setMessage({ type: "success", text: "قلم از انبار حذف شد" });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف قلم" });
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: String(item.quantity),
      minQuantity: String(item.minQuantity),
      description: item.description || "",
    });
    setShowForm(true);
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
    <div className="foods-list-section">
      {message && <div className={`toast-message ${message.type}`}>{message.text}</div>}

      {/* آمار خلاصه */}
      <div className="foods-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>
        <div className="food-stat-card" style={{ background: "#0d948815", border: "1px solid #0d948830" }}>
          <div className="food-stat-icon" style={{ color: "#0d9488" }}><FaBoxOpen /></div>
          <div className="food-stat-info">
            <h3>کل اقلام انبار</h3>
            <p className="food-stat-value">{stats?.totalItems || 0} قلم</p>
          </div>
        </div>
        <div className="food-stat-card" style={{ background: "#ef444415", border: "1px solid #ef444430" }}>
          <div className="food-stat-icon" style={{ color: "#ef4444" }}><FaExclamationTriangle /></div>
          <div className="food-stat-info">
            <h3>کمبود موجودی</h3>
            <p className="food-stat-value">{stats?.lowStockCount || 0} قلم</p>
          </div>
        </div>
        <div className="food-stat-card" style={{ background: "#3b82f615", border: "1px solid #3b82f630" }}>
          <div className="food-stat-icon" style={{ color: "#3b82f6" }}>📦</div>
          <div className="food-stat-info">
            <h3>مجموع موجودی</h3>
            <p className="food-stat-value" style={{ fontSize: "1rem" }}>{formatQty(stats?.totalQuantity || 0)}</p>
          </div>
        </div>
      </div>

      <div className="section-header-actions">
        <h3>📦 انبار مواد اولیه</h3>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="جستجوی قلم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as InventoryCategory | "all")}
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {(Object.keys(INVENTORY_CATEGORY_META) as InventoryCategory[]).map((cat) => (
              <option key={cat} value={cat}>{INVENTORY_CATEGORY_META[cat].icon} {INVENTORY_CATEGORY_META[cat].label}</option>
            ))}
          </select>
          <button className="btn-add" onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}>
            <FaPlus /> افزودن قلم جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingItem ? "ویرایش قلم انبار" : "افزودن قلم به انبار"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="food-form">
              <div className="form-row">
                <div className="form-group">
                  <label>نام قلم</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: برنج، روغن، مرغ..."
                    maxLength={150}
                  />
                </div>
                <div className="form-group">
                  <label>دسته‌بندی</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as InventoryCategory })}
                  >
                    <option value="FOOD">🍞 مواد غذایی</option>
                    <option value="DRINK">🥤 نوشیدنی</option>
                    <option value="DESSERT">🍰 دسر</option>
                    <option value="OTHER">📦 سایر</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>واحد شمارش</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="عدد / کیلوگرم / لیتر / بسته"
                    maxLength={20}
                  />
                </div>
                <div className="form-group">
                  <label>موجودی</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>حداقل موجودی (برای هشدار کمبود)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                  placeholder="مثال: 10"
                />
              </div>
              <div className="form-group">
                <label>توضیحات (اختیاری)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="توضیحات تکمیلی..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>انصراف</button>
                <button className="btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="foods-table-wrapper">
        <table className="foods-table">
          <thead>
            <tr>
              <th>نام قلم</th>
              <th>دسته‌بندی</th>
              <th>موجودی</th>
              <th>حداقل</th>
              <th>وضعیت</th>
              <th>تغییر موجودی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const meta = INVENTORY_CATEGORY_META[item.category] || INVENTORY_CATEGORY_META.OTHER;
              return (
                <tr key={item.id} style={item.lowStock ? { background: "#fef2f2" } : {}}>
                  <td><strong>{item.name}</strong></td>
                  <td>{meta.icon} {meta.label}</td>
                  <td style={{ fontWeight: 700 }}>{formatQty(item.quantity)} {item.unit}</td>
                  <td>{formatQty(item.minQuantity)} {item.unit}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={item.lowStock
                        ? { background: "#fee2e2", color: "#dc2626" }
                        : { background: "#dcfce7", color: "#16a34a" }}
                    >
                      {item.lowStock ? "⚠️ کمبود موجودی" : "✓ موجود"}
                    </span>
                  </td>
                  <td>
                    <div className="adjust-row">
                      <button
                        className="action-btn adjust"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleAdjust(item, -1)}
                        title="کاهش ۱ واحد"
                        disabled={isSubmitting}
                      >
                        <FaMinus />
                      </button>
                      <span className="adjust-label">۱ {item.unit}</span>
                      <button
                        className="action-btn adjust"
                        style={{ color: "#10b981" }}
                        onClick={() => handleAdjust(item, 1)}
                        title="افزایش ۱ واحد"
                        disabled={isSubmitting}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit" onClick={() => startEdit(item)} title="ویرایش">
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => { setDeletingId(item.id); setShowDeleteModal(true); }}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="empty-state">
            <p>هیچ قلمی در انبار ثبت نشده است</p>
            <button className="btn-add" onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}>
              افزودن اولین قلم
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف قلم انبار"
        message="آیا از حذف این قلم از انبار اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default InventoryList;
