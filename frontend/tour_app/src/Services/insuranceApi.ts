import api from "../Router/api";
import {
  InsurancePolicy,
  InsurancePolicyRequest,
  TourInsurance,
  TourInsuranceRequest,
} from "../Types/insurance";

// ==================== بیمه‌های آژانس ====================
export const insuranceApi = {
  create: async (data: InsurancePolicyRequest): Promise<InsurancePolicy> => {
    const response = await api.post("/api/ceo/insurances", data);
    return response.data;
  },

  update: async (id: number, data: InsurancePolicyRequest): Promise<InsurancePolicy> => {
    const response = await api.put(`/api/ceo/insurances/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/insurances/${id}`);
  },

  getById: async (id: number): Promise<InsurancePolicy> => {
    const response = await api.get(`/api/ceo/insurances/${id}`);
    return response.data;
  },

  getAll: async (): Promise<InsurancePolicy[]> => {
    const response = await api.get("/api/ceo/insurances");
    return response.data;
  },
};

// ==================== بیمه‌های اختصاص‌یافته به تور ====================
export const tourInsuranceApi = {
  add: async (data: TourInsuranceRequest): Promise<TourInsurance> => {
    const response = await api.post("/api/ceo/tour-insurances", data);
    return response.data;
  },

  update: async (id: number, data: TourInsuranceRequest): Promise<TourInsurance> => {
    const response = await api.put(`/api/ceo/tour-insurances/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/tour-insurances/${id}`);
  },

  getByTour: async (tourId: number): Promise<TourInsurance[]> => {
    const response = await api.get(`/api/ceo/tour-insurances/tour/${tourId}`);
    return response.data;
  },
};
