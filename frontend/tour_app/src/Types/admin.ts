// ========== User Types ==========
export interface User {
  id: number;
  username: string;
  email: string;
  mobile: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  name: string;
  persianName: string;
}

// ========== Verification Types ==========
export type VerificationStatus = "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface CeoVerification {
  id: number;
  userId: number;
  username: string;
  agencyName: string;
  legalName: string;
  ceoName: string;
  registrationNumber: string;
  licenseExpiryDate: string;
  taxNumber: string;
  establishmentDate: string;
  companyEmail: string;
  companyPhone: string;
  status: VerificationStatus;
  statusPersian: string;
  message: string;
  submittedAt: string;
  reviewedAt: string;
  rejectionReason: string;
}

export interface VerificationStatistics {
  total: number;
  notVerified: number;
  pending: number;
  verified: number;
  rejected: number;
  pendingPercentage: number;
  verifiedPercentage: number;
  rejectedPercentage: number;
}

export interface RejectRequest {
  rejectionReason: string;
}