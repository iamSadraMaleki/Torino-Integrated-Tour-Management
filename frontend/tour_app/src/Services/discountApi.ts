import api from "../Router/api";
import { ApiResponse } from "../Types/reservation";
import {
  DiscountCode,
  DiscountCodeRequest,
  TourSpecialDiscount,
  TourSpecialDiscountRequest,
} from "../Types/discount";

export const userDiscountApi = {
  getSpecialTours: async (): Promise<ApiResponse<TourSpecialDiscount[]>> => {
    const response = await api.get("/api/user/tours/special");
    return response.data;
  },
  /** بررسی اعتبار کد تخفیف بدون مصرف — درصد تخفیف را برمی‌گرداند */
  validateCode: async (code: string): Promise<ApiResponse<number>> => {
    const response = await api.get("/api/user/discounts/validate", {
      params: { code },
    });
    return response.data;
  },
};

export const ceoDiscountApi = {
  getSpecials: async (): Promise<ApiResponse<TourSpecialDiscount[]>> => {
    const response = await api.get("/api/ceo/discounts/special");
    return response.data;
  },
  createSpecial: async (
    data: TourSpecialDiscountRequest
  ): Promise<ApiResponse<TourSpecialDiscount>> => {
    const response = await api.post("/api/ceo/discounts/special", data);
    return response.data;
  },
  toggleSpecial: async (
    id: number,
    active: boolean
  ): Promise<ApiResponse<TourSpecialDiscount>> => {
    const response = await api.put(`/api/ceo/discounts/special/${id}/toggle`, null, {
      params: { active },
    });
    return response.data;
  },
  deleteSpecial: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/discounts/special/${id}`);
    return response.data;
  },
  getCodes: async (): Promise<ApiResponse<DiscountCode[]>> => {
    const response = await api.get("/api/ceo/discounts/codes");
    return response.data;
  },
  createCode: async (
    data: DiscountCodeRequest
  ): Promise<ApiResponse<DiscountCode>> => {
    const response = await api.post("/api/ceo/discounts/codes", data);
    return response.data;
  },
  toggleCode: async (id: number, active: boolean): Promise<ApiResponse<DiscountCode>> => {
    const response = await api.put(`/api/ceo/discounts/codes/${id}/toggle`, null, {
      params: { active },
    });
    return response.data;
  },
  deleteCode: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/discounts/codes/${id}`);
    return response.data;
  },
};

export const adminDiscountApi = {
  getSpecials: async (): Promise<ApiResponse<TourSpecialDiscount[]>> => {
    const response = await api.get("/api/admin/discounts/special");
    return response.data;
  },
  deleteSpecial: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/discounts/special/${id}`);
    return response.data;
  },
  toggleSpecial: async (id: number, active: boolean): Promise<ApiResponse<TourSpecialDiscount>> => {
    const response = await api.put(`/api/admin/discounts/special/${id}/toggle`, null, {
      params: { active },
    });
    return response.data;
  },
  getCodes: async (): Promise<ApiResponse<DiscountCode[]>> => {
    const response = await api.get("/api/admin/discounts/codes");
    return response.data;
  },
  createCode: async (
    data: DiscountCodeRequest
  ): Promise<ApiResponse<DiscountCode>> => {
    const response = await api.post("/api/admin/discounts/codes", data);
    return response.data;
  },
  toggleCode: async (id: number, active: boolean): Promise<ApiResponse<DiscountCode>> => {
    const response = await api.put(`/api/admin/discounts/codes/${id}/toggle`, null, {
      params: { active },
    });
    return response.data;
  },
  deleteCode: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/discounts/codes/${id}`);
    return response.data;
  },
};
