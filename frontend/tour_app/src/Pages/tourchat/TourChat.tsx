import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ceoTourChatApi, userTourChatApi } from "../../Services/tourChatApi";
import { TourChatMessage, TourConversation } from "../../Types/tourChat";
import "./TourChats.css";

interface TourChatProps {
  /** user = مسافر / ceo = مدیر آژانس */
  role: "user" | "ceo";
}

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

// برخی نسخه‌ها فیلد isAgency و برخی agency برمی‌گردانند
const isAgencyMsg = (m: TourChatMessage) => m.isAgency === true || m.agency === true;

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const TourChat: React.FC<TourChatProps> = ({ role }) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const id = Number(conversationId);
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<TourConversation | null>(null);
  const [messages, setMessages] = useState<TourChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ویرایش پیام
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const api = role === "ceo" ? ceoTourChatApi : userTourChatApi;

  const isOwnMessage = (m: TourChatMessage) => {
    const mineIsAgency = role === "ceo";
    return isAgencyMsg(m) === mineIsAgency;
  };

  const fetchConversation = useCallback(async () => {
    try {
      const res = await api.getConversation(id);
      if (res.success) setConversation(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت گفتگو");
    }
  }, [id, role]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.getMessages(id);
      if (res.success) setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  }, [id, role]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchConversation(), fetchMessages()]).finally(() => setLoading(false));
  }, [fetchConversation, fetchMessages]);

  // رفرش خودکار هر ۱۰ ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
      fetchConversation();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchConversation]);

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
      const res = await api.sendMessage(id, {
        content: text.trim() || "پیوست",
        attachmentUrl: attachment || undefined,
      });
      if (res.success) {
        setText("");
        setAttachment(null);
        await Promise.all([fetchMessages(), fetchConversation()]);
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

  // شروع ویرایش
  const startEdit = (m: TourChatMessage) => {
    setEditingId(m.id);
    setEditText(m.content);
    setError(null);
  };

  // ذخیره ویرایش
  const saveEdit = async () => {
    if (editingId == null || !editText.trim()) return;
    setError(null);
    try {
      const res = await api.editMessage(id, editingId, { content: editText.trim() });
      if (res.success) {
        setEditingId(null);
        setEditText("");
        await Promise.all([fetchMessages(), fetchConversation()]);
      } else {
        setError(res.message || "خطا در ویرایش پیام");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ویرایش پیام");
    }
  };

  // حذف پیام
  const handleDelete = async (m: TourChatMessage) => {
    if (!window.confirm("این پیام حذف شود؟")) return;
    setError(null);
    try {
      const res = await api.deleteMessage(id, m.id);
      if (res.success) {
        await Promise.all([fetchMessages(), fetchConversation()]);
      } else {
        setError(res.message || "خطا در حذف پیام");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف پیام");
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری گفتگو...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="tc-container">
        <div className="tc-empty">
          <div className="tc-empty-icon">😕</div>
          <p>{error || "گفتگو یافت نشد"}</p>
          <div style={{ marginTop: "1rem" }}>
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              بازگشت
            </button>
          </div>
        </div>
      </div>
    );
  }

  const otherParty =
    role === "ceo"
      ? `مسافر: ${conversation.passengerUsername}`
      : `آژانس: ${conversation.ceoUsername}`;

  return (
    <div className="tc-container">
      {error && <div className="tc-error-banner">{error}</div>}

      <div className="tc-chat-card">
        {/* هدر گفتگو */}
        <div className="tc-chat-header">
          <div>
            <h3>🎫 {conversation.tourName}</h3>
            <div className="tc-chat-sub">
              <span>کد: {conversation.tourCode}</span>
              <span>📅 حرکت: {formatDateTime(conversation.departureDate)}</span>
              <span>{otherParty}</span>
            </div>
          </div>
          <button
            className="tc-back-btn"
            onClick={() =>
              navigate(role === "ceo" ? "/ceo/dashboard/chat" : "/user/dashboard/chat")
            }
          >
            ← بازگشت
          </button>
        </div>

        {/* منطقه گفتگو */}
        <div className="tc-chat-window">
          {messages.length === 0 ? (
            <div className="tc-empty" style={{ border: "none", background: "transparent" }}>
              <div className="tc-empty-icon">💬</div>
              <p>هنوز پیامی ارسال نشده است</p>
              <p style={{ fontSize: "0.8rem" }}>اولین پیام را ارسال کنید</p>
            </div>
          ) : (
            messages.map((m) => {
              const agency = isAgencyMsg(m);
              const mine = isOwnMessage(m);

              // پیام حذف‌شده
              if (m.isDeleted) {
                return (
                  <div
                    key={m.id}
                    className={`tc-msg-row ${agency ? "agency" : "passenger"}`}
                  >
                    <div className={`tc-msg-avatar ${agency ? "agency" : "passenger"}`}>
                      {agency ? "🏢" : "🧑"}
                    </div>
                    <div className="tc-msg-body">
                      <div className="tc-msg-bubble tc-msg-deleted">
                        🗑 این پیام حذف شده است
                      </div>
                      <span className="tc-msg-time">{formatDateTime(m.createdAt)}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`tc-msg-row ${agency ? "agency" : "passenger"}`}
                >
                  <div className={`tc-msg-avatar ${agency ? "agency" : "passenger"}`}>
                    {agency ? "🏢" : (m.senderUsername?.[0] || "🧑").toUpperCase()}
                  </div>
                  <div className="tc-msg-body">
                    {editingId === m.id ? (
                      <div className="tc-msg-edit-box">
                        <textarea
                          className="tc-edit-textarea"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          autoFocus
                        />
                        <div className="tc-edit-actions">
                          <button
                            className="tc-edit-save"
                            onClick={saveEdit}
                            disabled={!editText.trim()}
                          >
                            ✓ ذخیره
                          </button>
                          <button
                            className="tc-edit-cancel"
                            onClick={() => setEditingId(null)}
                          >
                            ✕ انصراف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="tc-msg-bubble">
                        {m.content}
                        {m.isEdited && (
                          <span className="tc-msg-edited"> (ویرایش شده)</span>
                        )}
                        {m.attachmentUrl && (
                          <div className="tc-msg-attach">
                            <img src={m.attachmentUrl} alt="پیوست" />
                          </div>
                        )}
                      </div>
                    )}
                    <span className="tc-msg-name">
                      {m.senderRolePersian} — {m.senderUsername}
                    </span>
                    <span className="tc-msg-time">{formatDateTime(m.createdAt)}</span>

                    {/* اکشن‌های ویرایش/حذف — فقط برای پیام‌های خودم */}
                    {mine && editingId !== m.id && (
                      <div className="tc-msg-actions">
                        <button
                          className="tc-msg-action"
                          title="ویرایش پیام"
                          onClick={() => startEdit(m)}
                        >
                          ✏️
                        </button>
                        <button
                          className="tc-msg-action tc-msg-action-danger"
                          title="حذف پیام"
                          onClick={() => handleDelete(m)}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* نوار ارسال */}
        <div className="tc-chat-input-bar">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <button
            className="tc-attach-btn"
            title="پیوست تصویر"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>

          <textarea
            className="tc-chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="پیام خود را بنویسید..."
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
              className="tc-attach-preview"
              title="پیوست"
              onClick={() => setAttachment(null)}
            >
              📎 تصویر ×
            </div>
          )}

          <button
            className="tc-send-btn"
            onClick={handleSend}
            disabled={sending || (!text.trim() && !attachment)}
          >
            {sending ? "..." : "ارسال"}
          </button>

          {sentFlash && <span className="tc-sent-flash">✓ ارسال شد</span>}
        </div>
      </div>
    </div>
  );
};

export default TourChat;
