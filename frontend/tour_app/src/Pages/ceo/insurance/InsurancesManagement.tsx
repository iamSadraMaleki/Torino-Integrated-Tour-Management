import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch, FaShieldAlt } from "react-icons/fa";
import {
  InsurancePolicy,
  InsurancePolicyRequest,
  InsurancePolicyType,
  INSURANCE_TYPE_META,
} from "../../../Types/insurance";
import { insuranceApi } from "../../../Services/insuranceApi";
import ConfirmModal from "../profile/ConfirmModal";
import "./InsurancesManagement.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const InsurancesManagement: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<InsurancePolicyType | "all">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    insuranceType: "TRAVEL" as InsurancePolicyType,
    coverageAmount: "",
    premium: "",
    description: "",
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await insuranceApi.getAll();
      setPolicies(data);
    } catch (error) {
      console.error("Error fetching insurances:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست بیمه‌ها" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || p.insuranceType === filterType;
    return matchesSearch && matchesType;
  });

  const resetForm = () =>
    setForm({ name: "", insuranceType: "TRAVEL", coverageAmount: "", premium: "", description: "" });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setMessage({ type: "error", text: "نام بیمه‌نامه را وارد کنید" });
      return;
    }
    const coverage = Number(form.coverageAmount);
    if (form.coverageAmount === "" || isNaN(coverage) || coverage < 0) {
      setMessage({ type: "error", text: "مبلغ پوشش معتبر وارد کنید" });
      return;
    }
    const premium = Number(form.premium);
    if (form.premium === "" || isNaN(premium) || premium < 0) {
      setMessage({ type: "error", text: "هزینه بیمه معتبر وارد کنید" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload: InsurancePolicyRequest = {
        name: form.name.trim(),
        insuranceType: form.insuranceType,
        coverageAmount: coverage,
        premium,
        description: form.description.trim() || undefined,
      };
      if (editingPolicy) {
        await insuranceApi.update(editingPolicy.id, payload);
        setMessage({ type: "success", text: "بیمه‌نامه با موفقیت ویرایش شد" });
      } else {
        await insuranceApi.create(payload);
        setMessage({ type: "success", text: "بیمه‌نامه با موفقیت ثبت شد" });
      }
      resetForm();
      setShowForm(false);
      setEditingPolicy(null);
      fetchPolicies();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ذخیره بیمه‌نامه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await insuranceApi.remove(deletingId);
      setPolicies(policies.filter((p) => p.id !== deletingId));
      setMessage({ type: "success", text: "بیمه‌نامه حذف شد" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف بیمه‌نامه" });
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const startEdit = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setForm({
      name: policy.name,
      insuranceType: policy.insuranceType,
      coverageAmount: String(policy.coverageAmount),
      premium: String(policy.premium),
      description: policy.description || "",
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
    <div className="insurances-management-container">
      <div className="page-header-simple">
        <h1>🛡️ مدیریت بیمه‌های سفر</h1>
        <p>بیمه‌نامه‌های قابل استفاده در تورهای آژانس خود</p>
      </div>

      <div className="insurances-list-section">
        {message && <div className={`toast-message ${message.type}`}>{message.text}</div>}

        <div className="section-header-actions">
          <h3>لیست بیمه‌ها</h3>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="جستجوی بیمه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as InsurancePolicyType | "all")}
            >
              <option value="all">همه انواع</option>
              {(Object.keys(INSURANCE_TYPE_META) as InsurancePolicyType[]).map((type) => (
                <option key={type} value={type}>
                  {INSURANCE_TYPE_META[type].icon} {INSURANCE_TYPE_META[type].label}
                </option>
              ))}
            </select>
            <button className="btn-add" onClick={() => { resetForm(); setEditingPolicy(null); setShowForm(true); }}>
              <FaPlus /> افزودن بیمه‌نامه جدید
            </button>
          </div>
        </div>

        {showForm && (
          <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-modal-header">
                <h3>
                  <FaShieldAlt /> {editingPolicy ? "ویرایش بیمه‌نامه" : "ثبت بیمه‌نامه جدید"}
                </h3>
                <button className="close-btn" onClick={() => setShowForm(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="insurance-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>نام بیمه‌نامه / شرکت بیمه</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="مثال: بیمه مسافرتی آسیا"
                      maxLength={150}
                    />
                  </div>
                  <div className="form-group">
                    <label>نوع بیمه</label>
                    <select
                      value={form.insuranceType}
                      onChange={(e) => setForm({ ...form, insuranceType: e.target.value as InsurancePolicyType })}
                    >
                      <option value="TRAVEL">🧳 بیمه مسافرتی</option>
                      <option value="HEALTH">🏥 بیمه درمانی</option>
                      <option value="ACCIDENT">⚠️ بیمه حوادث</option>
                      <option value="OTHER">📋 سایر</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>مبلغ پوشش (تومان)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.coverageAmount}
                      onChange={(e) => setForm({ ...form, coverageAmount: e.target.value })}
                      placeholder="مثال: 100000000"
                    />
                  </div>
                  <div className="form-group">
                    <label>هزینه بیمه برای هر نفر (تومان)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.premium}
                      onChange={(e) => setForm({ ...form, premium: e.target.value })}
                      placeholder="مثال: 150000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>توضیحات (اختیاری)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="شرایط و جزئیات پوشش بیمه..."
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

        <div className="insurances-table-wrapper">
          <table className="insurances-table">
            <thead>
              <tr>
                <th>نام بیمه‌نامه</th>
                <th>نوع</th>
                <th>مبلغ پوشش</th>
                <th>هزینه هر نفر</th>
                <th>توضیحات</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => {
                const meta = INSURANCE_TYPE_META[policy.insuranceType] || INSURANCE_TYPE_META.OTHER;
                return (
                  <tr key={policy.id}>
                    <td><strong>{policy.name}</strong></td>
                    <td>
                      <span className="status-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(policy.coverageAmount)}</td>
                    <td>{formatPrice(policy.premium)}</td>
                    <td className="description-cell" title={policy.description || ""}>{policy.description || "-"}</td>
                    <td className="actions-cell">
                      <button className="action-btn edit" onClick={() => startEdit(policy)} title="ویرایش">
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => { setDeletingId(policy.id); setShowDeleteModal(true); }}
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
          {filteredPolicies.length === 0 && (
            <div className="empty-state">
              <p>هیچ بیمه‌نامه‌ای ثبت نشده است</p>
              <button className="btn-add" onClick={() => { resetForm(); setEditingPolicy(null); setShowForm(true); }}>
                افزودن اولین بیمه‌نامه
              </button>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={showDeleteModal}
          title="حذف بیمه‌نامه"
          message="آیا از حذف این بیمه‌نامه اطمینان دارید؟"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default InsurancesManagement;
