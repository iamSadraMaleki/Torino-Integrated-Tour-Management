// ========== مالی و تسویه حساب ==========

export interface FinanceTransaction {
  reservationId: number;
  userUsername: string;
  userMobile: string;
  tourName: string;
  tourCode: string;
  agencyUsername: string;
  amount: number;
  status: string;
  statusPersian: string;
  confirmedAt: string;
  createdAt: string;
  sourceCardNumber: string;
  receiptImageUrl: string;
}

export interface AgencyRevenue {
  agencyId: number;
  agencyUsername: string;
  agencyName: string;
  totalRevenue: number;
  totalReservations: number;
  totalPassengers: number;
  commissionPercent: number;
  commissionAmount: number;
  netAmount: number;
  settledAmount: number;
  availableAmount: number;
}

export interface SettlementRequest {
  id: number;
  agencyUsername: string;
  agencyName: string;
  requestedAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  netAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  statusPersian: string;
  rejectionReason: string;
  processedBy: string;
  requestedAt: string;
  processedAt: string;
}

export interface CommissionConfig {
  id: number;
  agencyId: number;
  agencyUsername: string;
  agencyName: string;
  commissionPercent: number;
  updatedBy: string;
  updatedAt: string;
}

export interface FinanceSummary {
  totalTransactions: number;
  totalAmount: number;
  totalCommission: number;
  pendingSettlements: number;
  approvedSettlements: number;
}

export interface CeoSettlementSummary {
  totalRevenue: number;
  commissionPercent: number;
  commissionAmount: number;
  netAmount: number;
  settledAmount: number;
  availableAmount: number;
  pendingRequests: number;
}

export const SETTLEMENT_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "در انتظار بررسی", color: "#d97706", bg: "#fef3c7" },
  APPROVED: { label: "تأیید شده", color: "#16a34a", bg: "#dcfce7" },
  REJECTED: { label: "رد شده", color: "#dc2626", bg: "#fee2e2" },
};
