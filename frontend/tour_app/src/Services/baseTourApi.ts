import api from "../Router/api";
import {
  BaseTour,
  BaseTourCreateRequest,
  BaseTourUpdateRequest,
  BaseTourDetails,
  TourStationsUpsertRequest,
  ApiResponse,
  Station,
  City,
} from "../Types/baseTour";

// ========== City APIs ==========
export const cityApi = {
  getCitiesByProvince: async (provinceId: number): Promise<City[]> => {
    const response = await api.get(`/api/ceo/geo/cities?provinceId=${provinceId}`);
    return response.data.data || response.data;
  },
};

// ========== Station APIs (برای انتخاب ایستگاه) ==========
export const stationApiForTour = {
  getMyStations: async (): Promise<Station[]> => {
    const response = await api.get("/api/ceo/stations");
    return response.data.data || response.data;
  },
};

// ========== Base Tour APIs ==========
export const baseTourApi = {
  // ایجاد تور پایه جدید
  createBaseTour: async (data: BaseTourCreateRequest): Promise<ApiResponse<BaseTour>> => {
    const response = await api.post("/api/ceo/base-tours", data);
    return response.data;
  },

  // دریافت لیست تورهای من
  getMyTours: async (): Promise<ApiResponse<BaseTour[]>> => {
    const response = await api.get("/api/ceo/base-tours");
    return response.data;
  },

  // دریافت جزئیات کامل تور
  getTourDetails: async (tourId: number): Promise<ApiResponse<BaseTourDetails>> => {
    const response = await api.get(`/api/ceo/base-tours/${tourId}`);
    return response.data;
  },

  // ویرایش تور پایه
  updateBaseTour: async (tourId: number, data: BaseTourUpdateRequest): Promise<ApiResponse<BaseTour>> => {
    const response = await api.put(`/api/ceo/base-tours/${tourId}`, data);
    return response.data;
  },

  // حذف تور پایه
  deleteBaseTour: async (tourId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/base-tours/${tourId}`);
    return response.data;
  },

  // ========== مدیریت ایستگاه‌های مبدا ==========
upsertOrigins: async (tourId: number, data: TourStationsUpsertRequest): Promise<ApiResponse<null>> => {
  const response = await api.put(`/api/ceo/base-tours/${tourId}/origins`, data);
  return response.data;
},

// ========== مدیریت ایستگاه‌های مقصد ==========
upsertDestinations: async (tourId: number, data: TourStationsUpsertRequest): Promise<ApiResponse<null>> => {
  const response = await api.put(`/api/ceo/base-tours/${tourId}/destinations`, data);
  return response.data;
},

// ========== مدیریت برنامه تور ==========
upsertProgram: async (tourId: number, data: TourStationsUpsertRequest): Promise<ApiResponse<null>> => {
  const response = await api.put(`/api/ceo/base-tours/${tourId}/program`, data);
  return response.data;
},
};