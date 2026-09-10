// ========== دفتر پرداخت حقوق کارکنان ==========

export type StaffPaymentType = "SALARY" | "BONUS";

export const STAFF_PAYMENT_TYPE_META: Record<StaffPaymentType, { icon: string; label: string }> = {
  SALARY: { icon: "💰", label: "حقوق" },
  BONUS: { icon: "🎁", label: "پاداش" },
};

export interface StaffPayment {
  id: number;
  staffMemberId: number;
  staffName: string;
  positionTitle: string;
  amount: number;
  paymentType: StaffPaymentType;
  paymentTypePersian: string;
  title: string;
  description?: string;
  paymentDate: string;
  createdBy: string;
  createdAt: string;
}

export interface StaffPaymentRequest {
  staffMemberId: number;
  amount: number;
  paymentType: StaffPaymentType;
  title: string;
  description?: string;
  paymentDate?: string;
}

export interface StaffPaymentPerStaff {
  staffMemberId: number;
  staffName: string;
  total: number;
  salaryTotal: number;
  bonusTotal: number;
  paymentCount: number;
}

export interface StaffPaymentPerMonth {
  month: string; // YYYY-MM
  total: number;
  paymentCount: number;
}

export interface StaffPaymentStats {
  totalPaid: number;
  totalSalary: number;
  totalBonus: number;
  paymentCount: number;
  salaryCount: number;
  bonusCount: number;
  perStaff: StaffPaymentPerStaff[];
  perMonth: StaffPaymentPerMonth[];
}

// ========== تاریخچه سفر کارمند ==========

export interface StaffTourHistory {
  id: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  departureDate: string;
  returnDate: string;
  paymentAmount: number;
  assignedAt: string;
}
