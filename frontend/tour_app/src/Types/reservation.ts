export enum ReservationStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  WAITING_FOR_VERIFICATION = "WAITING_FOR_VERIFICATION",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export const ReservationStatusPersian: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING_PAYMENT]: "در انتظار پرداخت",
  [ReservationStatus.WAITING_FOR_VERIFICATION]: "در انتظار تأیید",
  [ReservationStatus.CONFIRMED]: "تأیید شده",
  [ReservationStatus.CANCELLED]: "لغو شده",
  [ReservationStatus.REJECTED]: "رد شده",
};

export const ReservationStatusColors: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING_PAYMENT]: "#f59e0b",
  [ReservationStatus.WAITING_FOR_VERIFICATION]: "#3b82f6",
  [ReservationStatus.CONFIRMED]: "#22c55e",
  [ReservationStatus.CANCELLED]: "#9ca3af",
  [ReservationStatus.REJECTED]: "#ef4444",
};

export interface Passenger {
  id?: number;
  firstName: string;
  lastName: string;
  nationalCode: string;
  mobile: string;
  birthDate: string;
}

export interface PaymentProof {
  sourceCardNumber: string;
  destinationCardNumber: string;
  receiptImageUrl: string;
  createdAt?: string;
}

export interface Reservation {
  id: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  departureDate: string;
  returnDate: string;
  totalPrice: number;
  passengerCount: number;
  status: ReservationStatus;
  statusPersian: string;
  expiresAt?: string;
  createdAt: string;
  passengers: Passenger[];
  seatIds: number[];
  userUsername?: string;
  userMobile?: string;
  paymentProof?: PaymentProof;
}

export interface UserTour {
  id: number;
  baseTourName: string;
  baseTourCode: string;
  originCityName: string;
  destinationCityName: string;
  departureDate: string;
  returnDate: string;
  price: number;
  /** قیمت تخفیف‌خورده تور ویژه (در صورت فعال بودن) */
  discountedPrice?: number;
  /** درصد تخفیف ویژه فعال */
  discountPercent?: number;
  availableCapacity: number;
  createdByUsername: string;
}

export interface UserTourDetails extends UserTour {
  description: string;
  totalCapacity: number;
  agencyName: string;
  schedule: Array<{
    stationName: string;
    stationCity: string;
    stationType: string;
    orderIndex: number;
    scheduleDate: string;
    plannedArrivalTime: string;
    finalArrivalTime: string;
  }>;
  hotels: Array<{ id: number; name: string; stars: number; city: string }>;
  foods: Array<{ id: number; foodName: string; serveDay: string; price: number }>;
  vehicles: Array<{ id: number; name: string; plateNumber: string; seatCount: number }>;
  staffs: Array<{ id: number; firstName: string; role: string; phone: string }>;
}

export interface SeatStatus {
  seatId: number;
  seatNumber: number;
  rowNumber: number;
  position: string;
  seatType: string;
  isBooked: boolean;
  status: "AVAILABLE" | "PENDING" | "CONFIRMED";
}

export interface TourPaymentInfo {
  accountHolderName: string;
  bankName: string;
  cardNumber: string;
  iban: string;
  accountNumber: string;
  agencyName: string;
  tourPrice: number;
}

export interface CreateReservationRequest {
  tourId: number;
  seatIds: number[];
  passengers: Passenger[];
  /** کد تخفیف (اختیاری) */
  discountCode?: string;
}

export interface PaymentProofRequest {
  sourceCardNumber: string;
  receiptImageUrl: string;
}

export interface CeoDashboardStats {
  activeTours: number;
  pendingApprovals: number;
  totalPassengers: number;
  confirmedReservations: number;
  uniqueCustomers: number;
  totalRevenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ========== سیستم کنسلی (چند مرحله‌ای) ==========

export type RefundRequestStatus = "PENDING" | "REFUND_RECEIPT_UPLOADED" | "CONFIRMED" | "REJECTED";

export const RefundRequestStatusPersian: Record<RefundRequestStatus, string> = {
  PENDING: "در انتظار بررسی",
  REFUND_RECEIPT_UPLOADED: "رسید برگشت آپلود شد",
  CONFIRMED: "تأیید نهایی - لغو شده",
  REJECTED: "رد شده",
};

export const RefundRequestStatusColors: Record<RefundRequestStatus, string> = {
  PENDING: "#f59e0b",
  REFUND_RECEIPT_UPLOADED: "#3b82f6",
  CONFIRMED: "#22c55e",
  REJECTED: "#ef4444",
};

export interface RefundRequest {
  id: number;
  reservationId: number;
  tourName: string;
  tourCode: string;
  refundAmount: number;
  targetCardNumber: string;
  receiptImageUrl?: string;
  status: RefundRequestStatus;
  statusPersian: string;
  rejectionReason?: string;
  cancelledPassengerIds: number[];
  cancelledSeatIds: number[];
  userUsername: string;
  userMobile: string;
  createdAt: string;
  processedAt?: string;
}

export interface CancelRequestPayload {
  targetCardNumber: string;
  passengerIds?: number[];
}

// ========== بلیط گرافیکی ==========

export interface TicketPassenger {
  firstName: string;
  lastName: string;
  nationalCode: string;
  mobile: string;
  seatNumber: number;
}

export interface Ticket {
  reservationId: number;
  tourName: string;
  tourCode: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  returnDate: string;
  agencyName: string;
  status: string;
  statusPersian: string;
  passengerCount: number;
  totalPrice: number;
  customerName: string;
  customerMobile: string;
  passengers: TicketPassenger[];
}
