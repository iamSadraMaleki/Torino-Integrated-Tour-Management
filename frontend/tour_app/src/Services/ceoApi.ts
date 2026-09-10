import api from "../Router/api";
import {
  CeoProfile,
  CeoProfileRequest,
  BankAccount,
  BankAccountRequest,
  AuditLog,
  CeoApiResponse,
} from "../Types/ceo";

// ========== CEO Profile APIs ==========
export const ceoProfileApi = {
  // ایجاد پروفایل
  createProfile: async (data: CeoProfileRequest): Promise<CeoApiResponse<CeoProfile>> => {
    const response = await api.post<CeoApiResponse<CeoProfile>>("/api/ceo/profile", data);
    return response.data;
  },

  // دریافت پروفایل
  getProfile: async (): Promise<CeoApiResponse<CeoProfile>> => {
    const response = await api.get<CeoApiResponse<CeoProfile>>("/api/ceo/profile");
    return response.data;
  },

  // ویرایش پروفایل
  updateProfile: async (data: CeoProfileRequest): Promise<CeoApiResponse<CeoProfile>> => {
    const response = await api.put<CeoApiResponse<CeoProfile>>("/api/ceo/profile", data);
    return response.data;
  },

  // حذف پروفایل
  deleteProfile: async (): Promise<CeoApiResponse<null>> => {
    const response = await api.delete<CeoApiResponse<null>>("/api/ceo/profile");
    return response.data;
  },

  // دریافت تاریخچه پروفایل
  getProfileHistory: async (): Promise<CeoApiResponse<AuditLog[]>> => {
    const response = await api.get<CeoApiResponse<AuditLog[]>>("/api/ceo/profile/history");
    return response.data;
  },
};

// ========== Bank Account APIs ==========
export const bankAccountApi = {
  // ایجاد حساب بانکی
  createBankAccount: async (data: BankAccountRequest): Promise<CeoApiResponse<BankAccount>> => {
    const response = await api.post<CeoApiResponse<BankAccount>>("/api/ceo/bank-account", data);
    return response.data;
  },

  // دریافت حساب بانکی
  getBankAccount: async (): Promise<CeoApiResponse<BankAccount>> => {
    const response = await api.get<CeoApiResponse<BankAccount>>("/api/ceo/bank-account");
    return response.data;
  },

  // ویرایش حساب بانکی
  updateBankAccount: async (data: BankAccountRequest): Promise<CeoApiResponse<BankAccount>> => {
    const response = await api.put<CeoApiResponse<BankAccount>>("/api/ceo/bank-account", data);
    return response.data;
  },

  // حذف حساب بانکی
  deleteBankAccount: async (): Promise<CeoApiResponse<null>> => {
    const response = await api.delete<CeoApiResponse<null>>("/api/ceo/bank-account");
    return response.data;
  },

  // دریافت تاریخچه حساب بانکی
  getBankAccountHistory: async (): Promise<CeoApiResponse<AuditLog[]>> => {
    const response = await api.get<CeoApiResponse<AuditLog[]>>("/api/ceo/bank-account/history");
    return response.data;
  },
};