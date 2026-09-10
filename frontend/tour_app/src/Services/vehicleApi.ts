import api from "../Router/api";
import {
  Vehicle,
  VehicleRequest,
  VehicleFeature,
  VehicleFeatureRequest,
  VehicleStatistics,
  VehicleApiResponse,
  StaffMemberSimple,
  VehicleTourHistory,
  VehicleRepair,
  VehicleRepairRequest,
  VehicleRepairStats,
} from "../Types/vehicle";

// ========== Staff API for Driver Selection ==========
export const getStaffForDriver = async (): Promise<StaffMemberSimple[]> => {
  try {
    const response = await api.get("/api/ceo/staff/members/active");
    // اگه response.data یه آبجکت با success و data هست
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    // اگه مستقیم آرایه هست
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
};

// ========== Vehicle APIs ==========
export const vehicleApi = {
  // ایجاد ماشین جدید
  createVehicle: async (data: VehicleRequest): Promise<VehicleApiResponse<Vehicle>> => {
    const response = await api.post("/api/ceo/vehicles", data);
    return response.data;
  },

  // ویرایش ماشین
  updateVehicle: async (vehicleId: number, data: VehicleRequest): Promise<VehicleApiResponse<Vehicle>> => {
    const response = await api.put(`/api/ceo/vehicles/${vehicleId}`, data);
    return response.data;
  },

  // حذف ماشین
  deleteVehicle: async (vehicleId: number): Promise<VehicleApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/vehicles/${vehicleId}`);
    return response.data;
  },

  // دریافت یک ماشین
  getVehicleById: async (vehicleId: number): Promise<VehicleApiResponse<Vehicle>> => {
    const response = await api.get(`/api/ceo/vehicles/${vehicleId}`);
    return response.data;
  },

  // دریافت همه ماشین‌ها
  getAllVehicles: async (): Promise<VehicleApiResponse<Vehicle[]>> => {
    const response = await api.get("/api/ceo/vehicles");
    return response.data;
  },

  // دریافت ماشین‌ها بر اساس وضعیت
  getVehiclesByStatus: async (status: string): Promise<VehicleApiResponse<Vehicle[]>> => {
    const response = await api.get(`/api/ceo/vehicles/status/${status}`);
    return response.data;
  },

  // دریافت ماشین‌ها بر اساس نوع
  getVehiclesByType: async (type: string): Promise<VehicleApiResponse<Vehicle[]>> => {
    const response = await api.get(`/api/ceo/vehicles/type/${type}`);
    return response.data;
  },

  // دریافت آمار
  getStatistics: async (): Promise<VehicleApiResponse<VehicleStatistics>> => {
    const response = await api.get("/api/ceo/vehicles/statistics");
    return response.data;
  },

  // دریافت تاریخچه سفرهای یک خودرو
  getVehicleTours: async (vehicleId: number): Promise<VehicleApiResponse<VehicleTourHistory[]>> => {
    const response = await api.get(`/api/ceo/vehicles/${vehicleId}/tours`);
    return response.data;
  },
};

// ========== دفتر تعمیرات خودرو ==========
export const vehicleRepairApi = {
  // ثبت سرویس/تعمیر جدید
  record: async (data: VehicleRepairRequest): Promise<VehicleApiResponse<VehicleRepair>> => {
    const response = await api.post("/api/ceo/vehicle-repairs", data);
    return response.data;
  },

  // همه سرویس‌ها
  getAll: async (): Promise<VehicleApiResponse<VehicleRepair[]>> => {
    const response = await api.get("/api/ceo/vehicle-repairs");
    return response.data;
  },

  // سرویس‌های یک خودرو
  getByVehicle: async (vehicleId: number): Promise<VehicleApiResponse<VehicleRepair[]>> => {
    const response = await api.get(`/api/ceo/vehicle-repairs/vehicle/${vehicleId}`);
    return response.data;
  },

  // آمار
  getStatistics: async (): Promise<VehicleApiResponse<VehicleRepairStats>> => {
    const response = await api.get("/api/ceo/vehicle-repairs/statistics");
    return response.data;
  },

  // حذف سرویس
  remove: async (repairId: number): Promise<VehicleApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/vehicle-repairs/${repairId}`);
    return response.data;
  },
};

// ========== Vehicle Feature APIs ==========
export const vehicleFeatureApi = {
  // ایجاد ویژگی جدید
  createFeature: async (data: VehicleFeatureRequest): Promise<VehicleApiResponse<VehicleFeature>> => {
    const response = await api.post("/api/ceo/vehicles/features", data);
    return response.data;
  },

  // ویرایش ویژگی
  updateFeature: async (featureId: number, data: VehicleFeatureRequest): Promise<VehicleApiResponse<VehicleFeature>> => {
    const response = await api.put(`/api/ceo/vehicles/features/${featureId}`, data);
    return response.data;
  },

  // حذف ویژگی
  deleteFeature: async (featureId: number): Promise<VehicleApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/vehicles/features/${featureId}`);
    return response.data;
  },

  // دریافت همه ویژگی‌ها
  getAllFeatures: async (): Promise<VehicleApiResponse<VehicleFeature[]>> => {
    const response = await api.get("/api/ceo/vehicles/features");
    return response.data;
  },

  // دریافت ویژگی‌های فعال
  getActiveFeatures: async (): Promise<VehicleApiResponse<VehicleFeature[]>> => {
    const response = await api.get("/api/ceo/vehicles/features/active");
    return response.data;
  },
};