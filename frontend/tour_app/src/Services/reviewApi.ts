import api from "../Router/api";
import { ApiResponse } from "../Types/reservation";
import { ReviewRequest, TourReview } from "../Types/review";

export const userReviewApi = {
  create: async (data: ReviewRequest): Promise<ApiResponse<TourReview>> => {
    const response = await api.post("/api/user/reviews", data);
    return response.data;
  },
  getMine: async (): Promise<ApiResponse<TourReview[]>> => {
    const response = await api.get("/api/user/reviews/mine");
    return response.data;
  },
};

export const ceoReviewApi = {
  getReviews: async (): Promise<ApiResponse<TourReview[]>> => {
    const response = await api.get("/api/ceo/reviews");
    return response.data;
  },
};

export const adminReviewApi = {
  getReviews: async (): Promise<ApiResponse<TourReview[]>> => {
    const response = await api.get("/api/admin/reviews");
    return response.data;
  },
  deleteReview: async (reviewId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
  },
};
