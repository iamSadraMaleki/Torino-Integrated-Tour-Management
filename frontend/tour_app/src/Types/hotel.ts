// ========== Hotel Types ==========
export interface Hotel {
  id: number;
  name: string;
  address: string;
  stars: number;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelRequest {
  name: string;
  address: string;
  stars: number;
  city: string;
}

export interface HotelApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}