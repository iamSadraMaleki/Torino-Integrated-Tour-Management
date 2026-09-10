// ========== Tour Staff Types ==========
export interface TourStaff {
  id: number;
  tourId: number;
  staffMemberId: number;
  fullName: string;
  paymentAmount: number;
}

export interface AssignStaffRequest {
  tourId: number;
  staffMemberId: number;
  paymentAmount: number;
}

// ========== Staff Member for Selection ==========
export interface StaffMemberForSelect {
  id: number;
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
  positionTitle: string;
  isActive: boolean;
}

export interface TourStaffApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}