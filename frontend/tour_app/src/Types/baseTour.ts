// ========== Base Tour Types ==========
export interface BaseTour {
  id: number;
  tourName: string;
  tourCode: string;
  originCityId: number;
  destinationCityId: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseTourCreateRequest {
  tourName: string;
  tourCode: string;
  originCityId: number;
  destinationCityId: number;
}

export interface BaseTourUpdateRequest {
  tourName: string;
  tourCode: string;
  originCityId: number;
  destinationCityId: number;
}

// ========== Tour Station Types ==========
export interface TourStation {
  id: number;
  stationId: number;
  stationName: string;
  stationTypeName: string;
  provinceName: string;
  cityName: string;
  orderIndex: number;
  minutesToNext: number;
  location?: string;
}

// ✅ اصلاح: مطابق با TourStationItemRequest بک‌اند
export interface TourStationItemRequest {
  stationId: number;
  orderNo: number;
  minutesToNext: number;
}

// ✅ اصلاح: مطابق با TourStationsUpsertRequest بک‌اند
export interface TourStationsUpsertRequest {
  items: TourStationItemRequest[];
}

// ========== Base Tour Details Types ==========
export interface BaseTourDetails {
  tour: BaseTour;
  originStations: TourStation[];
  destinationStations: TourStation[];
  programStations: TourStation[];
}

// ========== Station Types (برای انتخاب ایستگاه) ==========
export interface Station {
  id: number;
  stationName: string;
  stationTypeName: string;
  provinceName: string;
  cityName: string;
  location: string;
}

// ========== City Types (برای انتخاب شهر مبدا/مقصد) ==========
export interface City {
  id: number;
  name: string;
  provinceId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}