// ========== CEO Profile Types ==========
export interface CeoProfile {
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

export interface CeoProfileRequest {
  fullName: string;
  nationalCode: string;
  birthDate: string;
  phoneNumber: string;
}

// ========== Bank Account Types ==========
export interface BankAccount {
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

export interface BankAccountRequest {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  cardNumber: string;
}

// ========== Audit Log Types ==========
export interface AuditLog {
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
export interface CeoApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}