// فایل: src/Components/ceo/policy/PolicyFormModal.tsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaClock, FaPercent } from "react-icons/fa";
import { CancellationPolicy, CancellationPolicyClause, CancellationPolicyRequest } from "../../../Types/policy";

interface PolicyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CancellationPolicyRequest) => void;
  initialData?: CancellationPolicy;
  isLoading: boolean;
}

const emptyClause = (): CancellationPolicyClause => ({
  hoursBeforeDeparture: 24,
  refundPercentage: 50,
});

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    policyName: "",
    description: "",
    isDefault: false,
    isActive: true,
  });

  const [clauses, setClauses] = useState<CancellationPolicyClause[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        policyName: initialData.policyName,
        description: initialData.description || "",
        isDefault: initialData.isDefault,
        isActive: initialData.isActive,
      });
      // اگر بند دارد از همان استفاده کن، وگرنه از فیلدهای قدیمی یک بند بساز
      const sourceClauses =
        initialData.clauses && initialData.clauses.length > 0
          ? initialData.clauses
          : [
              {
                hoursBeforeDeparture: initialData.hoursBeforeDeparture,
                refundPercentage: initialData.refundPercentage,
              },
            ];
      setClauses(sourceClauses.map((c) => ({ ...c })));
    } else {
      setFormData({
        policyName: "",
        description: "",
        isDefault: false,
        isActive: true,
      });
      // پیش‌فرض: دو بند نمونه (۷۲ ساعت → ۱۰۰٪ و ۲۴ ساعت → ۵۰٪)
      setClauses([
        { hoursBeforeDeparture: 72, refundPercentage: 100 },
        { hoursBeforeDeparture: 24, refundPercentage: 50 },
      ]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const updateClause = (index: number, field: keyof CancellationPolicyClause, value: number) => {
    setClauses((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addClause = () => {
    setClauses((prev) => [...prev, emptyClause()]);
  };

  const removeClause = (index: number) => {
    setClauses((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.policyName.trim()) {
      newErrors.policyName = "نام سیاست الزامی است";
    } else if (formData.policyName.length < 3) {
      newErrors.policyName = "نام سیاست باید حداقل 3 کاراکتر باشد";
    }
    if (clauses.length === 0) {
      newErrors.clauses = "حداقل یک بند لغو باید تعریف شود";
    }
    const seenHours = new Set<number>();
    clauses.forEach((c, i) => {
      if (c.hoursBeforeDeparture < 0 || c.hoursBeforeDeparture > 720) {
        newErrors[`clause-${i}`] = "ساعت باید بین 0 تا 720 باشد";
      }
      if (c.refundPercentage < 0 || c.refundPercentage > 100) {
        newErrors[`clause-${i}`] = "درصد باید بین 0 تا 100 باشد";
      }
      if (seenHours.has(c.hoursBeforeDeparture)) {
        newErrors[`clause-${i}`] = "ساعت‌های تکراری مجاز نیستند";
      }
      seenHours.add(c.hoursBeforeDeparture);
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // مرتب‌سازی بندها از بیشترین ساعت به کمترین برای نمایش بهتر
    const sorted = [...clauses].sort(
      (a, b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture
    );

    onSubmit({
      policyName: formData.policyName.trim(),
      description: formData.description,
      clauses: sorted,
      isDefault: formData.isDefault,
      isActive: formData.isActive,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <h3>{initialData ? "ویرایش سیاست لغو" : "افزودن سیاست لغو جدید"}</h3>
          <button className="policy-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="policy-modal-body">
            <div className="policy-form-group">
              <label>نام سیاست <span className="required">*</span></label>
              <input
                type="text"
                placeholder="مثلاً: سیاست استاندارد"
                value={formData.policyName}
                onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                className={errors.policyName ? "invalid" : ""}
              />
              {errors.policyName && <span className="error-text">{errors.policyName}</span>}
            </div>

            <div className="policy-form-group">
              <label>توضیحات</label>
              <textarea
                placeholder="توضیحات اختیاری..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* بندهای لغو */}
            <div className="policy-form-group">
              <div className="policy-clauses-header">
                <label>
                  بندهای لغو <span className="required">*</span>
                </label>
                <button
                  type="button"
                  className="policy-clause-add-btn"
                  onClick={addClause}
                  disabled={isLoading}
                >
                  <FaPlus /> افزودن بند
                </button>
              </div>
              <small>
                هر بند یعنی: «در صورت لغو حداقل X ساعت قبل از حرکت، Y درصد مبلغ برگشت داده می‌شود»
              </small>

              {errors.clauses && <span className="error-text">{errors.clauses}</span>}

              {clauses.map((clause, index) => (
                <div key={index} className="policy-clause-row">
                  <div className="policy-clause-input">
                    <FaClock className="policy-icon" />
                    <input
                      type="number"
                      min={0}
                      max={720}
                      placeholder="ساعت قبل از حرکت"
                      value={clause.hoursBeforeDeparture}
                      onChange={(e) =>
                        updateClause(index, "hoursBeforeDeparture", parseInt(e.target.value) || 0)
                      }
                      className={errors[`clause-${index}`] ? "invalid" : ""}
                    />
                    <span className="policy-clause-unit">ساعت</span>
                  </div>
                  <div className="policy-clause-input">
                    <FaPercent className="policy-icon" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="درصد برگشت"
                      value={clause.refundPercentage}
                      onChange={(e) =>
                        updateClause(index, "refundPercentage", parseFloat(e.target.value) || 0)
                      }
                      className={errors[`clause-${index}`] ? "invalid" : ""}
                    />
                    <span className="policy-clause-unit">٪</span>
                  </div>
                  <button
                    type="button"
                    className="policy-clause-remove-btn"
                    onClick={() => removeClause(index)}
                    disabled={isLoading || clauses.length === 1}
                    title={clauses.length === 1 ? "حداقل یک بند لازم است" : "حذف بند"}
                  >
                    <FaTrash />
                  </button>
                  {errors[`clause-${index}`] && (
                    <span className="error-text clause-error">{errors[`clause-${index}`]}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="policy-form-row">
              <div className="policy-form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  تنظیم به عنوان سیاست پیش‌فرض
                </label>
                <small>اگر فعال باشد، این سیاست به عنوان پیش‌فرض برای همه رزروها استفاده می‌شود</small>
              </div>

              <div className="policy-form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  فعال
                </label>
                <small>سیاست‌های غیرفعال در لیست رزرو نمایش داده نمی‌شوند</small>
              </div>
            </div>
          </div>
          <div className="policy-modal-footer">
            <button type="button" className="policy-btn-cancel" onClick={onClose}>
              انصراف
            </button>
            <button type="submit" className="policy-btn-submit" disabled={isLoading}>
              {isLoading ? <div className="policy-spinner-small" /> : (initialData ? "ویرایش" : "افزودن")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyFormModal;