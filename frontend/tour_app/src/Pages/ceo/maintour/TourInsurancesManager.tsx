import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaShieldAlt, FaSync, FaSave } from "react-icons/fa";
import { tourInsuranceApi, insuranceApi } from "../../../Services/insuranceApi";
import {
  TourInsurance,
  InsurancePolicy,
  TourInsuranceRequest,
  INSURANCE_TYPE_META,
} from "../../../Types/insurance";
import ConfirmModal from "../profile/ConfirmModal";
import "./TourInsurancesManager.css";

interface TourInsurancesManagerProps {
  tourId: number;
  tourName: string;
  onClose: () => void;
  onRefresh: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const TourInsurancesManager: React.FC<TourInsurancesManagerProps> = ({
  tourId,
  tourName,
  onClose,
  onRefresh,
}) => {
  const [tourInsurances, setTourInsurances] = useState<TourInsurance[]>([]);
  const [availablePolicies, setAvailablePolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<TourInsurance | null>(null);
  const [formData, setFormData] = useState({
    insurancePolicyId: 0,
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingInsurance, setDeletingInsurance] = useState<TourInsurance | null>(null);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insurancesRes, policiesRes] = await Promise.all([
        tourInsuranceApi.getByTour(tourId),
        insuranceApi.getAll(),
      ]);
      setTourInsurances(insurancesRes);
      setAvailablePolicies(policiesRes);
    } catch (error) {
      console.error("Error fetching insurances:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات بیمه‌ها" });
    } finally {
      setLoading(false);
    }
  };

  // بیمه‌هایی که هنوز به تور اضافه نشدن
  const getUnassignedPolicies = () => {
    const assignedIds = tourInsurances.map((i) => i.insurancePolicyId);
    return availablePolicies.filter((p) => !assignedIds.includes(p.id));
  };

  const unassignedPolicies = getUnassignedPolicies();

  const handleAdd = async () => {
    if (!formData.insurancePolicyId) {
      setMessage({ type: "error", text: "لطفاً بیمه‌نامه را انتخاب کنید" });
      return;
    }
    if (formData.price <= 0) {
      setMessage({ type: "error", text: "قیمت باید بزرگتر از 0 باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: TourInsuranceRequest = {
        tourId: tourId,
        insurancePolicyId: formData.insurancePolicyId,
        price: formData.price,
      };
      await tourInsuranceApi.add(request);
      setMessage({ type: "success", text: "بیمه با موفقیت به تور اضافه شد" });
      setFormData({ insurancePolicyId: 0, price: 0 });
      setShowAddForm(false);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در افزودن بیمه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingInsurance) return;
    if (formData.price <= 0) {
      setMessage({ type: "error", text: "قیمت باید بزرگتر از 0 باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: TourInsuranceRequest = {
        tourId: tourId,
        insurancePolicyId: formData.insurancePolicyId,
        price: formData.price,
      };
      await tourInsuranceApi.update(editingInsurance.id, request);
      setMessage({ type: "success", text: "بیمه با موفقیت ویرایش شد" });
      setEditingInsurance(null);
      setFormData({ insurancePolicyId: 0, price: 0 });
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش بیمه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deletingInsurance) return;

    setIsSubmitting(true);
    try {
      await tourInsuranceApi.remove(deletingInsurance.id);
      setMessage({ type: "success", text: "بیمه با موفقیت از تور حذف شد" });
      setShowDeleteModal(false);
      setDeletingInsurance(null);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف بیمه" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (insurance: TourInsurance) => {
    setEditingInsurance(insurance);
    setFormData({
      insurancePolicyId: insurance.insurancePolicyId,
      price: insurance.price,
    });
  };

  const cancelEdit = () => {
    setEditingInsurance(null);
    setFormData({ insurancePolicyId: 0, price: 0 });
  };

  if (loading) {
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
      <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3><FaShieldAlt /> مدیریت بیمه‌های تور - {tourName}</h3>
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

          {/* دکمه افزودن بیمه */}
          <div className="tour-insurances-add-btn">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add-insurance"
              disabled={unassignedPolicies.length === 0}
            >
              <FaPlus /> افزودن بیمه به تور
            </button>
            {unassignedPolicies.length === 0 && availablePolicies.length > 0 && (
              <span className="no-insurance-warning">همه بیمه‌ها به این تور اضافه شده‌اند</span>
            )}
            {availablePolicies.length === 0 && (
              <span className="no-insurance-warning">
                ابتدا از بخش «مدیریت بیمه‌های سفر» بیمه‌نامه ثبت کنید
              </span>
            )}
          </div>

          {/* فرم افزودن بیمه */}
          {showAddForm && (
            <div className="tour-add-insurance-form">
              <div className="form-row">
                <div className="form-group">
                  <label>انتخاب بیمه‌نامه</label>
                  <select
                    value={formData.insurancePolicyId}
                    onChange={(e) => setFormData({ ...formData, insurancePolicyId: parseInt(e.target.value) })}
                    disabled={isSubmitting}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {unassignedPolicies.map((policy) => (
                      <option key={policy.id} value={policy.id}>
                        {policy.name} - {INSURANCE_TYPE_META[policy.insuranceType]?.label || policy.insuranceType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>قیمت برای هر نفر (تومان)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleAdd} className="btn-submit-sm" disabled={!formData.insurancePolicyId || isSubmitting}>
                    {isSubmitting ? "در حال افزودن..." : "افزودن"}
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* فرم ویرایش بیمه */}
          {editingInsurance && (
            <div className="tour-edit-insurance-form">
              <div className="form-header">
                <h4>ویرایش بیمه: {editingInsurance.policyName}</h4>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>قیمت برای هر نفر (تومان)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleUpdate} className="btn-submit-sm" disabled={isSubmitting}>
                    <FaSave /> {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
                  </button>
                  <button onClick={cancelEdit} className="btn-cancel-sm">انصراف</button>
                </div>
              </div>
            </div>
          )}

          {/* لیست بیمه‌های تور */}
          <div className="tour-insurances-list">
            <h4>بیمه‌های تخصیص داده شده به تور</h4>
            {tourInsurances.length === 0 ? (
              <div className="no-insurances">
                <FaShieldAlt />
                <p>هیچ بیمه‌ای به این تور اضافه نشده است</p>
              </div>
            ) : (
              <div className="insurances-list">
                {tourInsurances.map((insurance) => {
                  const meta = INSURANCE_TYPE_META[insurance.policyType] || INSURANCE_TYPE_META.OTHER;
                  return (
                    <div key={insurance.id} className="insurance-item">
                      <div className="insurance-icon">🛡️</div>
                      <div className="insurance-info">
                        <div className="insurance-name">{insurance.policyName}</div>
                        <div className="insurance-details">
                          <span>{meta.icon} {meta.label}</span>
                          <span>💰 پوشش: {formatPrice(insurance.coverageAmount)}</span>
                          <span>👤 قیمت هر نفر: {formatPrice(insurance.price)}</span>
                        </div>
                      </div>
                      <div className="insurance-actions">
                        <button
                          className="btn-edit-insurance"
                          onClick={() => startEdit(insurance)}
                          title="ویرایش قیمت"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-remove-insurance"
                          onClick={() => {
                            setDeletingInsurance(insurance);
                            setShowDeleteModal(true);
                          }}
                          title="حذف از تور"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>بستن</button>
          <button className="tour-btn-refresh" onClick={fetchData}>
            <FaSync /> بروزرسانی
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف بیمه از تور"
        message={`آیا از حذف بیمه "${deletingInsurance?.policyName}" از این تور اطمینان دارید؟`}
        onConfirm={handleRemove}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingInsurance(null);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TourInsurancesManager;
