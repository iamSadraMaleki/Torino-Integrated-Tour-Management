import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminTicketApi } from "../../Services/ticketApi";
import {
  Ticket,
  TicketPriority,
  TicketPriorityColors,
  TicketPriorityPersian,
  TicketStats,
  TicketStatus,
  TicketStatusColors,
} from "../../Types/ticket";
import "../tickets/Tickets.css";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "-";

const statusFilters: Array<{ key: TicketStatus | "ALL"; label: string }> = [
  { key: "ALL", label: "همه" },
  { key: "OPEN", label: "در حال بررسی" },
  { key: "IN_PROGRESS", label: "در حال رسیدگی" },
  { key: "ANSWERED", label: "پاسخ داده شد" },
  { key: "CLOSED", label: "بسته شده" },
];

const TicketsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");

  const fetchData = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        adminTicketApi.getAll(),
        adminTicketApi.getStats(),
      ]);
      if (ticketsRes.success) setTickets(ticketsRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered =
    filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  const priorityOrder: TicketPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const sortedTickets = [...filtered].sort((a, b) => {
    const w = (p: TicketPriority) =>
      p === "CRITICAL" ? 4 : p === "HIGH" ? 3 : p === "MEDIUM" ? 2 : 1;
    return w(b.priority) - w(a.priority);
  });

  const maxDayCount = Math.max(1, ...(stats?.last7Days.map((d) => d.count) || [1]));

  return (
    <div className="tkt-container">
      <div className="tkt-header">
        <div>
          <h1>🎫 پشتیبانی و تیکت‌ها</h1>
          <p>مدیریت اختلافات و پشتیبانی پیشرفته — اولویت‌بندی، تخصیص و پاسخ</p>
        </div>
      </div>

      {loading ? (
        <div className="tkt-loading">
          <div className="spinner" /> در حال بارگذاری...
        </div>
      ) : (
        <>
          {/* آمار */}
          <div className="tkt-stats-grid">
            <div className="tkt-stat-box">
              <div className="tkt-stat-icon">📥</div>
              <p className="tkt-stat-num">{stats?.total ?? 0}</p>
              <p className="tkt-stat-label">کل تیکت‌ها</p>
            </div>
            <div className="tkt-stat-box">
              <div className="tkt-stat-icon">⏳</div>
              <p className="tkt-stat-num">{stats?.open ?? 0}</p>
              <p className="tkt-stat-label">در حال بررسی</p>
            </div>
            <div className="tkt-stat-box">
              <div className="tkt-stat-icon">👨‍💻</div>
              <p className="tkt-stat-num">{stats?.inProgress ?? 0}</p>
              <p className="tkt-stat-label">در حال رسیدگی</p>
            </div>
            <div className="tkt-stat-box">
              <div className="tkt-stat-icon">✅</div>
              <p className="tkt-stat-num">{stats?.answered ?? 0}</p>
              <p className="tkt-stat-label">پاسخ داده شد</p>
            </div>
            <div className="tkt-stat-box">
              <div className="tkt-stat-icon">🔒</div>
              <p className="tkt-stat-num">{stats?.closed ?? 0}</p>
              <p className="tkt-stat-label">بسته شده</p>
            </div>
          </div>

          {/* نمودار ۷ روز اخیر + اولویت‌ها */}
          {stats && (
            <div className="tkt-chart-card">
              <h4>📊 نمودار عملکرد پشتیبانی — تیکت‌های ۷ روز اخیر</h4>
              <div className="tkt-bar-chart">
                {stats.last7Days.map((d) => (
                  <div key={d.date} className="tkt-bar-col">
                    <span className="tkt-bar-value">{d.count}</span>
                    <div
                      className="tkt-bar-fill"
                      style={{
                        height: `${Math.max(4, (d.count / maxDayCount) * 80)}px`,
                      }}
                    />
                    <span className="tkt-bar-label">
                      {new Date(d.date + "T00:00:00").toLocaleDateString("fa-IR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: "1.2rem" }}>🚦 توزیع اولویت‌ها</h4>
              <div className="tkt-priority-chips">
                {priorityOrder.map((p) => (
                  <div
                    key={p}
                    className="tkt-priority-chip"
                    style={{ background: TicketPriorityColors[p] }}
                  >
                    <b>{stats.byPriority?.[p] ?? 0}</b>
                    <span>{TicketPriorityPersian[p]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* فیلتر وضعیت */}
          <div className="tkt-filters">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                className={`tkt-filter-btn ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* لیست تیکت‌ها */}
          {sortedTickets.length === 0 ? (
            <div className="tkt-empty">
              <div className="tkt-empty-icon">📭</div>
              <p>تیکتی یافت نشد</p>
            </div>
          ) : (
            <div className="tkt-list">
              {sortedTickets.map((t) => (
                <div
                  key={t.id}
                  className={`tkt-card ${t.status === "CLOSED" ? "closed" : ""}`}
                  style={{ borderRightColor: TicketPriorityColors[t.priority] }}
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
                    {t.content.length > 130 ? t.content.slice(0, 130) + "…" : t.content}
                  </p>
                  <div className="tkt-card-meta">
                    <span>👤 {t.creatorRolePersian}: {t.creatorUsername}</span>
                    <span>📅 {formatDate(t.createdAt)}</span>
                    <span>💬 {t.messageCount} پیام</span>
                    <span>
                      👨‍💻 اپراتور: {t.assignedToUsername || "تخصیص نیافته"}
                    </span>
                    {t.status === "ANSWERED" && (
                      <span style={{ color: "#059669", fontWeight: 600 }}>
                        ⏱ در انتظار پاسخ کاربر
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketsManagement;
