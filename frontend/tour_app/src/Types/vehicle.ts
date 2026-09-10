// ========== Vehicle Types ==========
export type VehicleType = "BUS" | "MINIBUS" | "CAR" | "VAN" | "LUXURY_CAR" | "TOUR_BUS";
export type VehicleStatus = "ACTIVE" | "UNDER_REPAIR" | "INACTIVE";

export interface VehicleFeature {
  id: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFeatureRequest {
  name: string;
  description: string;
  icon: string;
}

export interface StaffMemberSimple {
  id: number;
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
}

export interface Vehicle {
  id: number;
  userId: number;
  username: string;
  name: string;
  manufacturer: string;
  type: VehicleType;
  status: VehicleStatus;
  plateNumber: string;
  color: string;
  rowCount: number;
  seatCount: number;
  currentDriver: StaffMemberSimple | null;
  modelYear: number;
  description: string;
  features: VehicleFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRequest {
  name: string;
  manufacturer: string;
  type: VehicleType;
  status: VehicleStatus;
  plateNumber: string;
  color: string;
  rowCount: number;
  seatCount: number;
  currentDriverId: number | null;
  modelYear: number;
  description: string;
  featureIds: number[];
}

export interface VehicleStatistics {
  totalVehicles: number;
  activeVehicles: number;
  underRepairVehicles: number;
  inactiveVehicles: number;
  vehiclesByType: Record<string, number>;
  vehiclesByManufacturer: Record<string, number>;
  vehiclesByStatus: Record<string, number>;
  totalSeats: number;
}

export interface VehicleApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ========== تاریخچه سفر خودرو ==========
export interface VehicleTourHistory {
  id: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  departureDate: string;
  returnDate: string;
  assignedAt: string;
}

// ========== دفتر تعمیرات خودرو ==========
export type VehicleRepairType = "ROUTINE_SERVICE" | "REPAIR" | "ACCIDENT" | "OTHER";

export interface VehicleRepair {
  id: number;
  vehicleId: number;
  vehicleName: string;
  plateNumber: string;
  repairDate: string;
  cost: number;
  repairType: VehicleRepairType;
  repairTypePersian: string;
  title: string;
  description: string;
  workshopName: string;
  createdBy: string;
  createdAt: string;
}

export interface VehicleRepairRequest {
  vehicleId: number;
  repairDate: string;
  cost: number;
  repairType: VehicleRepairType;
  title: string;
  description?: string;
  workshopName?: string;
}

export interface VehicleRepairStats {
  totalCost: number;
  repairCount: number;
  vehicleCount: number;
  perVehicle: {
    vehicleId: number;
    vehicleName: string;
    plateNumber: string;
    totalCost: number;
    repairCount: number;
  }[];
  perType: {
    repairType: VehicleRepairType;
    repairTypePersian: string;
    totalCost: number;
    repairCount: number;
  }[];
  perMonth: {
    month: string;
    totalCost: number;
    repairCount: number;
  }[];
}