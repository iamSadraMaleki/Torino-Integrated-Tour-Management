import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userTicketApi } from "../../Services/ticketApi";
import {
  Ticket,
  TicketPriorityColors,
  TicketStatusColors,
} from "../../Types/ticket";
import "./Tickets.css";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await userTicketApi.getMyTickets();
      if (res.success) setTickets(res.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="tkt-container">
      <div className="tkt-header">
        <div>
          <h1>🎫 تیکت‌های پشتیبانی</h1>
          <p>مشاهده وضعیت تیکت‌ها و گفتگو با پشتیبانی</p>
        </div>
        <Link to="create" className="tkt-btn tkt-btn-primary">
          ✍️ ثبت تیکت جدید
        </Link>
      </div>

      {loading ? (
        <div className="tkt-loading">
          <div className="spinner" /> در حال بارگذاری...
        </div>
      ) : tickets.length === 0 ? (
        <div className="tkt-empty">
          <div className="tkt-empty-icon">📭</div>
          <p>هنوز تیکتی ثبت نکرده‌اید</p>
          <p style={{ fontSize: "0.85rem" }}>
            برای ارتباط با پشتیبانی، یک تیکت جدید بسازید.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Link to="create" className="tkt-btn tkt-btn-primary">
              ✍️ ثبت اولین تیکت
            </Link>
          </div>
        </div>
      ) : (
        <div className="tkt-list">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`tkt-card ${t.status === "CLOSED" ? "closed" : ""}`}
              onClick={() => navigate(`${t.id}`)}
            >
              <div className="tkt-card-header">
                <h4 className="tkt-card-title">
                  <span className="tkt-serial">#{t.serialNumber}</span>
                  <span>{t.title}</span>
                </h4>
                <div className="tkt-badges">
                  <span
                    className="tkt-badge"
                    style={{ background: TicketPriorityColors[t.priority] }}
                  >
                    {t.priorityPersian}
                  </span>
                  <span
                    className="tkt-badge"
                    style={{ background: TicketStatusColors[t.status] }}
                  >
                    {t.statusPersian}
                  </span>
                </div>
              </div>
              <p className="tkt-card-content">
                {t.content.length > 140 ? t.content.slice(0, 140) + "…" : t.content}
              </p>
              <div className="tkt-card-meta">
                <span>📅 {formatDate(t.createdAt)}</span>
                <span>💬 {t.messageCount} پیام</span>
                <span>
                  📌 آخرین پیام: {formatDate(t.lastMessageAt)}
                </span>
                {t.assignedToUsername && (
                  <span>👤 اپراتور: {t.assignedToUsername}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
