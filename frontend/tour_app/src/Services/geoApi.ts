import api from "../Router/api";
import {
  Province,
  City,
  StationType,
  StationTypeCreateRequest,
  StationTypeUpdateRequest,
  GeoApiResponse,
} from "../Types/geo";

// ========== Geo APIs (Provinces & Cities) ==========
export const geoApi = {
  // دریافت همه استان‌ها
  getProvinces: async (): Promise<GeoApiResponse<Province[]>> => {
    const response = await api.get("/api/ceo/geo/provinces");
    return response.data;
  },

  // دریافت شهرهای یک استان
  getCitiesByProvince: async (provinceId: number): Promise<GeoApiResponse<City[]>> => {
    const response = await api.get(`/api/ceo/geo/cities?provinceId=${provinceId}`);
    return response.data;
  },
};

// ========== Station Type APIs ==========
export const stationTypeApi = {
  // ایجاد نوع ایستگاه جدید
  createStationType: async (data: StationTypeCreateRequest): Promise<GeoApiResponse<StationType>> => {
    const response = await api.post("/api/ceo/station-types", data);
    return response.data;
  },

  // دریافت همه نوع ایستگاه‌ها
  getAllStationTypes: async (): Promise<GeoApiResponse<StationType[]>> => {
    const response = await api.get("/api/ceo/station-types");
    return response.data;
  },

  // دریافت یک نوع ایستگاه
  getStationTypeById: async (id: number): Promise<GeoApiResponse<StationType>> => {
    const response = await api.get(`/api/ceo/station-types/${id}`);
    return response.data;
  },

  // ویرایش نوع ایستگاه
  updateStationType: async (id: number, data: StationTypeUpdateRequest): Promise<GeoApiResponse<StationType>> => {
    const response = await api.put(`/api/ceo/station-types/${id}`, data);
    return response.data;
  },

  // حذف نوع ایستگاه
  deleteStationType: async (id: number): Promise<GeoApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/station-types/${id}`);
    return response.data;
  },
};