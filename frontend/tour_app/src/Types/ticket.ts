// ========== سیستم تیکت پشتیبانی ==========

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";

export const TicketStatusPersian: Record<TicketStatus, string> = {
  OPEN: "در حال بررسی",
  IN_PROGRESS: "در حال رسیدگی",
  ANSWERED: "پاسخ داده شد",
  CLOSED: "بسته شده",
};

export const TicketStatusColors: Record<TicketStatus, string> = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  ANSWERED: "#22c55e",
  CLOSED: "#9ca3af",
};

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const TicketPriorityPersian: Record<TicketPriority, string> = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "بالا",
  CRITICAL: "بحرانی",
};

export const TicketPriorityColors: Record<TicketPriority, string> = {
  LOW: "#64748b",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export type TicketCreatorRole = "USER" | "AGENCY";

export const TicketCreatorRolePersian: Record<TicketCreatorRole, string> = {
  USER: "مسافر",
  AGENCY: "آژانس",
};

export interface Ticket {
  id: number;
  serialNumber: string;
  title: string;
  content: string;
  status: TicketStatus;
  statusPersian: string;
  priority: TicketPriority;
  priorityPersian: string;
  creatorRole: TicketCreatorRole;
  creatorRolePersian: string;
  creatorUsername: string;
  assignedToUsername?: string;
  assignedToRolePersian?: string;
  createdAt: string;
  closedAt?: string;
  closeReason?: string;
  closedBy?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  messageCount: number;
}

export interface TicketMessage {
  id: number;
  content: string;
  senderUsername: string;
  senderRole: "USER" | "AGENCY" | "ADMIN";
  senderRolePersian: string;
  isSupport: boolean;
  /** نام فیلد قدیمی در JSON (سازگاری) */
  support?: boolean;
  attachmentUrl?: string;
  createdAt: string;
}

export interface TicketCreateRequest {
  title: string;
  content: string;
  priority: TicketPriority;
}

export interface TicketReplyRequest {
  content: string;
  attachmentUrl?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  answered: number;
  closed: number;
  byPriority: Record<string, number>;
  last7Days: Array<{ date: string; count: number }>;
}
