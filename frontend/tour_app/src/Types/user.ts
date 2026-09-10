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

export interface UpdateProfileRequest {
  email?: string;
  mobile?: string;
  city?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

// ========== User Profile Types ==========
export interface UserProfile {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  nationalCode: string;
  birthDate: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileRequest {
  fullName: string;
  nationalCode: string;
  birthDate: string;
  phoneNumber: string;
}

// ========== User Bank Account Types ==========
export interface UserBankAccount {
  id: number;
  userId: number;
  username: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  cardNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBankAccountRequest {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  cardNumber: string;
}

// ========== User Audit Log Types ==========
export interface UserAuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  oldValue: string;
  newValue: string;
  username: string;
  ipAddress: string;
  timestamp: string;
}

// ========== API Response Types ==========
export interface UserApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}