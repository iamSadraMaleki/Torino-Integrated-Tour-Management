import api from "../Router/api";
import {
  ApiResponse,
  CancelRequestPayload,
  CreateReservationRequest,
  PaymentProofRequest,
  RefundRequest,
  Reservation,
  Ticket,
} from "../Types/reservation";

export const reservationApi = {
  create: async (data: CreateReservationRequest): Promise<ApiResponse<Reservation>> => {
    const response = await api.post("/api/user/reservations", data);
    return response.data;
  },

  getMyReservations: async (): Promise<ApiResponse<Reservation[]>> => {
    const response = await api.get("/api/user/reservations");
    return response.data;
  },

  getById: async (reservationId: number): Promise<ApiResponse<Reservation>> => {
    const response = await api.get(`/api/user/reservations/${reservationId}`);
    return response.data;
  },

  uploadPaymentProof: async (
    reservationId: number,
    data: PaymentProofRequest
  ): Promise<ApiResponse<null>> => {
    const response = await api.post(
      `/api/user/reservations/${reservationId}/payment-proof`,
      data
    );
    return response.data;
  },

  // ===== سیستم جدید کنسلی (چند مرحله‌ای) =====

  // 1. کاربر درخواست کنسلی می‌دهد
  requestCancellation: async (
    reservationId: number,
    data: CancelRequestPayload
  ): Promise<ApiResponse<RefundRequest>> => {
    const response = await api.post(
      `/api/user/reservations/${reservationId}/cancel-request`,
      data
    );
    return response.data;
  },

  // 2. کاربر وضعیت درخواست را بررسی می‌کند
  getCancelStatus: async (reservationId: number): Promise<ApiResponse<RefundRequest>> => {
    const response = await api.get(
      `/api/user/reservations/${reservationId}/cancel-status`
    );
    return response.data;
  },

  // 3. کاربر تایید نهایی می‌کند
  confirmCancellation: async (refundRequestId: number): Promise<ApiResponse<RefundRequest>> => {
    const response = await api.post(
      `/api/user/reservations/confirm-cancel/${refundRequestId}`
    );
    return response.data;
  },

  // ===== بلیط گرافیکی =====

  getTicket: async (reservationId: number): Promise<ApiResponse<Ticket>> => {
    const response = await api.get(
      `/api/user/reservations/${reservationId}/ticket`
    );
    return response.data;
  },
};
