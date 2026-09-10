import api from "../Router/api";
import { Announcement, AnnouncementCreateRequest } from "../Types/announcement";
import { ApiResponse } from "../Types/reservation";

// ========== مدیریت اطلاعیه‌ها (ادمین) ==========
export const adminAnnouncementApi = {
  // ساخت اطلاعیه جدید
  create: async (data: AnnouncementCreateRequest): Promise<ApiResponse<Announcement>> => {
    const response = await api.post("/api/admin/announcements", data);
    return response.data;
  },

  // تاریخچه کامل
  getAll: async (): Promise<ApiResponse<Announcement[]>> => {
    const response = await api.get("/api/admin/announcements");
    return response.data;
  },

  // پین/آنپین
  togglePin: async (id: number): Promise<ApiResponse<Announcement>> => {
    const response = await api.put(`/api/admin/announcements/${id}/pin`);
    return response.data;
  },

  // فعال/غیرفعال
  toggleActive: async (id: number): Promise<ApiResponse<Announcement>> => {
    const response = await api.put(`/api/admin/announcements/${id}/active`);
    return response.data;
  },

  // حذف
  remove: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/announcements/${id}`);
    return response.data;
  },
};

// ========== نمایش اطلاعیه‌های فعال (کاربر/CEO) ==========
export const announcementApi = {
  getActive: async (): Promise<ApiResponse<Announcement[]>> => {
    const response = await api.get("/api/announcements/active");
    return response.data;
  },
};
