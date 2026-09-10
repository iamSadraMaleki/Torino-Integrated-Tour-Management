// ========== Seat Types ==========
export type SeatType = "REGULAR" | "VIP" | "WHEELCHAIR" | "DRIVER" | "EMPTY";
export type SeatArrangementPattern = "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT" | "COLUMN_WISE" | "ROW_WISE";

export interface Seat {
  id: number;
  userId: number;
  username: string;
  vehicleId: number;
  vehicleName: string;
  vehiclePlateNumber: string;
  seatNumber: number;
  rowNumber: number;
  position: string; // جایگاه حرفی داخل ردیف: A, B, C و...
  seatType: SeatType;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeatGenerateRequest {
  vehicleId: number;
  rowCount: number;
  seatsPerRow: number;
  startRowNumber: number;
  defaultSeatType: SeatType;
  defaultIsActive: boolean;
}

export interface SeatUpdateRequest {
  seatType: SeatType;
  isActive: boolean;
  rowNumber: number;
  position: string;
  notes?: string;
}

export interface SeatStatistics {
  vehicleId: number;
  vehicleName: string;
  totalSeats: number;
  activeSeats: number;
  inactiveSeats: number;
  vipSeats: number;
  regularSeats: number;
  wheelchairSeats: number;
  driverSeats: number;
  seatsByRow: Record<number, number>;
}

export interface SeatApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const SEAT_TYPES: Record<SeatType, { label: string; color: string; icon: string }> = {
  REGULAR: { label: "معمولی", color: "#3b82f6", icon: "💺" },
  VIP: { label: "ویژه", color: "#f59e0b", icon: "⭐" },
  WHEELCHAIR: { label: "معلولین", color: "#10b981", icon: "♿" },
  DRIVER: { label: "راننده", color: "#ef4444", icon: "👨‍✈️" },
  EMPTY: { label: "خالی", color: "#94a3b8", icon: "◻️" },
};

// ========== Seat Arrangement Types ==========
export interface SeatArrangement {
  id: number;
  userId: number;
  username: string;
  pattern: SeatArrangementPattern;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeatArrangementRequest {
  pattern: SeatArrangementPattern;
  name: string;
  description: string;
  isDefault: boolean;
}

// ========== API Response Types ==========
export interface SeatApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


export const SEAT_POSITIONS = ["LEFT", "RIGHT", "MIDDLE"];

export const SEAT_ARRANGEMENT_PATTERNS: Record<SeatArrangementPattern, string> = {
  LEFT_TO_RIGHT: "چپ به راست",
  RIGHT_TO_LEFT: "راست به چپ",
  COLUMN_WISE: "ستونی",
  ROW_WISE: "ردیفی",
};