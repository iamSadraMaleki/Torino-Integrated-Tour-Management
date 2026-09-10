import api from "../Router/api";
import {
  ApiResponse,
  InventoryItem,
  InventoryItemRequest,
  InventoryStats,
  ShoppingItem,
  ShoppingItemRequest,
  ShoppingStats,
} from "../Types/nutrition";

// ==================== انبار ====================
export const inventoryApi = {
  create: async (data: InventoryItemRequest): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.post("/api/ceo/inventory", data);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<InventoryItem[]>> => {
    const response = await api.get("/api/ceo/inventory");
    return response.data;
  },

  update: async (itemId: number, data: InventoryItemRequest): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.put(`/api/ceo/inventory/${itemId}`, data);
    return response.data;
  },

  adjust: async (itemId: number, delta: number): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.patch(`/api/ceo/inventory/${itemId}/adjust`, { delta });
    return response.data;
  },

  remove: async (itemId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/inventory/${itemId}`);
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse<InventoryStats>> => {
    const response = await api.get("/api/ceo/inventory/statistics");
    return response.data;
  },
};

// ==================== لیست خرید ====================
export const shoppingApi = {
  create: async (data: ShoppingItemRequest): Promise<ApiResponse<ShoppingItem>> => {
    const response = await api.post("/api/ceo/shopping-items", data);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<ShoppingItem[]>> => {
    const response = await api.get("/api/ceo/shopping-items");
    return response.data;
  },

  update: async (itemId: number, data: ShoppingItemRequest): Promise<ApiResponse<ShoppingItem>> => {
    const response = await api.put(`/api/ceo/shopping-items/${itemId}`, data);
    return response.data;
  },

  markPurchased: async (itemId: number): Promise<ApiResponse<ShoppingItem>> => {
    const response = await api.patch(`/api/ceo/shopping-items/${itemId}/purchase`);
    return response.data;
  },

  cancel: async (itemId: number): Promise<ApiResponse<ShoppingItem>> => {
    const response = await api.patch(`/api/ceo/shopping-items/${itemId}/cancel`);
    return response.data;
  },

  remove: async (itemId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/shopping-items/${itemId}`);
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse<ShoppingStats>> => {
    const response = await api.get("/api/ceo/shopping-items/statistics");
    return response.data;
  },
};
