import api from "../Router/api";
import {
  Station,
  StationCreateRequest,
  StationUpdateRequest,
  StationApiResponse,
  Province,
  City,
  StationType,
} from "../Types/station";

// ========== Geo APIs ==========
export const geoApi = {
  getProvinces: async (): Promise<Province[]> => {
    const response = await api.get("/api/ceo/geo/provinces");
    return response.data.data || response.data;
  },
  getCitiesByProvince: async (provinceId: number): Promise<City[]> => {
    const response = await api.get(`/api/ceo/geo/cities?provinceId=${provinceId}`);
    return response.data.data || response.data;
  },
};

// ========== Station Type APIs ==========
export const stationTypeApi = {
  getAllStationTypes: async (): Promise<StationType[]> => {
    const response = await api.get("/api/ceo/station-types");
    return response.data.data || response.data;
  },
};

// ========== Station APIs ==========
export const stationApi = {
  // ایجاد ایستگاه جدید (با آپلود تصویر)
  createStation: async (data: StationCreateRequest, imageFile?: File): Promise<StationApiResponse<Station>> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (imageFile) {
      formData.append("image", imageFile);
    }
    const response = await api.post("/api/ceo/stations", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ویرایش ایستگاه (با آپلود تصویر جدید)
  updateStation: async (stationId: number, data: StationUpdateRequest, imageFile?: File): Promise<StationApiResponse<Station>> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (imageFile) {
      formData.append("image", imageFile);
    }
    const response = await api.put(`/api/ceo/stations/${stationId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // حذف ایستگاه
  deleteStation: async (stationId: number): Promise<StationApiResponse<null>> => {
    const response = await api.delete(`/api/ceo/stations/${stationId}`);
    return response.data;
  },

  // دریافت همه ایستگاه‌های من
  getMyStations: async (): Promise<StationApiResponse<Station[]>> => {
    const response = await api.get("/api/ceo/stations");
    return response.data;
  },

  // دریافت یک ایستگاه
  getStationById: async (stationId: number): Promise<StationApiResponse<Station>> => {
    const response = await api.get(`/api/ceo/stations/${stationId}`);
    return response.data;
  },

  // دریافت تصویر ایستگاه
  getStationImage: (imageId: number): string => {
    return `/api/ceo/stations/images/${imageId}`;
  },
};