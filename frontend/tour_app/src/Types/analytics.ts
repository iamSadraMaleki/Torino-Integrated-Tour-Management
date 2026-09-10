// ========== تحلیل هوشمند داشبوردها ==========

export interface MoneyPoint {
  label: string;
  amount: number;
}

export interface CountPoint {
  label: string;
  count: number;
}

export interface StatusSlice {
  status: string;
  persianName: string;
  count: number;
}

// ---------- تحلیل مدیر آژانس (CEO) ----------

export interface TopTour {
  tourId: number;
  tourName: string;
  tourCode: string;
  reservations: number;
  passengers: number;
  revenue: number;
  occupancyRate: number;
}

export interface CeoAnalytics {
  revenueByMonth: MoneyPoint[];
  revenueByDay: MoneyPoint[];
  reservationsByDay: CountPoint[];
  statusDistribution: StatusSlice[];
  topTours: TopTour[];
  totalTours: number;
  activeTours: number;
  totalReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  occupancyRate: number;
  avgTicketPrice: number;
  bestTourName: string;
  busiestMonth: string;
  busiestDay: string;
}

// ---------- تحلیل سوپرادمین (کل پلتفرم) ----------

export interface RoleSlice {
  role: string;
  persianName: string;
  count: number;
}

export interface TopAgency {
  username: string;
  agencyName: string;
  reservations: number;
  passengers: number;
  revenue: number;
}

export interface PlatformTotals {
  totalUsers: number;
  totalCeos: number;
  totalTours: number;
  totalReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  pendingVerifications: number;
}

export interface AdminAnalytics {
  reservationsByDay: CountPoint[];
  revenueByMonth: MoneyPoint[];
  toursByMonth: CountPoint[];
  reservationStatusDistribution: StatusSlice[];
  roleDistribution: RoleSlice[];
  topAgencies: TopAgency[];
  totals: PlatformTotals;
}
