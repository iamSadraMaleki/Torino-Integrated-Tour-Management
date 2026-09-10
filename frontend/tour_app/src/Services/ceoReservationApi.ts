import api from "../Router/api";
import { ApiResponse, CeoDashboardStats, RefundRequest, Reservation } from "../Types/reservation";
import type { TourApiResponse, Tour } from "../Types/tour";

export const ceoReservationApi = {
  getPending: async (): Promise<ApiResponse<Reservation[]>> => {
    const response = await api.get("/api/ceo/reservations/pending");
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<Reservation[]>> => {
    const response = await api.get("/api/ceo/reservations");
    return response.data;
  },

  approve: async (reservationId: number): Promise<ApiResponse<Reservation>> => {
    const response = await api.post("/api/ceo/reservations/approve", { reservationId });
    return response.data;
  },

  reject: async (
    reservationId: number,
    rejectionReason: string
  ): Promise<ApiResponse<Reservation>> => {
    const response = await api.post("/api/ceo/reservations/reject", {
      reservationId,
      rejectionReason,
    });
    return response.data;
  },

  // ===== سیستم جدید کنسلی (مدیریت CEO) =====

  // 1. دریافت درخواست‌های کنسلی
  getCancelRequests: async (): Promise<ApiResponse<RefundRequest[]>> => {
    const response = await api.get("/api/ceo/cancel-requests");
    return response.data;
  },

  // 2. آپلود رسید برگشت وجه
  uploadRefundReceipt: async (
    refundRequestId: number,
    receiptImageUrl: string
  ): Promise<ApiResponse<RefundRequest>> => {
    const response = await api.post("/api/ceo/cancel-requests/upload-receipt", {
      refundRequestId,
      receiptImageUrl,
    });
    return response.data;
  },

  // 3. رد درخواست کنسلی
  rejectCancelRequest: async (
    refundRequestId: number,
    rejectionReason: string
  ): Promise<ApiResponse<RefundRequest>> => {
    const response = await api.post("/api/ceo/cancel-requests/reject", {
      refundRequestId,
      rejectionReason,
    });
    return response.data;
  },
};

export const ceoDashboardApi = {
  getStats: async (): Promise<ApiResponse<CeoDashboardStats>> => {
    const response = await api.get("/api/ceo/dashboard/stats");
    return response.data;
  },
};

export type { TourApiResponse, Tour };
