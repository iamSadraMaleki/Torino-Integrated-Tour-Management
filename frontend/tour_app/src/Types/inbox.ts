// ========== صندوق دریافت پیام (اینباکس) ==========

export type InboxMessageType =
  | "SYSTEM"
  | "ADMIN"
  | "WARNING"
  | "SUSPENSION"
  | "UNSUSPENSION";

export interface InboxMessage {
  id: number;
  senderUsername: string;
  senderRole: string;
  senderRolePersian: string;
  type: InboxMessageType;
  title: string;
  content: string;
  referenceId?: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface InboxStats {
  total: number;
  unread: number;
}

export interface InboxSendRequest {
  recipientUsername: string;
  title: string;
  content: string;
}

/** تاریخچه ارسال — برای پنل سوپرادمین (به کی چه چیزی ارسال شده) */
export interface InboxHistoryMessage {
  id: number;
  recipientUsername: string;
  recipientRole: string;
  recipientRolePersian: string;
  senderUsername: string;
  senderRole: string;
  senderRolePersian: string;
  type: InboxMessageType;
  title: string;
  content: string;
  referenceId?: number | null;
  isRead: boolean;
  createdAt: string;
}

/** نقش/برچسب فارسی برای نمایش آیکون و رنگ */
export const INBOX_TYPE_META: Record<InboxMessageType, { icon: string; label: string }> = {
  SYSTEM: { icon: "🛎️", label: "سیستمی" },
  ADMIN: { icon: "📨", label: "پیام خصوصی" },
  WARNING: { icon: "⚠️", label: "اخطار" },
  SUSPENSION: { icon: "🚫", label: "تعلیق حساب" },
  UNSUSPENSION: { icon: "✅", label: "رفع تعلیق" },
};
