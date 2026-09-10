// ========== Tour Hotel Types ==========
export interface TourHotel {
  id: number;
  tourId: number;
  baseHotelId: number;
  hotelName: string;
  hotelCity: string;
  hotelStars: number;
  nightCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TourHotelRequest {
  tourId: number;
  baseHotelId: number;
  nightCount: number;
}

export interface TourHotelUpdateRequest {
  nightCount: number;
}

// ========== Base Hotel for Selection ==========
export interface BaseHotel {
  id: number;
  name: string;
  city: string;
  stars: number;
  address: string;
}

export interface TourHotelApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}