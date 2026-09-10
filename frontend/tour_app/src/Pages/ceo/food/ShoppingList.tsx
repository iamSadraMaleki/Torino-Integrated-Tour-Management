import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaTimes,
  FaShoppingCart,
  FaCheckCircle,
  FaBan,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import {
  InventoryItem,
  ShoppingItem,
  ShoppingItemRequest,
  ShoppingStats,
  ShoppingStatus,
  SHOPPING_STATUS_META,
} from "../../../Types/nutrition";
import { inventoryApi, shoppingApi } from "../../../Services/nutritionApi";
import ConfirmModal from "../profile/ConfirmModal";

const formatQty = (qty: number) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(qty);

const formatDateTime = (date?: string | null) =>
  date ? new Date(date).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }) : "-";

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<ShoppingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "purchase" | "cancel" | null>(null);
  const [targetItem, setTargetItem] = useState<ShoppingItem | null>(null);

  // فرم
  const [form, setForm] = useState({
    name: "",
    quantity: "1",
    unit: "عدد",
    inventoryItemId: 0,
    note: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, invRes, statsRes] = await Promise.all([
        shoppingApi.getAll(),
        inventoryApi.getAll(),
        shoppingApi.getStatistics(),
      ]);
      if (itemsRes.success) setItems(itemsRes.data || []);
      if (invRes.success) setInventory(invRes.data || []);
      if (statsRes.success) setStats(statsRes.data || null);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در دریافت لیست خرید" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingItems = useMemo(() => items.filter((i) => i.status === "PENDING"), [items]);
  const historyItems = useMemo(() => items.filter((i) => i.status !== "PENDING"), [items]);

  const filteredPending = pendingItems.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredHistory = historyItems.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () =>
    setForm({ name: "", quantity: "1", unit: "عدد", inventoryItemId: 0, note: "" });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setMessage({ type: "error", text: "نام قلم را وارد کنید" });
      return;
    }
    const quantity = Number(form.quantity);
    if (!quantity || quantity <= 0) {
      setMessage({ type: "error", text: "مقدار معتبر وارد کنید" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload: ShoppingItemRequest = {
        name: form.name.trim(),
        quantity,
        unit: form.unit.trim() || "عدد",
        note: form.note.trim() || undefined,
        inventoryItemId: form.inventoryItemId > 0 ? form.inventoryItemId : null,
      };
      const res = editingItem
        ? await shoppingApi.update(editingItem.id, payload)
        : await shoppingApi.create(payload);
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

  const handleConfirm = async () => {
    if (!targetItem || !confirmAction) return;
    setIsSubmitting(true);
    try {
      let res;
      if (confirmAction === "delete") {
        res = await shoppingApi.remove(targetItem.id);
      } else if (confirmAction === "purchase") {
        res = await shoppingApi.markPurchased(targetItem.id);
      } else {
        res = await shoppingApi.cancel(targetItem.id);
      }
      if (res?.success) {
        setMessage({ type: "success", text: res.message });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در عملیات" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setTargetItem(null);
      setConfirmAction(null);
    }
  };

  const confirmTitle = confirmAction === "delete"
    ? "حذف قلم از لیست خرید"
    : confirmAction === "purchase"
      ? "علامت‌گذاری به‌عنوان خریداری‌شده"
      : "لغو قلم";

  const confirmMessage = confirmAction === "purchase" && targetItem?.inventoryItemId
    ? `با خرید «${targetItem.name}»، موجودی انبار (${targetItem.inventoryItemName}) به‌صورت خودکار افزایش می‌یابد. ادامه می‌دهید؟`
    : confirmAction === "delete"
      ? `آیا از حذف «${targetItem?.name}» از لیست خرید اطمینان دارید؟`
      : `آیا از لغو «${targetItem?.name}» اطمینان دارید؟`;

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
        <div className="food-stat-card" style={{ background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
          <div className="food-stat-icon" style={{ color: "#f59e0b" }}><FaShoppingCart /></div>
          <div className="food-stat-info">
            <h3>در انتظار خرید</h3>
            <p className="food-stat-value">{stats?.pendingCount || 0} قلم</p>
          </div>
        </div>
        <div className="food-stat-card" style={{ background: "#10b98115", border: "1px solid #10b98130" }}>
          <div className="food-stat-icon" style={{ color: "#10b981" }}><FaCheckCircle /></div>
          <div className="food-stat-info">
            <h3>خریداری شده</h3>
            <p className="food-stat-value">{stats?.purchasedCount || 0} قلم</p>
          </div>
        </div>
        <div className="food-stat-card" style={{ background: "#ef444415", border: "1px solid #ef444430" }}>
          <div className="food-stat-icon" style={{ color: "#ef4444" }}><FaBan /></div>
          <div className="food-stat-info">
            <h3>لغو شده</h3>
            <p className="food-stat-value">{stats?.cancelledCount || 0} قلم</p>
          </div>
        </div>
      </div>

      <div className="section-header-actions">
        <h3>🛒 لیست خرید و تاریخچه خریدها</h3>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}>
            <FaPlus /> افزودن به لیست خرید
          </button>
        </div>
      </div>

      {/* تب لیست خرید / تاریخچه */}
      <div className="foods-tabs" style={{ marginBottom: "1rem" }}>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          📋 لیست خرید ({pendingItems.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          🗂️ تاریخچه خریدها ({historyItems.length})
        </button>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingItem ? "ویرایش قلم لیست خرید" : "افزودن به لیست خرید"}</h3>
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
                    placeholder="مثال: برنج ۱۰ کیلویی، آب معدنی..."
                    maxLength={150}
                  />
                </div>
                <div className="form-group">
                  <label>مقدار</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>واحد</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="عدد / کیلوگرم / لیتر / بسته"
                    maxLength={20}
                  />
                </div>
                <div className="form-group">
                  <label>لینک به انبار (اختیاری — با خرید، موجودی خودکار زیاد می‌شود)</label>
                  <select
                    value={form.inventoryItemId}
                    onChange={(e) => setForm({ ...form, inventoryItemId: Number(e.target.value) })}
                  >
                    <option value={0}>— بدون لینک —</option>
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({formatQty(inv.quantity)} {inv.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>یادداشت (اختیاری)</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="مثال: از سوپرمارکت فلان تهیه شود..."
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
        {activeTab === "pending" ? (
          <>
            <table className="foods-table">
              <thead>
                <tr>
                  <th>قلم</th>
                  <th>مقدار</th>
                  <th>لینک انبار</th>
                  <th>یادداشت</th>
                  <th>تاریخ ثبت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ fontWeight: 700 }}>{formatQty(item.quantity)} {item.unit}</td>
                    <td>{item.inventoryItemName ? `📦 ${item.inventoryItemName}` : "-"}</td>
                    <td className="description-cell" title={item.note || ""}>{item.note || "-"}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view"
                        style={{ color: "#10b981" }}
                        onClick={() => { setTargetItem(item); setConfirmAction("purchase"); setShowConfirmModal(true); }}
                        title="خریداری شد"
                      >
                        <FaCheckCircle />
                      </button>
                      <button className="action-btn edit" onClick={() => {
                        setEditingItem(item);
                        setForm({
                          name: item.name,
                          quantity: String(item.quantity),
                          unit: item.unit,
                          inventoryItemId: item.inventoryItemId || 0,
                          note: item.note || "",
                        });
                        setShowForm(true);
                      }} title="ویرایش">
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn view"
                        style={{ color: "#f59e0b" }}
                        onClick={() => { setTargetItem(item); setConfirmAction("cancel"); setShowConfirmModal(true); }}
                        title="لغو"
                      >
                        <FaBan />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => { setTargetItem(item); setConfirmAction("delete"); setShowConfirmModal(true); }}
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPending.length === 0 && (
              <div className="empty-state">
                <p>لیست خرید خالی است</p>
                <button className="btn-add" onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}>
                  افزودن اولین قلم
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <table className="foods-table">
              <thead>
                <tr>
                  <th>قلم</th>
                  <th>مقدار</th>
                  <th>وضعیت</th>
                  <th>لینک انبار</th>
                  <th>تاریخ ثبت</th>
                  <th>تاریخ خرید/لغو</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const meta = SHOPPING_STATUS_META[item.status] || SHOPPING_STATUS_META.CANCELLED;
                  return (
                    <tr key={item.id} style={item.status === "CANCELLED" ? { opacity: 0.65 } : {}}>
                      <td><strong>{item.name}</strong></td>
                      <td style={{ fontWeight: 700 }}>{formatQty(item.quantity)} {item.unit}</td>
                      <td>
                        <span className="status-badge" style={{ background: `${meta.color}20`, color: meta.color }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td>{item.inventoryItemName ? `📦 ${item.inventoryItemName}` : "-"}</td>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{item.purchasedAt ? formatDateTime(item.purchasedAt) : "-"}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn delete"
                          onClick={() => { setTargetItem(item); setConfirmAction("delete"); setShowConfirmModal(true); }}
                          title="حذف از تاریخچه"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredHistory.length === 0 && (
              <div className="empty-state">
                <p>هنوز خریدی انجام نشده است</p>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={() => { setShowConfirmModal(false); setTargetItem(null); setConfirmAction(null); }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ShoppingList;
