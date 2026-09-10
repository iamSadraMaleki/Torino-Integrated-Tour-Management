// ========== Station Types ==========
export interface Station {
  id: number;
  provinceId: number;
  provinceName: string;
  cityId: number;
  cityName: string;
  stationTypeId: number;
  stationTypeName: string;
  stationImageId: number | null;
  stationName: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface StationCreateRequest {
  provinceId: number;
  cityId: number;
  stationTypeId: number;
  stationName: string;
  location: string;
  imageDescription?: string;
}

export interface StationUpdateRequest {
  provinceId: number;
  cityId: number;
  stationTypeId: number;
  stationName: string;
  location: string;
  imageDescription?: string;
}

export interface StationApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ========== Geo Types for Station Form ==========
export interface Province {
  id: number;
  name: string;
  citiesCount: number;
}

export interface City {
  id: number;
  provinceId: number;
  name: string;
  latitude: string;
  longitude: string;
}

export interface StationType {
  id: number;
  typeName: string;
}