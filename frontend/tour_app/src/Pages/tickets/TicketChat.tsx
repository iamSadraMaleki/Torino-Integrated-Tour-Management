import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { adminTicketApi, userTicketApi } from "../../Services/ticketApi";
import {
  Ticket,
  TicketMessage,
  TicketPriorityColors,
  TicketStatusColors,
} from "../../Types/ticket";
import "./Tickets.css";

interface TicketChatProps {
  admin?: boolean;
}

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

const formatDateShort = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

// برخی نسخه‌های بک‌اند فیلد support و برخی isSupport برمی‌گردانند
const isSupportMsg = (m: TicketMessage) => m.isSupport === true || m.support === true;

// تبدیل فایل به base64 data URL
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const TicketChat: React.FC<TicketChatProps> = ({ admin = false }) => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const id = Number(ticketId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);

  // ادمین: تخصیص و بستن
  const [operators, setOperators] = useState<string[]>([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    try {
      const api = admin ? adminTicketApi : userTicketApi;
      const res = await api.getTicket(id);
      if (res.success) setTicket(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تیکت");
    }
  }, [id, admin]);

  const fetchMessages = useCallback(async () => {
    try {
      const api = admin ? adminTicketApi : userTicketApi;
      const res = await api.getMessages(id);
      if (res.success) setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [id, admin]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTicket(), fetchMessages()]).finally(() => setLoading(false));

    if (admin) {
      adminTicketApi.getOperators().then((res) => {
        if (res.success) setOperators(res.data || []);
      });
    }
  }, [fetchTicket, fetchMessages, admin]);

  // رفرش خودکار پیام‌ها و وضعیت تیکت
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
      fetchTicket();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchTicket]);

  // اسکرول به پایین با پیام جدید
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() && !attachment) return;
    setSending(true);
    setError(null);
    try {
      const api = admin ? adminTicketApi : userTicketApi;
      const res = await api.sendMessage(id, {
        content: text.trim() || "پیوست",
        attachmentUrl: attachment || undefined,
      });
      if (res.success) {
        setText("");
        setAttachment(null);
        await Promise.all([fetchMessages(), fetchTicket()]);
        // فیدبک ارسال موفق
        setSentFlash(true);
        setTimeout(() => setSentFlash(false), 2200);
      } else {
        setError(res.message || "خطا در ارسال پیام");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setError("حجم فایل نباید بیشتر از ۲.۵ مگابایت باشد");
      e.target.value = "";
      return;
    }
    try {
      const dataUrl = await toBase64(file);
      setAttachment(dataUrl);
      setError(null);
    } catch {
      setError("خطا در خواندن فایل");
    } finally {
      e.target.value = "";
    }
  };

  const handleAssign = async (operator: string) => {
    try {
      const res = await adminTicketApi.assign(id, operator);
      if (res.success) {
        setTicket(res.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در تخصیص");
    }
  };

  const handleClose = async () => {
    if (!closeReason.trim()) {
      setError("دلیل بستن تیکت را وارد کنید");
      return;
    }
    setClosing(true);
    try {
      const res = await adminTicketApi.close(id, closeReason.trim());
      if (res.success) {
        setTicket(res.data);
        setShowCloseModal(false);
        setCloseReason("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در بستن تیکت");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="tkt-loading">
        <div className="spinner" /> در حال بارگذاری گفتگو...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="tkt-empty">
        <div className="tkt-empty-icon">😕</div>
        <p>{error || "تیکت یافت نشد"}</p>
        <div style={{ marginTop: "1rem" }}>
          <button className="tkt-btn tkt-btn-ghost" onClick={() => navigate(-1)}>
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="tkt-container">
      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "0.6rem 0.9rem",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      <div className="tkt-chat-card">
        {/* هدر تیکت — مثل نمونه */}
        <div className="tkt-chat-header">
          <div className="tkt-chat-title-block">
            <h3 className="tkt-chat-title">
              <span className="tkt-serial">#{ticket.serialNumber}</span>
              <span>{ticket.title}</span>
            </h3>
            <div className="tkt-chat-meta">
              <span>
                زمان ایجاد: <b>{formatDateShort(ticket.createdAt)}</b>
              </span>
              <span>
                شماره تیکت: <b style={{ direction: "ltr", display: "inline-block" }}>{ticket.serialNumber}</b>
              </span>
              <span>
                ثبت‌کننده: <b>{ticket.creatorRolePersian} ({ticket.creatorUsername})</b>
              </span>
              <span
                className="tkt-badge"
                style={{
                  background: TicketPriorityColors[ticket.priority],
                }}
              >
                اولویت: {ticket.priorityPersian}
              </span>
              <span
                className="tkt-badge"
                style={{ background: TicketStatusColors[ticket.status] }}
              >
                {ticket.statusPersian}
              </span>
            </div>
          </div>

          <div className="tkt-chat-actions">
            {admin && !isClosed && (
              <div className="tkt-assign-wrap">
                <label>تخصیص به اپراتور</label>
                <select
                  className="tkt-assign-select"
                  value={ticket.assignedToUsername || ""}
                  onChange={(e) => e.target.value && handleAssign(e.target.value)}
                >
                  <option value="">{ticket.assignedToUsername || "انتخاب اپراتور..."}</option>
                  {operators
                    .filter((o) => o !== ticket.assignedToUsername)
                    .map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {admin && !isClosed && (
              <button
                className="tkt-btn tkt-btn-close"
                onClick={() => setShowCloseModal(true)}
              >
                ✕ بستن تیکت
              </button>
            )}
          </div>
        </div>

        {/* بنر تیکت بسته شده */}
        {isClosed && (
          <div className="tkt-closed-banner">
            <span>🔒</span>
            <div>
              <b>این تیکت بسته شده است.</b>
              {ticket.closeReason && (
                <div style={{ marginTop: "0.2rem", fontSize: "0.8rem" }}>
                  دلیل بسته شدن: {ticket.closeReason}
                  {ticket.closedBy && ` — توسط ${ticket.closedBy}`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* منطقه گفتگو */}
        <div className="tkt-chat-window">
          {messages.length === 0 ? (
            <div className="tkt-empty" style={{ border: "none", background: "transparent" }}>
              <div className="tkt-empty-icon">💬</div>
              <p>هنوز پیامی ارسال نشده است</p>
              <p style={{ fontSize: "0.8rem" }}>اولین پیام را ارسال کنید</p>
            </div>
          ) : (
            messages.map((m) => {
              const support = isSupportMsg(m);
              return (
              <div key={m.id} className={`tkt-msg-row ${support ? "support" : "user"}`}>
                <div className={`tkt-msg-avatar ${support ? "support" : "user"}`}>
                  {support ? "🔆" : (user?.username?.[0] || "👤").toUpperCase()}
                </div>
                <div className="tkt-msg-body">
                  <div className="tkt-msg-bubble">
                    {m.content}
                    {m.attachmentUrl && (
                      <div className="tkt-msg-attach">
                        <img src={m.attachmentUrl} alt="پیوست" />
                      </div>
                    )}
                  </div>
                  <span className="tkt-msg-name">
                    {m.senderRolePersian} — {m.senderUsername}
                  </span>
                  <span className="tkt-msg-time">{formatDateTime(m.createdAt)}</span>
                </div>
              </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* نوار ارسال پیام */}
        {!isClosed && (
          <div className="tkt-chat-input-bar">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <button
              className="tkt-attach-btn"
              title="پیوست تصویر"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>

            <textarea
              className="tkt-chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                admin
                  ? "پاسخ خود را بنویسید..."
                  : "پیام خود را بنویسید..."
              }
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {attachment && (
              <div
                className="tkt-attach-preview"
                title="پیوست"
                onClick={() => setAttachment(null)}
              >
                📎 تصویر ×
              </div>
            )}

            <button
              className="tkt-send-btn"
              onClick={handleSend}
              disabled={sending || (!text.trim() && !attachment)}
            >
              {sending ? "..." : "ارسال"}
            </button>

            {sentFlash && <span className="tkt-sent-flash">✓ ارسال شد</span>}
          </div>
        )}
      </div>

      {/* مودال بستن تیکت */}
      {showCloseModal && (
        <div className="tkt-modal-overlay" onClick={() => setShowCloseModal(false)}>
          <div className="tkt-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔒 بستن تیکت</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.8rem" }}>
              لطفاً دلیل بسته شدن تیکت را ثبت کنید تا به کاربر بازخورد داده شود:
            </p>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="مثلاً: مشکل شما برطرف شده است"
            />
            <div className="tkt-modal-actions">
              <button
                className="tkt-btn tkt-btn-close"
                onClick={handleClose}
                disabled={closing}
              >
                {closing ? "⏳..." : "بستن تیکت"}
              </button>
              <button
                className="tkt-btn tkt-btn-ghost"
                onClick={() => setShowCloseModal(false)}
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

export default TicketChat;
