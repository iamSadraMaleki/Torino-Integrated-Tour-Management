import api from "../Router/api";
import {
  ApiResponse,
  SeatStatus,
  TourPaymentInfo,
  UserTour,
  UserTourDetails,
} from "../Types/reservation";

export const userTourApi = {
  getAvailableTours: async (): Promise<ApiResponse<UserTour[]>> => {
    const response = await api.get("/api/user/tours");
    return response.data;
  },

  getTourDetails: async (tourId: number): Promise<ApiResponse<UserTourDetails>> => {
    const response = await api.get(`/api/user/tours/${tourId}`);
    return response.data;
  },

  getTourSeats: async (tourId: number): Promise<ApiResponse<SeatStatus[]>> => {
    const response = await api.get(`/api/user/tours/${tourId}/seats`);
    return response.data;
  },

  getTourPaymentInfo: async (tourId: number): Promise<ApiResponse<TourPaymentInfo>> => {
    const response = await api.get(`/api/user/tours/${tourId}/payment-info`);
    return response.data;
  },
};
