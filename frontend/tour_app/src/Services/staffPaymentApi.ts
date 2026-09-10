import api from "../Router/api";
import {
  StaffPayment,
  StaffPaymentRequest,
  StaffPaymentStats,
  StaffTourHistory,
} from "../Types/staffPayment";
import { StaffApiResponse } from "../Types/staff";

// ========== دفتر پرداخت حقوق کارکنان ==========
export const staffPaymentApi = {
  // ثبت پرداخت (حقوق/پاداش)
  record: async (data: StaffPaymentRequest): Promise<StaffApiResponse<StaffPayment>> => {
    const response = await api.post("/api/ceo/staff/payments", data);
    return response.data;
  },

  // همه پرداخت‌ها
  getAll: async (): Promise<StaffApiResponse<StaffPayment[]>> => {
    const response = await api.get("/api/ceo/staff/payments");
    return response.data;
  },

  // پرداخت‌های یک کارمند
  getByStaff: async (staffId: number): Promise<StaffApiResponse<StaffPayment[]>> => {
    const response = await api.get(`/api/ceo/staff/payments/staff/${staffId}`);
    return response.data;
  },

  // آمار پرداختی
  getStatistics: async (): Promise<StaffApiResponse<StaffPaymentStats>> => {
    const response = await api.get("/api/ceo/staff/payments/statistics");
    return response.data;
  },

  // حذف پرداخت
  remove: async (paymentId: number): Promise<StaffApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/staff/payments/${paymentId}`);
    return response.data;
  },
};

// ========== تاریخچه سفر کارمند ==========
export const staffTourHistoryApi = {
  getToursByStaff: async (staffId: number): Promise<StaffApiResponse<StaffTourHistory[]>> => {
    const response = await api.get(`/api/ceo/staff/members/${staffId}/tours`);
    return response.data;
  },
};
