import api from "../Router/api";
import {
  UserProfile,
  UserProfileRequest,
  UserBankAccount,
  UserBankAccountRequest,
  UserAuditLog,
  UserApiResponse,
} from "../Types/user";

// ========== User Profile APIs ==========
export const userProfileApi = {
  // ایجاد پروفایل
  createProfile: async (data: UserProfileRequest): Promise<UserApiResponse<UserProfile>> => {
    const response = await api.post<UserApiResponse<UserProfile>>("/api/user/profile", data);
    return response.data;
  },

  // دریافت پروفایل
  getProfile: async (): Promise<UserApiResponse<UserProfile>> => {
    const response = await api.get<UserApiResponse<UserProfile>>("/api/user/profile");
    return response.data;
  },

  // ویرایش پروفایل
  updateProfile: async (data: UserProfileRequest): Promise<UserApiResponse<UserProfile>> => {
    const response = await api.put<UserApiResponse<UserProfile>>("/api/user/profile", data);
    return response.data;
  },

  // حذف پروفایل
  deleteProfile: async (): Promise<UserApiResponse<null>> => {
    const response = await api.delete<UserApiResponse<null>>("/api/user/profile");
    return response.data;
  },

  // دریافت تاریخچه پروفایل
  getProfileHistory: async (): Promise<UserApiResponse<UserAuditLog[]>> => {
    const response = await api.get<UserApiResponse<UserAuditLog[]>>("/api/user/profile/history");
    return response.data;
  },
};

// ========== User Bank Account APIs ==========
export const userBankAccountApi = {
  // ایجاد حساب بانکی
  createBankAccount: async (data: UserBankAccountRequest): Promise<UserApiResponse<UserBankAccount>> => {
    const response = await api.post<UserApiResponse<UserBankAccount>>("/api/user/bank-account", data);
    return response.data;
  },

  // دریافت حساب بانکی
  getBankAccount: async (): Promise<UserApiResponse<UserBankAccount>> => {
    const response = await api.get<UserApiResponse<UserBankAccount>>("/api/user/bank-account");
    return response.data;
  },

  // ویرایش حساب بانکی
  updateBankAccount: async (data: UserBankAccountRequest): Promise<UserApiResponse<UserBankAccount>> => {
    const response = await api.put<UserApiResponse<UserBankAccount>>("/api/user/bank-account", data);
    return response.data;
  },

  // حذف حساب بانکی
  deleteBankAccount: async (): Promise<UserApiResponse<null>> => {
    const response = await api.delete<UserApiResponse<null>>("/api/user/bank-account");
    return response.data;
  },

  // دریافت تاریخچه حساب بانکی
  getBankAccountHistory: async (): Promise<UserApiResponse<UserAuditLog[]>> => {
    const response = await api.get<UserApiResponse<UserAuditLog[]>>("/api/user/bank-account/history");
    return response.data;
  },
};
