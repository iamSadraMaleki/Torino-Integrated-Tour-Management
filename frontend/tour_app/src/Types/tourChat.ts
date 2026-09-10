// ========== گفتگوی مسافر با مدیر آژانس ==========

export interface TourConversation {
  id: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  departureDate: string;
  returnDate: string;
  passengerUsername: string;
  passengerMobile: string;
  ceoUsername: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  messageCount: number;
  /** تعداد پیام‌های نخوانده برای کاربر جاری (اینباکس) */
  unreadCount?: number;
}

export interface TourChatMessage {
  id: number;
  content: string;
  senderId?: number;
  senderUsername: string;
  senderRole: "USER" | "AGENCY";
  senderRolePersian: string;
  isAgency: boolean;
  /** نام فیلد قدیمی در JSON (سازگاری) */
  agency?: boolean;
  receiverId?: number;
  receiverUsername?: string;
  receiverRole?: string;
  receiverRolePersian?: string;
  attachmentUrl?: string;
  /** ویرایش شده؟ */
  isEdited?: boolean;
  /** حذف شده؟ */
  isDeleted?: boolean;
  createdAt: string;
}

export interface TourChatCreateRequest {
  tourId: number;
}

export interface TourChatSendRequest {
  content: string;
  attachmentUrl?: string;
}

export interface TourChatEditRequest {
  content: string;
  attachmentUrl?: string;
}

// ========== اخطار ==========

export interface ChatWarning {
  id: number;
  messageId: number;
  warnedUserId?: number;
  warnedUsername?: string;
  warnedRole?: string;
  warnedRolePersian?: string;
  reason: string;
  issuedBy: string;
  createdAt: string;
}

export interface ChatWarningRequest {
  messageId: number;
  reason: string;
}

// ========== مانیتورینگ سوپرادمین ==========

export interface AdminChatMonitorMessage {
  id: number;
  conversationId: number;
  tourId: number;
  tourName: string;
  tourCode: string;
  content: string;
  senderId: number;
  senderUsername: string;
  senderRole: "USER" | "AGENCY";
  senderRolePersian: string;
  receiverId: number;
  receiverUsername: string;
  receiverRole: string;
  receiverRolePersian: string;
  attachmentUrl?: string;
  edited: boolean;
  deleted: boolean;
  warnings: ChatWarning[];
  warningCount: number;
  createdAt: string;
}
