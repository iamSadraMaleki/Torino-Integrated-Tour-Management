import api from "../Router/api";
import {
  Seat,
  SeatGenerateRequest,
  SeatUpdateRequest,
  SeatStatistics,
  SeatApiResponse,
  SeatArrangement,
  SeatArrangementRequest,
} from "../Types/seat";

// ========== Seat APIs (مطابق با کنترلر SeatController) ==========
export const seatApi = {
  // تولید خودکار صندلی‌ها
  generateSeats: async (data: SeatGenerateRequest): Promise<SeatApiResponse<Seat[]>> => {
    const response = await api.post("/api/ceo/seats/generate", data);
    return response.data;
  },

  // ویرایش یک صندلی
  updateSeat: async (seatId: number, data: SeatUpdateRequest): Promise<SeatApiResponse<Seat>> => {
    const response = await api.put(`/api/ceo/seats/${seatId}`, data);
    return response.data;
  },

  // حذف تمام صندلی‌های یک خودرو
  deleteSeatsByVehicle: async (vehicleId: number): Promise<SeatApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/seats/vehicle/${vehicleId}`);
    return response.data;
  },

  // دریافت صندلی‌های یک خودرو
  getSeatsByVehicle: async (vehicleId: number): Promise<SeatApiResponse<Seat[]>> => {
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}`);
    return response.data;
  },

  // دریافت صندلی‌های فعال یک خودرو
  getActiveSeatsByVehicle: async (vehicleId: number): Promise<SeatApiResponse<Seat[]>> => {
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}/active`);
    return response.data;
  },

  // دریافت صندلی‌های یک ردیف
  getSeatsByRow: async (vehicleId: number, rowNumber: number): Promise<SeatApiResponse<Seat[]>> => {
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}/row/${rowNumber}`);
    return response.data;
  },

  // دریافت آمار صندلی‌ها
  getStatistics: async (vehicleId: number): Promise<SeatApiResponse<SeatStatistics>> => {
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}/statistics`);
    return response.data;
  },

  // دریافت صندلی‌ها بر اساس وضعیت
  getSeatsByStatus: async (vehicleId: number, isActive: boolean): Promise<SeatApiResponse<Seat[]>> => {
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}/filter/status/${isActive}`);
    return response.data;
  },

  // دریافت صندلی‌ها بر اساس نوع
  getSeatsByType: async (vehicleId: number, seatType: string): Promise<SeatApiResponse<Seat[]>> => {
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}/filter/type/${seatType}`);
    return response.data;
  },

  // دریافت صندلی‌ها با فیلتر ترکیبی
  getSeatsByFilters: async (vehicleId: number, isActive?: boolean, seatType?: string): Promise<SeatApiResponse<Seat[]>> => {
    const params: any = {};
    if (isActive !== undefined) params.isActive = isActive;
    if (seatType) params.seatType = seatType;
    const response = await api.get(`/api/ceo/seats/vehicle/${vehicleId}/filter`, { params });
    return response.data;
  },
};

// ========== Seat Arrangement APIs (مطابق با کنترلر SeatArrangementController) ==========
export const seatArrangementApi = {
  // ایجاد الگوی جدید - POST /api/ceo/seat-arrangements
  createArrangement: async (data: SeatArrangementRequest): Promise<SeatApiResponse<SeatArrangement>> => {
    const response = await api.post("/api/ceo/seat-arrangements", data);
    return response.data;
  },

  // ویرایش الگو - PUT /api/ceo/seat-arrangements/{arrangementId}
  updateArrangement: async (arrangementId: number, data: SeatArrangementRequest): Promise<SeatApiResponse<SeatArrangement>> => {
    const response = await api.put(`/api/ceo/seat-arrangements/${arrangementId}`, data);
    return response.data;
  },

  // حذف الگو - DELETE /api/ceo/seat-arrangements/{arrangementId}
  deleteArrangement: async (arrangementId: number): Promise<SeatApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/seat-arrangements/${arrangementId}`);
    return response.data;
  },

  // دریافت یک الگو - GET /api/ceo/seat-arrangements/{arrangementId}
  getArrangement: async (arrangementId: number): Promise<SeatApiResponse<SeatArrangement>> => {
    const response = await api.get(`/api/ceo/seat-arrangements/${arrangementId}`);
    return response.data;
  },

  // دریافت همه الگوها - GET /api/ceo/seat-arrangements
  getAllArrangements: async (): Promise<SeatApiResponse<SeatArrangement[]>> => {
    const response = await api.get("/api/ceo/seat-arrangements");
    return response.data;
  },

  // دریافت الگوی پیش‌فرض - GET /api/ceo/seat-arrangements/default
  getDefaultArrangement: async (): Promise<SeatApiResponse<SeatArrangement> | null> => {
    try {
      const response = await api.get("/api/ceo/seat-arrangements/default");
      return response.data;
    } catch (error: any) {
      // اگه 404 باشه یعنی الگوی پیش‌فرضی وجود نداره
      if (error.response?.status === 404) {
        console.log("No default arrangement found");
        return null;
      }
      throw error;
    }
  },

  // تنظیم الگو به عنوان پیش‌فرض - PUT /api/ceo/seat-arrangements/{arrangementId}/set-default
  setDefaultArrangement: async (arrangementId: number): Promise<SeatApiResponse<SeatArrangement>> => {
    const response = await api.put(`/api/ceo/seat-arrangements/${arrangementId}/set-default`);
    return response.data;
  },
};