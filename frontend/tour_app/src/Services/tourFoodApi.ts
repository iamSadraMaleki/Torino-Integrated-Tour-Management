import api from "../Router/api";
import {
  BaseFood,
  AddTourFoodRequest,
  UpdateTourFoodRequest,
  TourFoodResponse,
  TourDrinkResponse,
  TourDessertResponse,
} from "../Types/tourFood";

// ========== Base Food APIs ==========
export const baseFoodApi = {
  // دریافت همه غذاهای پایه (مسیر درست: /api/ceo/base-food)
  getAllBaseFoods: async (): Promise<BaseFood[]> => {
    const response = await api.get("/api/ceo/base-food");
    const data = response.data.data || response.data;
    return data;
  },

  // دریافت یک غذای پایه
  getBaseFoodById: async (id: number): Promise<BaseFood> => {
    const response = await api.get(`/api/ceo/base-food/${id}`);
    const data = response.data.data || response.data;
    return data;
  },
};

// ========== Tour Food APIs ==========
export const tourFoodApi = {
  // افزودن غذا به تور
  addFoodToTour: async (data: AddTourFoodRequest): Promise<TourFoodResponse> => {
    const response = await api.post("/api/ceo/tour-food", data);
    return response.data;
  },

  // ویرایش غذای تور
  updateTourFood: async (id: number, data: UpdateTourFoodRequest): Promise<TourFoodResponse> => {
    const response = await api.put(`/api/ceo/tour-food/${id}`, data);
    return response.data;
  },

  // حذف غذا از تور
  removeFoodFromTour: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/tour-food/${id}`);
  },

  // دریافت غذاهای یک تور
  getFoodsByTourId: async (tourId: number): Promise<TourFoodResponse[]> => {
    const response = await api.get(`/api/ceo/tour-food/tour/${tourId}`);
    return response.data;
  },

  // دریافت یک غذای تور
  getTourFoodById: async (id: number): Promise<TourFoodResponse> => {
    const response = await api.get(`/api/ceo/tour-food/${id}`);
    return response.data;
  },
};

// ========== Tour Drink APIs ==========
export const tourDrinkApi = {
  addDrinkToTour: async (data: AddTourFoodRequest): Promise<TourDrinkResponse> => {
    const response = await api.post("/api/ceo/tour-drink", data);
    return response.data;
  },

  updateTourDrink: async (id: number, data: UpdateTourFoodRequest): Promise<TourDrinkResponse> => {
    const response = await api.put(`/api/ceo/tour-drink/${id}`, data);
    return response.data;
  },

  removeDrinkFromTour: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/tour-drink/${id}`);
  },

  getDrinksByTourId: async (tourId: number): Promise<TourDrinkResponse[]> => {
    const response = await api.get(`/api/ceo/tour-drink/tour/${tourId}`);
    return response.data;
  },

  getTourDrinkById: async (id: number): Promise<TourDrinkResponse> => {
    const response = await api.get(`/api/ceo/tour-drink/${id}`);
    return response.data;
  },
};

// ========== Tour Dessert APIs ==========
export const tourDessertApi = {
  addDessertToTour: async (data: AddTourFoodRequest): Promise<TourDessertResponse> => {
    const response = await api.post("/api/ceo/tour-dessert", data);
    return response.data;
  },

  updateTourDessert: async (id: number, data: UpdateTourFoodRequest): Promise<TourDessertResponse> => {
    const response = await api.put(`/api/ceo/tour-dessert/${id}`, data);
    return response.data;
  },

  removeDessertFromTour: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/tour-dessert/${id}`);
  },

  getDessertsByTourId: async (tourId: number): Promise<TourDessertResponse[]> => {
    const response = await api.get(`/api/ceo/tour-dessert/tour/${tourId}`);
    return response.data;
  },

  getTourDessertById: async (id: number): Promise<TourDessertResponse> => {
    const response = await api.get(`/api/ceo/tour-dessert/${id}`);
    return response.data;
  },
};