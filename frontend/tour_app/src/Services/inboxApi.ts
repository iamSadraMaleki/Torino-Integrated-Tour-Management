import api from "../Router/api";
import { InboxMessage, InboxSendRequest, InboxStats } from "../Types/inbox";
import { ApiResponse } from "../Types/reservation";

// ========== سمت مسافر ==========
export const userInboxApi = {
  getMessages: async (): Promise<ApiResponse<InboxMessage[]>> => {
    const response = await api.get("/api/user/inbox");
    return response.data;
  },
  getStats: async (): Promise<ApiResponse<InboxStats>> => {
    const response = await api.get("/api/user/inbox/stats");
    return response.data;
  },
  markRead: async (id: number): Promise<ApiResponse<InboxMessage>> => {
    const response = await api.put(`/api/user/inbox/${id}/read`);
    return response.data;
  },
  markAllRead: async (): Promise<ApiResponse<number>> => {
    const response = await api.put("/api/user/inbox/read-all");
    return response.data;
  },
};

// ========== سمت مدیر آژانس ==========
export const ceoInboxApi = {
  getMessages: async (): Promise<ApiResponse<InboxMessage[]>> => {
    const response = await api.get("/api/ceo/inbox");
    return response.data;
  },
  getStats: async (): Promise<ApiResponse<InboxStats>> => {
    const response = await api.get("/api/ceo/inbox/stats");
    return response.data;
  },
  markRead: async (id: number): Promise<ApiResponse<InboxMessage>> => {
    const response = await api.put(`/api/ceo/inbox/${id}/read`);
    return response.data;
  },
  markAllRead: async (): Promise<ApiResponse<number>> => {
    const response = await api.put("/api/ceo/inbox/read-all");
    return response.data;
  },
};

// ========== سمت سوپرادمین/ادمین ==========
export const adminInboxApi = {
  send: async (data: InboxSendRequest): Promise<ApiResponse<InboxMessage>> => {
    const response = await api.post("/api/admin/inbox/send", data);
    return response.data;
  },
  unsuspend: async (userId: number): Promise<ApiResponse<InboxMessage>> => {
    const response = await api.post(`/api/admin/inbox/${userId}/unsuspend`);
    return response.data;
  },
  getSuspendedUsers: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get("/api/admin/inbox/suspended-users");
    return response.data;
  },
  getHistory: async (): Promise<ApiResponse<InboxHistoryMessage[]>> => {
    const response = await api.get("/api/admin/inbox/history");
    return response.data;
  },
};
