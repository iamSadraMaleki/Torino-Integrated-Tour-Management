// ========== Position Types ==========
export interface Position {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PositionRequest {
  title: string;
  description: string;
}

// ========== Staff Member Types ==========
export interface StaffMember {
  id: number;
  fullName: string;
  nationalCode: string;
  fatherName: string;
  birthDate: string;
  phoneNumber: string;
  workExperience: number;
  address: string;
  isActive: boolean;
  hireDate: string;
  position: Position;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMemberRequest {
  fullName: string;
  nationalCode: string;
  fatherName: string;
  birthDate: string;
  phoneNumber: string;
  workExperience: number;
  address: string;
  positionId: number;
  hireDate?: string;
}

// ========== Statistics Types ==========
export interface StaffStatistics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  totalPositions: number;
  activePositions: number;
  staffByPosition?: Array<{
    positionName: string;
    count: number;
  }>;
}

// ========== API Response Types ==========
export interface StaffApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}