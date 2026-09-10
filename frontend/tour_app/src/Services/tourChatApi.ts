import api from "../Router/api";
import {
  AdminChatMonitorMessage,
  ChatWarning,
  ChatWarningRequest,
  TourChatCreateRequest,
  TourChatEditRequest,
  TourChatMessage,
  TourChatSendRequest,
  TourConversation,
} from "../Types/tourChat";
import { ApiResponse } from "../Types/reservation";

// ========== سمت مسافر ==========
export const userTourChatApi = {
  // شروع گفتگو با مدیر آژانس برای یک تور (ایجاد یا بازیابی)
  start: async (data: TourChatCreateRequest): Promise<ApiResponse<TourConversation>> => {
    const response = await api.post("/api/user/tour-chat", data);
    return response.data;
  },

  // لیست گفتگوهای من (اینباکس)
  getMyConversations: async (): Promise<ApiResponse<TourConversation[]>> => {
    const response = await api.get("/api/user/tour-chat/my");
    return response.data;
  },

  // جزئیات گفتگو
  getConversation: async (id: number): Promise<ApiResponse<TourConversation>> => {
    const response = await api.get(`/api/user/tour-chat/${id}`);
    return response.data;
  },

  // تاریخچه گفتگو
  getMessages: async (id: number): Promise<ApiResponse<TourChatMessage[]>> => {
    const response = await api.get(`/api/user/tour-chat/${id}/messages`);
    return response.data;
  },

  // ارسال پیام
  sendMessage: async (id: number, data: TourChatSendRequest): Promise<ApiResponse<TourChatMessage>> => {
    const response = await api.post(`/api/user/tour-chat/${id}/messages`, data);
    return response.data;
  },

  // ویرایش پیام خود
  editMessage: async (id: number, messageId: number, data: TourChatEditRequest): Promise<ApiResponse<TourChatMessage>> => {
    const response = await api.put(`/api/user/tour-chat/${id}/messages/${messageId}`, data);
    return response.data;
  },

  // حذف پیام خود (نرم)
  deleteMessage: async (id: number, messageId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/user/tour-chat/${id}/messages/${messageId}`);
    return response.data;
  },

  // اخطارهای صادرشده برای من
  getMyWarnings: async (): Promise<ApiResponse<ChatWarning[]>> => {
    const response = await api.get("/api/user/tour-chat/my/warnings");
    return response.data;
  },
};

// ========== سمت مدیر آژانس ==========
export const ceoTourChatApi = {
  // لیست گفتگوهای تورهای من (اینباکس)
  getMyConversations: async (): Promise<ApiResponse<TourConversation[]>> => {
    const response = await api.get("/api/ceo/tour-chat/my");
    return response.data;
  },

  // جزئیات گفتگو
  getConversation: async (id: number): Promise<ApiResponse<TourConversation>> => {
    const response = await api.get(`/api/ceo/tour-chat/${id}`);
    return response.data;
  },

  // تاریخچه گفتگو
  getMessages: async (id: number): Promise<ApiResponse<TourChatMessage[]>> => {
    const response = await api.get(`/api/ceo/tour-chat/${id}/messages`);
    return response.data;
  },

  // ارسال پیام
  sendMessage: async (id: number, data: TourChatSendRequest): Promise<ApiResponse<TourChatMessage>> => {
    const response = await api.post(`/api/ceo/tour-chat/${id}/messages`, data);
    return response.data;
  },

  // ویرایش پیام خود
  editMessage: async (id: number, messageId: number, data: TourChatEditRequest): Promise<ApiResponse<TourChatMessage>> => {
    const response = await api.put(`/api/ceo/tour-chat/${id}/messages/${messageId}`, data);
    return response.data;
  },

  // حذف پیام خود (نرم)
  deleteMessage: async (id: number, messageId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/tour-chat/${id}/messages/${messageId}`);
    return response.data;
  },

  // اخطارهای صادرشده برای من
  getMyWarnings: async (): Promise<ApiResponse<ChatWarning[]>> => {
    const response = await api.get("/api/ceo/tour-chat/my/warnings");
    return response.data;
  },
};

// ========== سمت سوپرادمین/ادمین (مانیتورینگ) ==========
export const adminTourChatApi = {
  // همه پیام‌های چت برای مانیتورینگ
  getMonitorMessages: async (): Promise<ApiResponse<AdminChatMonitorMessage[]>> => {
    const response = await api.get("/api/admin/tour-chat/messages");
    return response.data;
  },

  // صدور اخطار برای پیام نامرتبط
  warn: async (data: ChatWarningRequest): Promise<ApiResponse<ChatWarning>> => {
    const response = await api.post("/api/admin/tour-chat/warn", data);
    return response.data;
  },
};
