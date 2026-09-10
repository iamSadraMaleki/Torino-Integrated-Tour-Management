export interface TourSpecialDiscount {
  id: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdByUsername: string;
  createdAt: string;
}

export interface TourSpecialDiscountRequest {
  tourId: number;
  discountPercent: number;
  expiresAt: string;
}

export interface DiscountCode {
  id: number;
  code: string;
  title: string;
  discountPercent: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  forUserUsername: string | null;
  createdByUsername: string;
  createdByRole: string;
  createdAt: string;
}

export interface DiscountCodeRequest {
  code: string;
  title: string;
  discountPercent: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  forUserUsername?: string | null;
}

export const DISCOUNT_ROLE_PERSIAN: Record<string, string> = {
  ROLE_CEO: "مدیر آژانس",
  ROLE_ADMIN: "ادمین",
  ROLE_SUPERADMIN: "سوپرادمین",
};
