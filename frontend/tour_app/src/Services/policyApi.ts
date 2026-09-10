// فایل: src/Services/policyApi.ts
import api from "../Router/api";
import { CancellationPolicy, CancellationPolicyRequest, ApiResponse } from "../Types/policy";

export const policyApi = {
  // ایجاد سیاست جدید
  createPolicy: async (data: CancellationPolicyRequest): Promise<ApiResponse<CancellationPolicy>> => {
    const response = await api.post("/api/ceo/policies", data);
    return response.data;
  },

  // دریافت همه سیاست‌ها
  getMyPolicies: async (): Promise<ApiResponse<CancellationPolicy[]>> => {
    const response = await api.get("/api/ceo/policies");
    return response.data;
  },

  // دریافت سیاست توسط ID
  getPolicyById: async (policyId: number): Promise<ApiResponse<CancellationPolicy>> => {
    const response = await api.get(`/api/ceo/policies/${policyId}`);
    return response.data;
  },

  // ویرایش سیاست
  updatePolicy: async (policyId: number, data: CancellationPolicyRequest): Promise<ApiResponse<CancellationPolicy>> => {
    const response = await api.put(`/api/ceo/policies/${policyId}`, data);
    return response.data;
  },

  // حذف سیاست
  deletePolicy: async (policyId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/policies/${policyId}`);
    return response.data;
  },

  // تنظیم به عنوان پیش‌فرض
  setDefaultPolicy: async (policyId: number): Promise<ApiResponse<CancellationPolicy>> => {
    const response = await api.patch(`/api/ceo/policies/${policyId}/set-default`);
    return response.data;
  },

  // دریافت سیاست پیش‌فرض
  getDefaultPolicy: async (): Promise<ApiResponse<CancellationPolicy>> => {
    const response = await api.get("/api/ceo/policies/default");
    return response.data;
  },
};