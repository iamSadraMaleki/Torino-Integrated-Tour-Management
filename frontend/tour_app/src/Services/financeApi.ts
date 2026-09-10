import api from "../Router/api";
import {
  FinanceTransaction,
  AgencyRevenue,
  SettlementRequest,
  CommissionConfig,
  FinanceSummary,
  CeoSettlementSummary,
} from "../Types/finance";
import { ApiResponse } from "../Types/reservation";

// ========== سوپرادمین ==========
export const adminFinanceApi = {
  getSummary: async (): Promise<ApiResponse<FinanceSummary>> => {
    const response = await api.get("/api/admin/finance/summary");
    return response.data;
  },
  getTransactions: async (): Promise<ApiResponse<FinanceTransaction[]>> => {
    const response = await api.get("/api/admin/finance/transactions");
    return response.data;
  },
  getAgencyRevenue: async (): Promise<ApiResponse<AgencyRevenue[]>> => {
    const response = await api.get("/api/admin/finance/agency-revenue");
    return response.data;
  },
  getSettlementRequests: async (): Promise<ApiResponse<SettlementRequest[]>> => {
    const response = await api.get("/api/admin/finance/settlement-requests");
    return response.data;
  },
  approveSettlement: async (id: number): Promise<ApiResponse<SettlementRequest>> => {
    const response = await api.put(`/api/admin/finance/settlement-requests/${id}/approve`);
    return response.data;
  },
  rejectSettlement: async (id: number, reason: string): Promise<ApiResponse<SettlementRequest>> => {
    const response = await api.put(`/api/admin/finance/settlement-requests/${id}/reject`, null, {
      params: { reason },
    });
    return response.data;
  },
  getCommissions: async (): Promise<ApiResponse<CommissionConfig[]>> => {
    const response = await api.get("/api/admin/finance/commissions");
    return response.data;
  },
  upsertCommission: async (agencyId: number, commissionPercent: number): Promise<ApiResponse<CommissionConfig>> => {
    const response = await api.put(`/api/admin/finance/commissions/agency/${agencyId}`, {
      commissionPercent,
    });
    return response.data;
  },
};

// ========== مدیر آژانس (تسویه) ==========
export const ceoFinanceApi = {
  getSummary: async (): Promise<ApiResponse<CeoSettlementSummary>> => {
    const response = await api.get("/api/ceo/finance/settlement/summary");
    return response.data;
  },
  createSettlementRequest: async (amount: number): Promise<ApiResponse<SettlementRequest>> => {
    const response = await api.post("/api/ceo/finance/settlement/requests", { amount });
    return response.data;
  },
  getMyRequests: async (): Promise<ApiResponse<SettlementRequest[]>> => {
    const response = await api.get("/api/ceo/finance/settlement/requests");
    return response.data;
  },
};
