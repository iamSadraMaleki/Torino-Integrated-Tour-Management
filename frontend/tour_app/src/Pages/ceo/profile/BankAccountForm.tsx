import React, { useState, useEffect } from "react";
import { BankAccount, BankAccountRequest } from "../../../Types/ceo";
import "./BankAccountForm.css";

interface BankAccountFormProps {
  initialData?: BankAccount;
  onSubmit: (data: BankAccountRequest) => Promise<void>;
  isLoading: boolean;
  mode: "create" | "edit";
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  mode,
}) => {
  const [formData, setFormData] = useState<BankAccountRequest>({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
    cardNumber: "",
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        accountHolderName: initialData.accountHolderName || "",
        bankName: initialData.bankName || "",
        accountNumber: initialData.accountNumber || "",
        iban: initialData.iban || "",
        cardNumber: initialData.cardNumber || "",
      });
    }
  }, [initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // فرمت کردن شماره کارت با فاصله هر ۴ رقم
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  return (
    <form className="bank-account-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>نام صاحب حساب</label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            placeholder="نام و نام خانوادگی صاحب حساب"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>نام بانک</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="نام بانک را وارد کنید"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>شماره حساب</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="شماره حساب را وارد کنید"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>شماره شبا (IBAN)</label>
          <input
            type="text"
            name="iban"
            value={formData.iban}
            onChange={handleChange}
            placeholder="IR123456789012345678901234"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>شماره کارت بانکی</label>
        <input
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          placeholder="۱۶ رقم شماره کارت"
          maxLength={19}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : mode === "create" ? "ثبت اطلاعات بانکی" : "ویرایش اطلاعات بانکی"}
        </button>
      </div>
    </form>
  );
};

export default BankAccountForm;