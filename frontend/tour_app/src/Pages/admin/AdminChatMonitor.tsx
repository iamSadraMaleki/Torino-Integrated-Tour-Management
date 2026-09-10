import React, { useCallback, useEffect, useState } from "react";
import { adminTourChatApi } from "../../Services/tourChatApi";
import { AdminChatMonitorMessage } from "../../Types/tourChat";
import "./AdminChatMonitor.css";

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

const AdminChatMonitor: React.FC = () => {
  const [messages, setMessages] = useState<AdminChatMonitorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // مودال اخطار
  const [warnTarget, setWarnTarget] = useState<AdminChatMonitorMessage | null>(null);
  const [warnReason, setWarnReason] = useState("");
  const [warnSending, setWarnSending] = useState(false);
  const [warnError, setWarnError] = useState("");

  const [filter, setFilter] = useState<"all" | "deleted" | "warned">("all");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminTourChatApi.getMonitorMessages();
      if (res.success) setMessages(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت پیام‌های چت");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = messages.filter((m) => {
    if (filter === "deleted") return m.deleted;
    if (filter === "warned") return m.warningCount > 0;
    return true;
  });

  const handleWarn = async () => {
    if (!warnTarget || !warnReason.trim()) return;
    setWarnSending(true);
    setWarnError("");
    try {
      const res = await adminTourChatApi.warn({
        messageId: warnTarget.id,
        reason: warnReason.trim(),
      });
      if (res.success) {
        setNotice(`✓ اخطار برای «${warnTarget.senderUsername}» صادر شد`);
        setWarnTarget(null);
        setWarnReason("");
        await fetchMessages();
        setTimeout(() => setNotice(""), 3000);
      } else {
        setWarnError(res.message || "خطا در صدور اخطار");
      }
    } catch (err: any) {
      setWarnError(err.response?.data?.message || "خطا در صدور اخطار");
    } finally {
      setWarnSending(false);
    }
  };

  return (
    <div className="acm-container">
      <div className="acm-header">
        <div>
          <h1>🛡️ مانیتورینگ چت مسافر و مدیر آژانس</h1>
          <p>
            نظارت امنیتی بر گفتگوهای تور — متن پیام، فرستنده، گیرنده و تاریخ ارسال
          </p>
        </div>
        <div className="acm-header-actions">
          <select
            className="acm-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">همه پیام‌ها ({messages.length})</option>
            <option value="warned">دارای اخطار</option>
            <option value="deleted">حذف‌شده</option>
          </select>
          <button className="btn-secondary" onClick={fetchMessages}>
            🔄 بروزرسانی
          </button>
        </div>
      </div>

      {notice && <div className="acm-notice">✅ {notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>در حال بارگذاری پیام‌ها...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="acm-empty">
          <div className="acm-empty-icon">🕵️</div>
          <p>پیامی یافت نشد</p>
        </div>
      ) : (
        <div className="acm-table-wrap">
          <table className="acm-table">
            <thead>
              <tr>
                <th>متن پیام</th>
                <th>فرستنده</th>
                <th>گیرنده</th>
                <th>تور</th>
                <th>تاریخ ارسال</th>
                <th>وضعیت</th>
                <th>اخطار</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className={m.warningCount > 0 ? "acm-row-warned" : ""}>
                  <td className="acm-cell-content">
                    <div className={`acm-content ${m.deleted ? "acm-content-deleted" : ""}`}>
                      {m.deleted ? "🗑 " : ""}
                      {m.content}
                      {m.edited && <span className="acm-edited-badge">ویرایش‌شده</span>}
                    </div>
                    {m.attachmentUrl && (
                      <a
                        className="acm-attach-link"
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📎 پیوست تصویر
                      </a>
                    )}
                    {m.warnings.length > 0 && (
                      <div className="acm-warn-reasons">
                        {m.warnings.map((w) => (
                          <div key={w.id} className="acm-warn-reason">
                            ⚠️ «{w.reason}» — توسط {w.issuedBy}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="acm-person">
                      <span className={`acm-role-badge role-${m.senderRole.toLowerCase()}`}>
                        {m.senderRolePersian}
                      </span>
                      <span className="acm-username">{m.senderUsername}</span>
                    </div>
                  </td>
                  <td>
                    <div className="acm-person">
                      <span className={`acm-role-badge role-${m.receiverRole.toLowerCase()}`}>
                        {m.receiverRolePersian}
                      </span>
                      <span className="acm-username">{m.receiverUsername}</span>
                    </div>
                  </td>
                  <td>
                    <div className="acm-tour">
                      <span>{m.tourName}</span>
                      <span className="acm-tour-code">{m.tourCode}</span>
                    </div>
                  </td>
                  <td className="acm-date">{formatDateTime(m.createdAt)}</td>
                  <td>
                    {m.deleted ? (
                      <span className="acm-status deleted">حذف‌شده</span>
                    ) : m.edited ? (
                      <span className="acm-status edited">ویرایش‌شده</span>
                    ) : (
                      <span className="acm-status normal">عادی</span>
                    )}
                  </td>
                  <td>
                    {m.warningCount > 0 ? (
                      <span className="acm-warn-count">⚠️ {m.warningCount}</span>
                    ) : (
                      <span className="acm-warn-none">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="acm-warn-btn"
                      onClick={() => {
                        setWarnTarget(m);
                        setWarnReason("");
                        setWarnError("");
                      }}
                    >
                      ⚠️ اخطار
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال صدور اخطار */}
      {warnTarget && (
        <div className="acm-modal-overlay" onClick={() => setWarnTarget(null)}>
          <div className="acm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ صدور اخطار برای پیام نامرتبط</h3>
            <div className="acm-modal-meta">
              <span>
                فرستنده: <b>{warnTarget.senderUsername}</b> ({warnTarget.senderRolePersian})
              </span>
              <span className="acm-modal-msg">«{warnTarget.content}»</span>
            </div>
            <textarea
              className="acm-modal-input"
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              placeholder="دلیل اخطار را وارد کنید..."
              rows={3}
              autoFocus
            />
            {warnError && <div className="alert alert-error">{warnError}</div>}
            <div className="acm-modal-actions">
              <button
                className="acm-modal-submit"
                onClick={handleWarn}
                disabled={warnSending || !warnReason.trim()}
              >
                {warnSending ? "..." : "صدور اخطار"}
              </button>
              <button
                className="acm-modal-cancel"
                onClick={() => setWarnTarget(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatMonitor;
