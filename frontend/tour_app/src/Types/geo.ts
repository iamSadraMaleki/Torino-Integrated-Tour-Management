// ========== Province Types ==========
export interface Province {
  id: number;
  name: string;
  citiesCount: number;
  createdAt: string;
  updatedAt: string;
}

// ========== City Types ==========
export interface City {
  id: number;
  provinceId: number;
  name: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Station Type Types ==========
export interface StationType {
  id: number;
  typeName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StationTypeCreateRequest {
  typeName: string;
}

export interface StationTypeUpdateRequest {
  typeName: string;
}

// ========== API Response Types ==========
export interface GeoApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}