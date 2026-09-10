import api from "../Router/api";
import { ApiResponse } from "../Types/reservation";
import { WishlistItem } from "../Types/wishlist";

export const wishlistApi = {
  getMyWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    const response = await api.get("/api/user/wishlist");
    return response.data;
  },

  isInWishlist: async (tourId: number): Promise<ApiResponse<boolean>> => {
    const response = await api.get(`/api/user/wishlist/check/${tourId}`);
    return response.data;
  },

  add: async (tourId: number): Promise<ApiResponse<WishlistItem>> => {
    const response = await api.post("/api/user/wishlist", { tourId });
    return response.data;
  },

  remove: async (tourId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/user/wishlist/${tourId}`);
    return response.data;
  },
};
