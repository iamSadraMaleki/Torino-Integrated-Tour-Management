import api from "../Router/api";
import {
  TourHotel,
  TourHotelRequest,
  TourHotelUpdateRequest,
  BaseHotel,
} from "../Types/tourHotel";

// ========== Base Hotel APIs (برای گرفتن لیست هتل‌های CEO) ==========
export const baseHotelApi = {
  // دریافت همه هتل‌های CEO
  getAllHotels: async (): Promise<BaseHotel[]> => {
    const response = await api.get("/api/ceo/hotels");
    const data = response.data.data || response.data;
    return data;
  },
};

// ========== Tour Hotel APIs ==========
export const tourHotelApi = {
  // افزودن هتل به تور
  addHotelToTour: async (data: TourHotelRequest): Promise<TourHotel> => {
    const response = await api.post("/api/ceo/tour-hotels", data);
    return response.data;
  },

  // ویرایش هتل تور (تعداد شب)
  updateTourHotel: async (id: number, data: TourHotelUpdateRequest): Promise<TourHotel> => {
    const response = await api.put(`/api/ceo/tour-hotels/${id}`, data);
    return response.data;
  },

  // حذف هتل از تور
  removeHotelFromTour: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/tour-hotels/${id}`);
  },

  // دریافت هتل‌های یک تور
  getHotelsByTourId: async (tourId: number): Promise<TourHotel[]> => {
    const response = await api.get(`/api/ceo/tour-hotels/tour/${tourId}`);
    return response.data;
  },

  // دریافت یک هتل تور
  getTourHotelById: async (id: number): Promise<TourHotel> => {
    const response = await api.get(`/api/ceo/tour-hotels/${id}`);
    return response.data;
  },
};