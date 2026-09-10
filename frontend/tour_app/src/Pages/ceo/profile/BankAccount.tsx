import React, { useState, useEffect } from "react";
import { BankAccount as BankAccountType, BankAccountRequest } from "../../../Types/ceo";
import { bankAccountApi } from "../../../Services/ceoApi";
import BankAccountForm from "../profile/BankAccountForm";
import ConfirmModal from "../../ceo/profile/ConfirmModal";
import "./BankAccount.css";

const BankAccount: React.FC = () => {
  const [bankAccount, setBankAccount] = useState<BankAccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBankAccount = async () => {
    setIsFetching(true);
    try {
      const response = await bankAccountApi.getBankAccount();
      if (response.success && response.data) {
        setBankAccount(response.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        setMessage({ type: "error", text: "خطا در دریافت اطلاعات بانکی" });
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBankAccount();
  }, []);

  const handleCreate = async (data: BankAccountRequest) => {
    setIsLoading(true);
    try {
      const response = await bankAccountApi.createBankAccount(data);
      if (response.success) {
        setBankAccount(response.data);
        setMessage({ type: "success", text: response.message });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت اطلاعات بانکی" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: BankAccountRequest) => {
    setIsLoading(true);
    try {
      const response = await bankAccountApi.updateBankAccount(data);
      if (response.success) {
        setBankAccount(response.data);
        setMessage({ type: "success", text: response.message });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش اطلاعات بانکی" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await bankAccountApi.deleteBankAccount();
      if (response.success) {
        setBankAccount(null);
        setMessage({ type: "success", text: response.message });
        setTimeout(() => setMessage(null), 3000);
        setShowDeleteModal(false);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف اطلاعات بانکی" });
    } finally {
      setIsLoading(false);
    }
  };

  const hasBankAccount = !!bankAccount;

  // فرمت کردن شماره کارت
  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  return (
    <div className="bank-account-container">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="bank-account-header">
        <h2>اطلاعات بانکی</h2>
        {hasBankAccount && (
          <button
            className="btn-delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            🗑️ حذف اطلاعات بانکی
          </button>
        )}
      </div>

      <div className="bank-account-card">
        {isFetching ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : hasBankAccount ? (
          <>
            <div className="bank-account-info">
              <div className="info-row">
                <span className="info-label">نام صاحب حساب:</span>
                <span className="info-value">{bankAccount.accountHolderName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">نام بانک:</span>
                <span className="info-value">{bankAccount.bankName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">شماره حساب:</span>
                <span className="info-value">{bankAccount.accountNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">شماره شبا (IBAN):</span>
                <span className="info-value iban">{bankAccount.iban}</span>
              </div>
              <div className="info-row">
                <span className="info-label">شماره کارت:</span>
                <span className="info-value card-number">{formatCardNumber(bankAccount.cardNumber)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">تاریخ ثبت:</span>
                <span className="info-value">{new Date(bankAccount.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="info-row">
                <span className="info-label">آخرین ویرایش:</span>
                <span className="info-value">{new Date(bankAccount.updatedAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
            <div className="bank-account-form-wrapper">
              <h3>ویرایش اطلاعات بانکی</h3>
              <BankAccountForm
                initialData={bankAccount}
                onSubmit={handleUpdate}
                isLoading={isLoading}
                mode="edit"
              />
            </div>
          </>
        ) : (
          <div className="no-data-state">
            <div className="no-data-icon">🏦</div>
            <h3>اطلاعات بانکی ثبت نشده است</h3>
            <p>لطفاً اطلاعات حساب بانکی خود را ثبت کنید</p>
            <div className="bank-account-form-wrapper">
              <BankAccountForm
                onSubmit={handleCreate}
                isLoading={isLoading}
                mode="create"
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف اطلاعات بانکی"
        message="آیا از حذف اطلاعات بانکی خود اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BankAccount;