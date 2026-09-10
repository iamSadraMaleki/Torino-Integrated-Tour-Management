import React, { useState, useEffect } from "react";
import { UserBankAccount as UserBankAccountType, UserBankAccountRequest } from "../../../Types/user";
import { userBankAccountApi } from "../../../Services/userProfileApi";
import UserBankAccountForm from "./UserBankAccountForm";
import UserConfirmModal from "./UserConfirmModal";
import "./UserBankAccount.css";

const UserBankAccount: React.FC = () => {
  const [bankAccount, setBankAccount] = useState<UserBankAccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBankAccount = async () => {
    setIsFetching(true);
    try {
      const response = await userBankAccountApi.getBankAccount();
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

  const handleCreate = async (data: UserBankAccountRequest) => {
    setIsLoading(true);
    try {
      const response = await userBankAccountApi.createBankAccount(data);
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

  const handleUpdate = async (data: UserBankAccountRequest) => {
    setIsLoading(true);
    try {
      const response = await userBankAccountApi.updateBankAccount(data);
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
      const response = await userBankAccountApi.deleteBankAccount();
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
    <div className="user-bank-account-container">
      {message && (
        <div className={`user-bank-toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="user-bank-account-header">
        <h2>اطلاعات بانکی</h2>
        {hasBankAccount && (
          <button
            className="user-bank-btn-delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            🗑️ حذف اطلاعات بانکی
          </button>
        )}
      </div>

      <div className="user-bank-account-card">
        {isFetching ? (
          <div className="user-bank-loading-state">
            <div className="user-bank-spinner"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : hasBankAccount ? (
          <>
            <div className="user-bank-account-info">
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">نام صاحب حساب:</span>
                <span className="user-bank-info-value">{bankAccount.accountHolderName}</span>
              </div>
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">نام بانک:</span>
                <span className="user-bank-info-value">{bankAccount.bankName}</span>
              </div>
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">شماره حساب:</span>
                <span className="user-bank-info-value">{bankAccount.accountNumber}</span>
              </div>
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">شماره شبا (IBAN):</span>
                <span className="user-bank-info-value user-bank-iban">{bankAccount.iban}</span>
              </div>
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">شماره کارت:</span>
                <span className="user-bank-info-value user-bank-card-number">{formatCardNumber(bankAccount.cardNumber)}</span>
              </div>
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">تاریخ ثبت:</span>
                <span className="user-bank-info-value">{new Date(bankAccount.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="user-bank-info-row">
                <span className="user-bank-info-label">آخرین ویرایش:</span>
                <span className="user-bank-info-value">{new Date(bankAccount.updatedAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
            <div className="user-bank-account-form-wrapper">
              <h3>ویرایش اطلاعات بانکی</h3>
              <UserBankAccountForm
                initialData={bankAccount}
                onSubmit={handleUpdate}
                isLoading={isLoading}
                mode="edit"
              />
            </div>
          </>
        ) : (
          <div className="user-bank-no-data-state">
            <div className="user-bank-no-data-icon">🏦</div>
            <h3>اطلاعات بانکی ثبت نشده است</h3>
            <p>لطفاً اطلاعات حساب بانکی خود را ثبت کنید</p>
            <div className="user-bank-account-form-wrapper">
              <UserBankAccountForm
                onSubmit={handleCreate}
                isLoading={isLoading}
                mode="create"
              />
            </div>
          </div>
        )}
      </div>

      <UserConfirmModal
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

export default UserBankAccount;
