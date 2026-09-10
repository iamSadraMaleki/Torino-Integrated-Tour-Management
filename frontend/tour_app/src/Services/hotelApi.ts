import api from "../Router/api";
import { Hotel, HotelRequest, HotelApiResponse } from "../Types/hotel";

// ========== Hotel APIs ==========
export const hotelApi = {
  // ایجاد هتل جدید
  createHotel: async (data: HotelRequest): Promise<Hotel> => {
    const response = await api.post("/api/ceo/hotels", data);
    return response.data;
  },

  // ویرایش هتل
  updateHotel: async (id: number, data: HotelRequest): Promise<Hotel> => {
    const response = await api.put(`/api/ceo/hotels/${id}`, data);
    return response.data;
  },

  // حذف هتل
  deleteHotel: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/hotels/${id}`);
  },

  // دریافت یک هتل
  getHotelById: async (id: number): Promise<Hotel> => {
    const response = await api.get(`/api/ceo/hotels/${id}`);
    return response.data;
  },

  // دریافت همه هتل‌ها
  getAllHotels: async (): Promise<Hotel[]> => {
    const response = await api.get("/api/ceo/hotels");
    return response.data;
  },
};