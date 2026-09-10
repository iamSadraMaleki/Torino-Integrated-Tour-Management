import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaTimes, FaMoneyBillWave } from "react-icons/fa";
import { StaffMember } from "../../../Types/staff";
import { staffMemberApi } from "../../../Services/staffApi";
import {
  StaffPayment,
  StaffPaymentRequest,
  StaffPaymentType,
  STAFF_PAYMENT_TYPE_META,
} from "../../../Types/staffPayment";
import { staffPaymentApi } from "../../../Services/staffPaymentApi";
import ConfirmModal from "../profile/ConfirmModal";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }) : "-";

const StaffPayments: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [payments, setPayments] = useState<StaffPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // فرم ثبت پرداخت
  const [form, setForm] = useState({
    staffMemberId: 0,
    amount: "",
    paymentType: "SALARY" as StaffPaymentType,
    title: "",
    description: "",
    paymentDate: "",
  });

  // فیلتر
  const [filterStaff, setFilterStaff] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<"ALL" | StaffPaymentType>("ALL");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<StaffPayment | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, payRes] = await Promise.all([
        staffMemberApi.getAllStaffMembers(),
        staffPaymentApi.getAll(),
      ]);
      if (staffRes.success) setStaffList(staffRes.data || []);
      if (payRes.success) setPayments(payRes.data || []);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در دریافت اطلاعات" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterStaff !== "all" && p.staffMemberId !== filterStaff) return false;
      if (filterType !== "ALL" && p.paymentType !== filterType) return false;
      return true;
    });
  }, [payments, filterStaff, filterType]);

  const resetForm = () =>
    setForm({ staffMemberId: 0, amount: "", paymentType: "SALARY", title: "", description: "", paymentDate: "" });

  const handleSubmit = async () => {
    if (!form.staffMemberId) {
      setMessage({ type: "error", text: "کارمند را انتخاب کنید" });
      return;
    }
    const amount = Number(form.amount);
    if (!amount || amount < 0) {
      setMessage({ type: "error", text: "مبلغ معتبر وارد کنید" });
      return;
    }
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "عنوان پرداخت را وارد کنید" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload: StaffPaymentRequest = {
        staffMemberId: form.staffMemberId,
        amount,
        paymentType: form.paymentType,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        paymentDate: form.paymentDate || undefined,
      };
      const res = await staffPaymentApi.record(payload);
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
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت پرداخت" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPayment) return;
    setIsSubmitting(true);
    try {
      const res = await staffPaymentApi.remove(deletingPayment.id);
      if (res.success) {
        setMessage({ type: "success", text: "پرداخت حذف شد" });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف پرداخت" });
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingPayment(null);
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
    <div className="sp-section">
      {message && <div className={`toast-message ${message.type}`}>{message.text}</div>}

      <div className="section-header-actions">
        <h3>💳 دفتر پرداخت حقوق کارکنان</h3>
        <div className="header-actions">
          <select
            className="filter-select"
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">همه کارمندان</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "ALL" | StaffPaymentType)}
          >
            <option value="ALL">همه انواع</option>
            <option value="SALARY">💰 حقوق</option>
            <option value="BONUS">🎁 پاداش</option>
          </select>
          <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            <FaPlus /> ثبت پرداخت جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3><FaMoneyBillWave /> ثبت پرداخت به کارمند</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="position-form">
              <div className="form-row">
                <div className="form-group">
                  <label>کارمند</label>
                  <select
                    value={form.staffMemberId}
                    onChange={(e) => setForm({ ...form, staffMemberId: Number(e.target.value) })}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName} — {s.position.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>نوع پرداخت</label>
                  <select
                    value={form.paymentType}
                    onChange={(e) => setForm({ ...form, paymentType: e.target.value as StaffPaymentType })}
                  >
                    <option value="SALARY">💰 حقوق</option>
                    <option value="BONUS">🎁 پاداش</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>مبلغ (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="مثال: 5000000"
                  />
                </div>
                <div className="form-group">
                  <label>تاریخ پرداخت</label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>عنوان پرداخت</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: حقوق فروردین / پاداش نوروز"
                  maxLength={200}
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
                  {isSubmitting ? "در حال ثبت..." : "ثبت پرداخت"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="staff-table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>کارمند</th>
              <th>سمت</th>
              <th>نوع</th>
              <th>عنوان</th>
              <th>مبلغ</th>
              <th>توضیحات</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => {
              const meta = STAFF_PAYMENT_TYPE_META[p.paymentType] || { icon: "💸", label: p.paymentType };
              return (
                <tr key={p.id}>
                  <td>{formatDate(p.paymentDate)}</td>
                  <td><strong>{p.staffName}</strong></td>
                  <td>{p.positionTitle || "-"}</td>
                  <td>
                    <span className={`status-badge ${p.paymentType === "SALARY" ? "active" : ""}`}
                      style={p.paymentType === "BONUS" ? { background: "#fef3c7", color: "#b45309" } : {}}>
                      {meta.icon} {meta.label}
                    </span>
                  </td>
                  <td>{p.title}</td>
                  <td style={{ fontWeight: 700, color: "#0d9488" }}>{formatPrice(p.amount)}</td>
                  <td className="description-cell" title={p.description || ""}>{p.description || "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn delete"
                      title="حذف پرداخت"
                      onClick={() => { setDeletingPayment(p); setShowDeleteModal(true); }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPayments.length === 0 && (
          <div className="empty-state">
            <p>هنوز پرداختی ثبت نشده است</p>
            <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
              ثبت اولین پرداخت
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف پرداخت"
        message={`آیا از حذف پرداخت «${deletingPayment?.title || ""}» (${deletingPayment ? formatPrice(deletingPayment.amount) : ""}) اطمینان دارید؟`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setDeletingPayment(null); }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default StaffPayments;
