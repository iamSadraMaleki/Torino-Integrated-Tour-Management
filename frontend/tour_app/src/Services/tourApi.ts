import api from "../Router/api";
import {
  BaseTourReference,
  Tour,
  TourCreateRequest,
  TourUpdateRequest,
  TourDetails,
  TourStationToggleRequest,
  TourStationAddRequest,
  TourRealSchedule,
  CreateTourScheduleRequest,
  ApplyDelayRequest,
  TourApiResponse,
  TourStatus
} from "../Types/tour";

// ========== Base Tours API (برای انتخاب تور پایه) ==========
export const getBaseToursForSelect = async (): Promise<BaseTourReference[]> => {
  const response = await api.get("/api/ceo/base-tours");
  const data = response.data.data || response.data;
  return data.map((item: any) => ({
    id: item.id,
    tourName: item.tourName,
    tourCode: item.tourCode,
    originCityName: item.originCityName,
    destinationCityName: item.destinationCityName,
  }));
};

// ========== Tour APIs ==========
export const tourApi = {
  // همه تورهای سیستم (فقط ادمین/سوپرادمین)
  getAllTours: async (): Promise<TourApiResponse<Tour[]>> => {
    const response = await api.get("/api/admin/tours");
    return response.data;
  },

  // ایجاد تور جدید
  createTour: async (data: TourCreateRequest): Promise<TourApiResponse<Tour>> => {
    const response = await api.post("/api/ceo/tours", data);
    return response.data;
  },

  // دریافت لیست تورهای من
  getMyTours: async (): Promise<TourApiResponse<Tour[]>> => {
    const response = await api.get("/api/ceo/tours");
    return response.data;
  },

  // دریافت جزئیات کامل تور
  getTourDetails: async (tourId: number): Promise<TourApiResponse<TourDetails>> => {
    const response = await api.get(`/api/ceo/tours/${tourId}`);
    return response.data;
  },

  // ویرایش تور
  updateTour: async (tourId: number, data: TourUpdateRequest): Promise<TourApiResponse<Tour>> => {
    const response = await api.put(`/api/ceo/tours/${tourId}`, data);
    return response.data;
  },

  // حذف تور
  deleteTour: async (tourId: number): Promise<TourApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/tours/${tourId}`);
    return response.data;
  },

  // فعال/غیرفعال کردن ایستگاه مبدا
  toggleOriginStation: async (tourId: number, data: TourStationToggleRequest): Promise<TourApiResponse<null>> => {
    const response = await api.patch(`/api/ceo/tours/${tourId}/origins/toggle`, data);
    return response.data;
  },

  // فعال/غیرفعال کردن ایستگاه مقصد
  toggleDestinationStation: async (tourId: number, data: TourStationToggleRequest): Promise<TourApiResponse<null>> => {
    const response = await api.patch(`/api/ceo/tours/${tourId}/destinations/toggle`, data);
    return response.data;
  },

  // فعال/غیرفعال کردن ایستگاه برنامه
  toggleProgramStation: async (tourId: number, data: TourStationToggleRequest): Promise<TourApiResponse<null>> => {
    const response = await api.patch(`/api/ceo/tours/${tourId}/program/toggle`, data);
    return response.data;
  },

  // افزودن ایستگاه مبدا
  addOriginStation: async (tourId: number, data: TourStationAddRequest): Promise<TourApiResponse<null>> => {
    const response = await api.post(`/api/ceo/tours/${tourId}/origin-stations`, data);
    return response.data;
  },

  // افزودن ایستگاه مقصد
  addDestinationStation: async (tourId: number, data: TourStationAddRequest): Promise<TourApiResponse<null>> => {
    const response = await api.post(`/api/ceo/tours/${tourId}/destination-stations`, data);
    return response.data;
  },

  // افزودن ایستگاه برنامه
  addProgramStation: async (tourId: number, data: TourStationAddRequest): Promise<TourApiResponse<null>> => {
    const response = await api.post(`/api/ceo/tours/${tourId}/program-stations`, data);
    return response.data;
  },
};

// ========== Real Schedule APIs ==========
export const realScheduleApi = {
  // تولید برنامه زمانی واقعی
  generateSchedule: async (data: CreateTourScheduleRequest): Promise<TourRealSchedule[]> => {
    const response = await api.post("/api/ceo/tours/schedule/generate", data);
    return response.data;
  },

  // اعمال تاخیر
  applyDelay: async (data: ApplyDelayRequest): Promise<TourRealSchedule[]> => {
    const response = await api.post("/api/ceo/tours/schedule/apply-delay", data);
    return response.data;
  },

  // دریافت برنامه یک تور
  getScheduleByTour: async (tourId: number): Promise<TourRealSchedule[]> => {
    const response = await api.get(`/api/ceo/tours/schedule/${tourId}`);
    return response.data;
  },
};
// به tourApi.ts اضافه کن (بعد از realScheduleApi):

// ========== Tour Status APIs ==========
export const tourStatusApi = {
  // تغییر وضعیت تور
  changeStatus: async (tourId: number, status: TourStatus): Promise<TourApiResponse<Tour>> => {
    const response = await api.patch(`/api/ceo/tours/${tourId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // تعلیق تور
  suspendTour: async (tourId: number): Promise<TourApiResponse<Tour>> => {
    const response = await api.post(`/api/ceo/tours/${tourId}/suspend`);
    return response.data;
  },

  // فعال کردن مجدد تور
  activateTour: async (tourId: number): Promise<TourApiResponse<Tour>> => {
    const response = await api.post(`/api/ceo/tours/${tourId}/activate`);
    return response.data;
  },

  // فیلتر تورها بر اساس وضعیت
  getMyToursByStatus: async (status?: TourStatus): Promise<TourApiResponse<Tour[]>> => {
    const url = status ? `/api/ceo/tours/filter?status=${status}` : "/api/ceo/tours";
    const response = await api.get(url);
    return response.data;
  },
};