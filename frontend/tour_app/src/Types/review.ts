export interface TourReview {
  id: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  rating: number;
  comment: string;
  userUsername: string;
  userMobile: string;
  agencyUsername: string;
  createdAt: string;
}

export interface ReviewRequest {
  tourId: number;
  rating: number;
  comment: string;
}
