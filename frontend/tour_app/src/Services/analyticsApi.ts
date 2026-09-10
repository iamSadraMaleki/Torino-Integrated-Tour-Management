import api from "../Router/api";
import { AdminAnalytics, CeoAnalytics } from "../Types/analytics";
import { ApiResponse } from "../Types/reservation";

// ========== تحلیل هوشمند مدیر آژانس ==========
export const ceoAnalyticsApi = {
  getAnalytics: async (): Promise<ApiResponse<CeoAnalytics>> => {
    const response = await api.get("/api/ceo/dashboard/analytics");
    return response.data;
  },
};

// ========== تحلیل هوشمند سوپرادمین (کل پلتفرم) ==========
export const adminAnalyticsApi = {
  getAnalytics: async (): Promise<ApiResponse<AdminAnalytics>> => {
    const response = await api.get("/api/admin/dashboard/analytics");
    return response.data;
  },
};
