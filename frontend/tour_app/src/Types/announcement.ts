// ========== انواع اطلاعیه‌های سراسری ==========

export type AnnouncementPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AnnouncementAudience = "ALL" | "AGENCIES" | "PASSENGERS" | "CITY";

export const AnnouncementPriorityPersian: Record<AnnouncementPriority, string> = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "بالا",
  CRITICAL: "بحرانی",
};

export const AnnouncementPriorityColors: Record<AnnouncementPriority, string> = {
  LOW: "#64748b",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export const AnnouncementAudiencePersian: Record<AnnouncementAudience, string> = {
  ALL: "همه کاربران",
  AGENCIES: "فقط آژانس‌ها",
  PASSENGERS: "فقط مسافران",
  CITY: "بر اساس شهر",
};

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  priorityPersian: string;
  audience: AnnouncementAudience;
  audiencePersian: string;
  targetCity?: string;
  expiresAt?: string;
  isPinned: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  isExpired?: boolean;
}

export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  targetCity?: string;
  expiresAt?: string;
  isPinned?: boolean;
}
