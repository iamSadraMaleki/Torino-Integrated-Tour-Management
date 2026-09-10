// ========== Tour Status Enum ==========
export enum TourStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  SOLD_OUT = "SOLD_OUT",
  SUSPENDED = "SUSPENDED"
}

export const TourStatusPersian: Record<TourStatus, string> = {
  [TourStatus.ACTIVE]: "فعال",
  [TourStatus.EXPIRED]: "منقضی شده",
  [TourStatus.SOLD_OUT]: "اتمام ظرفیت",
  [TourStatus.SUSPENDED]: "تعلیق"
};

export const TourStatusColors: Record<TourStatus, string> = {
  [TourStatus.ACTIVE]: "#22c55e",
  [TourStatus.EXPIRED]: "#9ca3af",
  [TourStatus.SOLD_OUT]: "#ef4444",
  [TourStatus.SUSPENDED]: "#f59e0b"
};

export const TourStatusBgColors: Record<TourStatus, string> = {
  [TourStatus.ACTIVE]: "#dcfce7",
  [TourStatus.EXPIRED]: "#f3f4f6",
  [TourStatus.SOLD_OUT]: "#fee2e2",
  [TourStatus.SUSPENDED]: "#fef3c7"
};

// ========== Base Tour Reference ==========
export interface BaseTourReference {
  id: number;
  tourName: string;
  tourCode: string;
  originCityName: string;
  destinationCityName: string;
}

// ========== Tour Station Types ==========
export interface TourStationItem {
  id: number;
  stationId: number;
  stationName: string;
  orderNo: number;
  minutesToNext: number;
  isActive: boolean;
}

// ========== Tour Types ==========
export interface Tour {
  id: number;
  baseTourId: number;
  baseTourName: string;
  baseTourCode: string;
  /** نام کاربری مدیر آژانس برگزارکننده (برای لیست همه تورها) */
  createdByUsername?: string;
  departureDate: string;
  returnDate: string;
  price: number;
  capacity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: TourStatus;  
  statusPersian: string; 
}

export interface TourCreateRequest {
  baseTourId: number;
  departureDate: string;
  returnDate: string;
  price: number;
  capacity: number;
  description?: string;
}

export interface TourUpdateRequest {
  departureDate?: string;
  returnDate?: string;
  price?: number;
  capacity?: number;
  description?: string;
}

// ========== Tour Details Types ==========
export interface TourDetails {
  tour: Tour;
  originStations: TourStationItem[];
  destinationStations: TourStationItem[];
  programStations: TourStationItem[];
}

// ========== Tour Station Toggle ==========
export interface TourStationToggleRequest {
  stationItemId: number;
  isActive: boolean; 
   orderNo?: number;
}

// ========== Tour Station Add ==========
export interface TourStationAddRequest {
  stationId: number;
  minutesToNext: number;
  orderNo?: number;
}

// ========== Real Schedule Types ==========
export interface TourRealSchedule {
  id: number;
  stationId: number;
  stationCategory: string; // ORIGIN, DESTINATION, PROGRAM
  orderIndex: number;
  scheduleDate: string;
  plannedArrivalTime: string;
  delayMinutes: number;
  finalArrivalTime: string;
}

export interface CreateTourScheduleRequest {
  tourId: number;
  startDate: string;
  startTime: string;
}

export interface ApplyDelayRequest {
  scheduleId: number;
  delayMinutes: number;
}

// ========== API Response ==========
export interface TourApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
