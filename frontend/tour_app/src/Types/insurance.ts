// ==================== بیمه سفر ====================

export type InsurancePolicyType = "TRAVEL" | "HEALTH" | "ACCIDENT" | "OTHER";

export interface InsurancePolicy {
  id: number;
  name: string;
  insuranceType: InsurancePolicyType;
  insuranceTypePersian: string;
  coverageAmount: number;
  premium: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePolicyRequest {
  name: string;
  insuranceType: InsurancePolicyType;
  coverageAmount: number;
  premium: number;
  description?: string;
}

export interface TourInsurance {
  id: number;
  tourId: number;
  insurancePolicyId: number;
  policyName: string;
  policyType: InsurancePolicyType;
  policyTypePersian: string;
  coverageAmount: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface TourInsuranceRequest {
  tourId: number;
  insurancePolicyId: number;
  price: number;
}

export const INSURANCE_TYPE_META: Record<InsurancePolicyType, { icon: string; label: string }> = {
  TRAVEL: { icon: "🧳", label: "بیمه مسافرتی" },
  HEALTH: { icon: "🏥", label: "بیمه درمانی" },
  ACCIDENT: { icon: "⚠️", label: "بیمه حوادث" },
  OTHER: { icon: "📋", label: "سایر" },
};
