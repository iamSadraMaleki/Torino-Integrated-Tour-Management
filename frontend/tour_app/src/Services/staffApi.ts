import api from "../Router/api";
import {
  Position,
  PositionRequest,
  StaffMember,
  StaffMemberRequest,
  StaffStatistics,
  StaffApiResponse,
} from "../Types/staff";

// ========== Position APIs ==========
export const positionApi = {
  // ایجاد سمت جدید
  createPosition: async (data: PositionRequest): Promise<StaffApiResponse<Position>> => {
    const response = await api.post("/api/ceo/staff/positions", data);
    return response.data;
  },

  // ویرایش سمت
  updatePosition: async (positionId: number, data: PositionRequest): Promise<StaffApiResponse<Position>> => {
    const response = await api.put(`/api/ceo/staff/positions/${positionId}`, data);
    return response.data;
  },

  // حذف سمت
  deletePosition: async (positionId: number): Promise<StaffApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/staff/positions/${positionId}`);
    return response.data;
  },

  // دریافت یک سمت
  getPosition: async (positionId: number): Promise<StaffApiResponse<Position>> => {
    const response = await api.get(`/api/ceo/staff/positions/${positionId}`);
    return response.data;
  },

  // دریافت همه سمت‌ها
  getAllPositions: async (): Promise<StaffApiResponse<Position[]>> => {
    const response = await api.get("/api/ceo/staff/positions");
    return response.data;
  },

  // دریافت سمت‌های فعال
  getActivePositions: async (): Promise<StaffApiResponse<Position[]>> => {
    const response = await api.get("/api/ceo/staff/positions/active");
    return response.data;
  },
};

// ========== Staff Member APIs ==========
export const staffMemberApi = {
  // ایجاد کارمند جدید
  createStaffMember: async (data: StaffMemberRequest): Promise<StaffApiResponse<StaffMember>> => {
    const response = await api.post("/api/ceo/staff/members", data);
    return response.data;
  },

  // ویرایش کارمند
  updateStaffMember: async (staffId: number, data: StaffMemberRequest): Promise<StaffApiResponse<StaffMember>> => {
    const response = await api.put(`/api/ceo/staff/members/${staffId}`, data);
    return response.data;
  },

  // حذف کارمند
  deleteStaffMember: async (staffId: number): Promise<StaffApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/staff/members/${staffId}`);
    return response.data;
  },

  // دریافت یک کارمند
  getStaffMember: async (staffId: number): Promise<StaffApiResponse<StaffMember>> => {
    const response = await api.get(`/api/ceo/staff/members/${staffId}`);
    return response.data;
  },

  // دریافت همه کارمندان
  getAllStaffMembers: async (): Promise<StaffApiResponse<StaffMember[]>> => {
    const response = await api.get("/api/ceo/staff/members");
    return response.data;
  },

  // دریافت کارمندان فعال
  getActiveStaffMembers: async (): Promise<StaffApiResponse<StaffMember[]>> => {
    const response = await api.get("/api/ceo/staff/members/active");
    return response.data;
  },

  // دریافت کارمندان بر اساس سمت
  getStaffMembersByPosition: async (positionId: number): Promise<StaffApiResponse<StaffMember[]>> => {
    const response = await api.get(`/api/ceo/staff/members/by-position/${positionId}`);
    return response.data;
  },

  // دریافت آمار
getStatistics: async (): Promise<StaffApiResponse<StaffStatistics>> => {
  const response = await api.get("/api/ceo/staff/members/statistics");
  const rawData = response.data;
  
  console.log("🔍 Raw statistics from API:", rawData);
  
  // نرمالایز کردن داده
  const normalized = {
    totalStaff: rawData.data?.totalStaff ?? rawData.data?.total ?? 0,
    activeStaff: rawData.data?.activeStaff ?? rawData.data?.active ?? 0,
    inactiveStaff: rawData.data?.inactiveStaff ?? rawData.data?.inactive ?? 0,
    totalPositions: rawData.data?.totalPositions ?? 0,
    activePositions: rawData.data?.activePositions ?? rawData.data?.activePositionCount ?? rawData.data?.positionsActive ?? 0,
    staffByPosition: rawData.data?.staffByPosition || [],
  };
  
  return {
    ...rawData,
    data: normalized
  };
},
};