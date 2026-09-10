import api from "../Router/api";
import { BaseFood, CreateFoodRequest } from "../Types/food";

// ========== Food APIs ==========
export const foodApi = {
  // ایجاد غذای جدید
  createFood: async (data: CreateFoodRequest): Promise<BaseFood> => {
    const response = await api.post("/api/ceo/base-food", data);
    return response.data;
  },

  // ویرایش غذا
  updateFood: async (id: number, data: CreateFoodRequest): Promise<BaseFood> => {
    const response = await api.put(`/api/ceo/base-food/${id}`, data);
    return response.data;
  },

  // حذف غذا
  deleteFood: async (id: number): Promise<void> => {
    await api.delete(`/api/ceo/base-food/${id}`);
  },

  // دریافت یک غذا
  getFoodById: async (id: number): Promise<BaseFood> => {
    const response = await api.get(`/api/ceo/base-food/${id}`);
    return response.data;
  },

  // دریافت همه غذاها
  getAllFoods: async (): Promise<BaseFood[]> => {
    const response = await api.get("/api/ceo/base-food");
    return response.data;
  },
};