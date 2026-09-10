import api from "../Router/api";
import {
  Ticket,
  TicketCreateRequest,
  TicketMessage,
  TicketReplyRequest,
  TicketStats,
} from "../Types/ticket";
import { ApiResponse } from "../Types/reservation";

// ========== سمت مسافر و مدیر آژانس ==========
export const userTicketApi = {
  // ثبت تیکت جدید
  create: async (data: TicketCreateRequest): Promise<ApiResponse<Ticket>> => {
    const response = await api.post("/api/tickets", data);
    return response.data;
  },

  // لیست تیکت‌های من
  getMyTickets: async (): Promise<ApiResponse<Ticket[]>> => {
    const response = await api.get("/api/tickets/my");
    return response.data;
  },

  // جزئیات تیکت
  getTicket: async (id: number): Promise<ApiResponse<Ticket>> => {
    const response = await api.get(`/api/tickets/${id}`);
    return response.data;
  },

  // تاریخچه گفتگو
  getMessages: async (id: number): Promise<ApiResponse<TicketMessage[]>> => {
    const response = await api.get(`/api/tickets/${id}/messages`);
    return response.data;
  },

  // ارسال پیام
  sendMessage: async (id: number, data: TicketReplyRequest): Promise<ApiResponse<TicketMessage>> => {
    const response = await api.post(`/api/tickets/${id}/messages`, data);
    return response.data;
  },
};

// ========== سمت ادمین / سوپرادمین ==========
export const adminTicketApi = {
  // همه تیکت‌ها
  getAll: async (): Promise<ApiResponse<Ticket[]>> => {
    const response = await api.get("/api/admin/tickets");
    return response.data;
  },

  // آمار پشتیبانی
  getStats: async (): Promise<ApiResponse<TicketStats>> => {
    const response = await api.get("/api/admin/tickets/stats");
    return response.data;
  },

  // لیست اپراتورها
  getOperators: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get("/api/admin/tickets/operators");
    return response.data;
  },

  // جزئیات تیکت
  getTicket: async (id: number): Promise<ApiResponse<Ticket>> => {
    const response = await api.get(`/api/admin/tickets/${id}`);
    return response.data;
  },

  // تاریخچه گفتگو
  getMessages: async (id: number): Promise<ApiResponse<TicketMessage[]>> => {
    const response = await api.get(`/api/admin/tickets/${id}/messages`);
    return response.data;
  },

  // پاسخ پشتیبانی (sendMessage برای سازگاری با کامپوننت چت مشترک)
  reply: async (id: number, data: TicketReplyRequest): Promise<ApiResponse<TicketMessage>> => {
    const response = await api.post(`/api/admin/tickets/${id}/messages`, data);
    return response.data;
  },
  sendMessage: async (id: number, data: TicketReplyRequest): Promise<ApiResponse<TicketMessage>> => {
    const response = await api.post(`/api/admin/tickets/${id}/messages`, data);
    return response.data;
  },

  // تخصیص به اپراتور
  assign: async (id: number, operatorUsername: string): Promise<ApiResponse<Ticket>> => {
    const response = await api.put(`/api/admin/tickets/${id}/assign`, { operatorUsername });
    return response.data;
  },

  // بستن تیکت با دلیل
  close: async (id: number, reason: string): Promise<ApiResponse<Ticket>> => {
    const response = await api.put(`/api/admin/tickets/${id}/close`, { reason });
    return response.data;
  },
};
