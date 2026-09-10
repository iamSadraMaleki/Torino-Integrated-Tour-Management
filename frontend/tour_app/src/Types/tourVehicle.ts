// ========== Tour Vehicle Types ==========
export interface TourVehicle {
  id: number;
  tourId: number;
  vehicleId: number;
  vehicleName: string;
}

export interface AssignVehicleRequest {
  vehicleId: number;
}

// ========== Vehicle for Selection ==========
export interface VehicleForSelect {
  id: number;
  name: string;
  plateNumber: string;
  manufacturer: string;
  seatCount: number;
  type: string;
  status: string;
}

export interface TourVehicleApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}