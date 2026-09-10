import api from "../Router/api";
import { LandingContentMap } from "../Types/landing";
import { ApiResponse } from "../Types/reservation";

export const landingApi = {
  /** دریافت محتوای صفحه معرفی — عمومی */
  getContent: async (): Promise<ApiResponse<LandingContentMap>> => {
    const response = await api.get("/api/landing");
    return response.data;
  },

  /** به‌روزرسانی محتوای صفحه معرفی (فقط ادمین/سوپرادمین) */
  updateContent: async (content: LandingContentMap): Promise<ApiResponse<LandingContentMap>> => {
    const response = await api.put("/api/admin/landing", content);
    return response.data;
  },

  /** بازنشانی به مقادیر پیش‌فرض (فقط ادمین/سوپرادمین) */
  restoreDefaults: async (): Promise<ApiResponse<LandingContentMap>> => {
    const response = await api.post("/api/admin/landing/restore-defaults");
    return response.data;
  },
};
