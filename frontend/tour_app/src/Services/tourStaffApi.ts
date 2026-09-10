import api from "../Router/api";
import {
  TourStaff,
  AssignStaffRequest,
  StaffMemberForSelect,
} from "../Types/tourStaff";

// ========== Staff Member APIs (برای گرفتن لیست کارمندان CEO) ==========
export const staffMemberApiForTour = {
  // دریافت همه کارمندان فعال CEO
  getActiveStaffMembers: async (): Promise<StaffMemberForSelect[]> => {
    const response = await api.get("/api/ceo/staff/members/active");
    const data = response.data.data || response.data;
    return data;
  },
};

// ========== Tour Staff APIs ==========
export const tourStaffApi = {
  // تخصیص کارمند به تور
  assignStaffToTour: async (data: AssignStaffRequest): Promise<TourStaff> => {
    const response = await api.post("/api/ceo/tours/staff/assign", data);
    return response.data;
  },

  // حذف کارمند از تور
  removeStaffFromTour: async (tourId: number, staffId: number): Promise<void> => {
    await api.delete(`/api/ceo/tours/staff/${tourId}/${staffId}`);
  },

  // دریافت کارمندان تخصیص داده شده به تور
  getStaffByTourId: async (tourId: number): Promise<TourStaff[]> => {
    const response = await api.get(`/api/ceo/tours/staff/${tourId}`);
    return response.data;
  },
};