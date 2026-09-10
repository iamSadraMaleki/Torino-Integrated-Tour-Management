import api from "../Router/api";
import {
  TourVehicle,
  AssignVehicleRequest,
  VehicleForSelect,
  TourVehicleApiResponse,
} from "../Types/tourVehicle";

// ========== Vehicle APIs (برای گرفتن لیست خودروهای CEO) ==========
export const vehicleApiForTour = {
  // دریافت همه خودروهای CEO
  getAllVehicles: async (): Promise<VehicleForSelect[]> => {
    const response = await api.get("/api/ceo/vehicles");
    const data = response.data.data || response.data;
    return data;
  },

  // دریافت خودروهای فعال CEO
  getActiveVehicles: async (): Promise<VehicleForSelect[]> => {
    const response = await api.get("/api/ceo/vehicles/status/ACTIVE");
    const data = response.data.data || response.data;
    return data;
  },
};

// ========== Tour Vehicle APIs ==========
export const tourVehicleApi = {
  // تخصیص خودرو به تور
  assignVehicle: async (tourId: number, data: AssignVehicleRequest): Promise<TourVehicle> => {
    const response = await api.post(`/api/ceo/tours/${tourId}/vehicles`, data);
    return response.data;
  },

  // حذف خودرو از تور
  removeVehicle: async (tourId: number, vehicleId: number): Promise<void> => {
    await api.delete(`/api/ceo/tours/${tourId}/vehicles/${vehicleId}`);
  },

  // دریافت لیست خودروهای تخصیص داده شده به تور
  getTourVehicles: async (tourId: number): Promise<TourVehicle[]> => {
    const response = await api.get(`/api/ceo/tours/${tourId}/vehicles`);
    return response.data;
  },
};