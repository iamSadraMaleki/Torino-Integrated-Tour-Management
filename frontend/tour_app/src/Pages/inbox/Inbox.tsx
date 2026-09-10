import React, { useCallback, useEffect, useState } from "react";
import { ceoInboxApi, userInboxApi } from "../../Services/inboxApi";
import { INBOX_TYPE_META, InboxMessage, InboxStats } from "../../Types/inbox";
import "./Inbox.css";

interface InboxProps {
  /** user = مسافر / ceo = مدیر آژانس */
  role: "user" | "ceo";
}

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

const Inbox: React.FC<InboxProps> = ({ role }) => {
  const api = role === "ceo" ? ceoInboxApi : userInboxApi;

  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [stats, setStats] = useState<InboxStats>({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [msgsRes, statsRes] = await Promise.all([
        api.getMessages(),
        api.getStats(),
      ]);
      if (msgsRes.success) setMessages(msgsRes.data || []);
      if (statsRes.success) setStats(statsRes.data || { total: 0, unread: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت پیام‌ها");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleOpen = async (m: InboxMessage) => {
    if (m.isRead) return;
    try {
      const res = await api.markRead(m.id);
      if (res.success) {
        setMessages((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, isRead: true } : x))
        );
        setStats((s) => ({ ...s, unread: Math.max(0, s.unread - 1) }));
      }
    } catch {
      // در صورت خطا، فقط نمایش تغییر نمی‌کند
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markAllRead();
      if (res.success) {
        setMessages((prev) => prev.map((x) => ({ ...x, isRead: true })));
        setStats((s) => ({ ...s, unread: 0 }));
        setNotice("✓ همه پیام‌ها به‌عنوان خوانده‌شده علامت‌گذاری شد");
        setTimeout(() => setNotice(""), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در علامت‌گذاری پیام‌ها");
    }
  };

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <div>
          <h1>📥 اینباکس</h1>
          <p>پیام‌های خصوصی، اخطارها و اطلاع‌رسانی‌های سیستم</p>
        </div>
        <div className="inbox-header-actions">
          {stats.unread > 0 && (
            <span className="inbox-unread-total">🔴 {stats.unread} پیام نخوانده</span>
          )}
          <button
            className="btn-secondary"
            onClick={handleMarkAllRead}
            disabled={stats.unread === 0}
            style={{ whiteSpace: "nowrap" }}
          >
            ✓ خواندن همه
          </button>
          <button
            className="btn-secondary"
            onClick={fetchAll}
            style={{ whiteSpace: "nowrap" }}
          >
            🔄 بروزرسانی
          </button>
        </div>
      </div>

      {notice && <div className="inbox-notice">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>در حال بارگذاری پیام‌ها...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="inbox-empty">
          <div className="inbox-empty-icon">📭</div>
          <p>اینباکس شما خالی است</p>
          <p style={{ fontSize: "0.85rem" }}>
            پیام‌های خصوصی، اخطارها و اطلاع‌رسانی‌ها اینجا نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="inbox-list">
          {messages.map((m) => {
            const meta = INBOX_TYPE_META[m.type] || INBOX_TYPE_META.SYSTEM;
            return (
              <div
                key={m.id}
                className={`inbox-card ${m.isRead ? "" : "inbox-card-unread"}`}
                onClick={() => handleOpen(m)}
              >
                <div className={`inbox-icon type-${m.type.toLowerCase()}`}>
                  {meta.icon}
                </div>
                <div className="inbox-body">
                  <div className="inbox-title-row">
                    <h4 className="inbox-title">{m.title}</h4>
                    <span className="inbox-type-badge">{meta.label}</span>
                    {!m.isRead && <span className="inbox-unread-dot" />}
                  </div>
                  <p className="inbox-content">{m.content}</p>
                  <div className="inbox-meta">
                    <span>
                      {m.senderRolePersian} — {m.senderUsername}
                    </span>
                    <span>{formatDate(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inbox;
