import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ceoTourChatApi, userTourChatApi } from "../../Services/tourChatApi";
import { ChatWarning, TourConversation } from "../../Types/tourChat";
import "./TourChats.css";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

const formatDateShort = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

interface TourChatsProps {
  /** user = مسافر / ceo = مدیر آژانس */
  role: "user" | "ceo";
}

const TourChats: React.FC<TourChatsProps> = ({ role }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<TourConversation[]>([]);
  const [warnings, setWarnings] = useState<ChatWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const api = role === "ceo" ? ceoTourChatApi : userTourChatApi;

  const fetchConversations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getMyConversations();
      if (res.success) setConversations(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت گفتگوها");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarnings = async () => {
    try {
      const res = await api.getMyWarnings();
      if (res.success) setWarnings(res.data || []);
    } catch {
      // اخطارها اختیاری‌اند — در صورت خطا نادیده بگیر
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchWarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const isCeo = role === "ceo";
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="tc-container">
      <div className="tc-header">
        <div>
          <h1>{isCeo ? "💬 اینباکس گفتگو با مسافران" : "💬 اینباکس گفتگو با مدیر آژانس"}</h1>
          <p>
            {isCeo
              ? "گفتگو با مسافران تورهای خود — قبل یا بعد از رزرو"
              : "قبل یا بعد از رزرو، سوالات خود را از مدیر آژانس بپرسید"}
          </p>
        </div>
        <div className="tc-header-actions">
          {totalUnread > 0 && (
            <span className="tc-inbox-unread-total">🔴 {totalUnread} پیام نخوانده</span>
          )}
          <button
            className="btn-secondary"
            onClick={() => {
              fetchConversations();
              fetchWarnings();
            }}
            style={{ whiteSpace: "nowrap" }}
          >
            🔄 بروزرسانی
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* اخطارهای امنیتی (اینباکس) */}
      {warnings.length > 0 && (
        <div className="tc-warnings-box">
          <div className="tc-warnings-title">⚠️ اخطارهای دریافتی ({warnings.length})</div>
          {warnings.map((w) => (
            <div key={w.id} className="tc-warning-item">
              <span className="tc-warning-reason">«{w.reason}»</span>
              <span className="tc-warning-meta">
                صادرشده توسط: {w.issuedBy} — {formatDate(w.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>در حال بارگذاری گفتگوها...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="tc-empty">
          <div className="tc-empty-icon">💬</div>
          <p>هنوز گفتگویی وجود ندارد</p>
          <p style={{ fontSize: "0.85rem" }}>
            {isCeo
              ? "وقتی مسافری گفتگویی را شروع کند، اینجا نمایش داده می‌شود."
              : "از صفحه «رزرو تور» روی دکمه «گفتگو با مدیر آژانس» بزنید."}
          </p>
        </div>
      ) : (
        <div className="tc-list">
          {conversations.map((c) => {
            const unread = c.unreadCount || 0;
            return (
              <div
                key={c.id}
                className={`tc-card ${unread > 0 ? "tc-card-unread" : ""}`}
                onClick={() => navigate(`${c.id}`)}
              >
                <div className="tc-card-avatar">{isCeo ? "🧑" : "🏢"}</div>
                <div className="tc-card-body">
                  <h4 className="tc-card-title">
                    <span>{c.tourName}</span>
                    <span className="tc-tour-code">{c.tourCode}</span>
                    {unread > 0 && <span className="tc-unread-dot" />}
                  </h4>
                  <div className="tc-card-meta">
                    <span>
                      {isCeo ? (
                        <>👤 مسافر: {c.passengerUsername}</>
                      ) : (
                        <>🏢 آژانس: {c.ceoUsername}</>
                      )}
                    </span>
                    <span>📅 {formatDateShort(c.departureDate)}</span>
                    <span>💬 {c.messageCount} پیام</span>
                  </div>
                  {c.lastMessagePreview && (
                    <div className="tc-card-preview">{c.lastMessagePreview}</div>
                  )}
                </div>
                <div className="tc-card-left">
                  <span className="tc-card-time">
                    {c.lastMessageAt ? formatDate(c.lastMessageAt) : "-"}
                  </span>
                  {unread > 0 ? (
                    <span className="tc-count-badge tc-count-unread">{unread}</span>
                  ) : c.messageCount > 0 ? (
                    <span className="tc-count-badge">{c.messageCount}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TourChats;
