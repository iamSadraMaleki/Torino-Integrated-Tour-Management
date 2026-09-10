// فایل: src/Components/ceo/policy/PoliciesManagement.tsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaStar, FaCheckCircle, FaTimesCircle, FaClock, FaPercent } from "react-icons/fa";
import { policyApi } from "../../../Services/policyApi";
import { CancellationPolicy, CancellationPolicyRequest } from "../../../Types/policy";
import PolicyFormModal from "./PolicyFormModal";
import PolicyStatusBadge from "./PolicyStatusBadge";
import ConfirmModal from "../profile/ConfirmModal";
import "./PoliciesManagement.css";

const PoliciesManagement: React.FC = () => {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CancellationPolicy | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await policyApi.getMyPolicies();
      if (response.success) {
        setPolicies(response.data);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      showMessage("error", "خطا در دریافت سیاست‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CancellationPolicyRequest) => {
    setIsSubmitting(true);
    try {
      const response = await policyApi.createPolicy(data);
      if (response.success) {
        showMessage("success", response.message);
        await fetchPolicies();
        setShowForm(false);
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در ایجاد سیاست");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: CancellationPolicyRequest) => {
    if (!editingPolicy) return;
    setIsSubmitting(true);
    try {
      const response = await policyApi.updatePolicy(editingPolicy.id, data);
      if (response.success) {
        showMessage("success", response.message);
        await fetchPolicies();
        setShowForm(false);
        setEditingPolicy(null);
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در ویرایش سیاست");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await policyApi.deletePolicy(deletingId);
      if (response.success) {
        showMessage("success", response.message);
        await fetchPolicies();
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در حذف سیاست");
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (policyId: number) => {
    try {
      const response = await policyApi.setDefaultPolicy(policyId);
      if (response.success) {
        showMessage("success", "سیاست پیش‌فرض با موفقیت تنظیم شد");
        await fetchPolicies();
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در تنظیم سیاست پیش‌فرض");
    }
  };

  const formatRefundMessage = (refundPercentage: number, hours: number) => {
    if (refundPercentage === 0) {
      return `در صورت لغو ${hours} ساعت قبل از حرکت، هیچ مبلغی برگشت داده نمی‌شود`;
    }
    if (refundPercentage === 100) {
      return `در صورت لغو ${hours} ساعت قبل از حرکت، کل مبلغ برگشت داده می‌شود`;
    }
    return `در صورت لغو ${hours} ساعت قبل از حرکت، ${refundPercentage}٪ مبلغ برگشت داده می‌شود`;
  };

  // بندهای سیاست (سازگاری با سیاست‌های قدیمی بدون بند)
  const getClauses = (policy: CancellationPolicy) => {
    if (policy.clauses && policy.clauses.length > 0) {
      return policy.clauses;
    }
    return [
      {
        hoursBeforeDeparture: policy.hoursBeforeDeparture,
        refundPercentage: policy.refundPercentage,
      },
    ];
  };

  if (loading) {
    return (
      <div className="policy-loading">
        <div className="policy-spinner"></div>
        <p>در حال بارگذاری سیاست‌ها...</p>
      </div>
    );
  }

  return (
    <div className="policies-container">
      {message && (
        <div className={`policy-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="policy-header">
        <h2>
          <span>📋</span> مدیریت سیاست‌های لغو
        </h2>
        <button className="policy-btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن سیاست جدید
        </button>
      </div>

      <div className="policy-description">
        <p>
          در این بخش می‌توانید قوانین لغو سفر خود را تعریف کنید. هر قانون شامل مدت زمان قبل از حرکت 
          و درصد مبلغی است که به مشتری برگشت داده می‌شود. می‌توانید چندین سیاست داشته باشید 
          و یکی را به عنوان پیش‌فرض انتخاب کنید.
        </p>
      </div>

      {policies.length === 0 ? (
        <div className="policy-no-data">
          <FaPercent />
          <p>هیچ سیاست لغویی ثبت نشده است</p>
          <button className="policy-btn-add" onClick={() => setShowForm(true)}>
            افزودن سیاست جدید
          </button>
        </div>
      ) : (
        <div className="policies-grid">
          {policies.map((policy) => (
            <div key={policy.id} className={`policy-card ${policy.isDefault ? "default" : ""}`}>
              {policy.isDefault && (
                <div className="policy-default-badge">
                  <FaStar /> پیش‌فرض
                </div>
              )}
              <div className="policy-card-header">
                <h3>{policy.policyName}</h3>
                <div className="policy-card-actions">
                  <button 
                    className="policy-btn-default" 
                    onClick={() => handleSetDefault(policy.id)}
                    disabled={policy.isDefault}
                    title={policy.isDefault ? "این سیاست در حال حاضر پیش‌فرض است" : "تنظیم به عنوان پیش‌فرض"}
                  >
                    <FaStar />
                  </button>
                  <button 
                    className="policy-btn-edit" 
                    onClick={() => {
                      setEditingPolicy(policy);
                      setShowForm(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="policy-btn-delete" 
                    onClick={() => {
                      setDeletingId(policy.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="policy-card-body">
                {policy.description && (
                  <p className="policy-description-text">{policy.description}</p>
                )}
                <div className="policy-rule">
                  <div className="policy-rule-header">
                    <span>📋 بندهای لغو</span>
                    <span className="policy-clause-count">{getClauses(policy).length} بند</span>
                  </div>
                  {getClauses(policy).map((clause, idx) => (
                    <div key={idx} className="policy-rule-item">
                      <FaClock className="policy-icon" />
                      <div className="policy-clause-text">
                        <span className="policy-label">حداقل {clause.hoursBeforeDeparture} ساعت قبل از حرکت:</span>
                        <strong className={`refund-${clause.refundPercentage === 100 ? 'full' : clause.refundPercentage === 0 ? 'none' : 'partial'}`}>
                          {clause.refundPercentage}% برگشت
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
                {getClauses(policy).map((clause, idx) => (
                  <div key={idx} className="policy-message">
                    {formatRefundMessage(clause.refundPercentage, clause.hoursBeforeDeparture)}
                  </div>
                ))}
              </div>
              <div className="policy-card-footer">
                <PolicyStatusBadge isActive={policy.isActive} isDefault={policy.isDefault} />
                <span className="policy-date">
                  ایجاد: {new Date(policy.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <PolicyFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPolicy(null);
        }}
        onSubmit={editingPolicy ? handleUpdate : handleCreate}
        initialData={editingPolicy || undefined}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف سیاست لغو"
        message="آیا از حذف این سیاست اطمینان دارید؟ در صورت حذف، این سیاست از لیست سیاست‌ها حذف خواهد شد."
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PoliciesManagement;