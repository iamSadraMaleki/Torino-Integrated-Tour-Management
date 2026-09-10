import React, { useEffect, useState } from "react";
import {
  adminAnnouncementApi,
} from "../../Services/announcementApi";
import {
  Announcement,
  AnnouncementAudience,
  AnnouncementAudiencePersian,
  AnnouncementCreateRequest,
  AnnouncementPriority,
  AnnouncementPriorityColors,
  AnnouncementPriorityPersian,
} from "../../Types/announcement";
import "./AnnouncementsManagement.css";

const priorityList: AnnouncementPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const audienceList: AnnouncementAudience[] = ["ALL", "AGENCIES", "PASSENGERS", "CITY"];

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("fa-IR") : "بدون انقضا";

const AnnouncementsManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // فرم ساخت
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("MEDIUM");
  const [audience, setAudience] = useState<AnnouncementAudience>("ALL");
  const [targetCity, setTargetCity] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const res = await adminAnnouncementApi.getAll();
      if (res.success) setAnnouncements(res.data || []);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: "عنوان و متن اطلاعیه الزامی است" });
      return;
    }
    if (audience === "CITY" && !targetCity.trim()) {
      setMessage({ type: "error", text: "برای اطلاعیه بر اساس شهر، نام شهر را وارد کنید" });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    const payload: AnnouncementCreateRequest = {
      title: title.trim(),
      content: content.trim(),
      priority,
      audience,
      targetCity: audience === "CITY" ? targetCity.trim() : undefined,
      // مقدار خام datetime-local ارسال می‌شود تا Jackson آن را با LocalDateTime سرور پارس کند
      // (با toISOString به UTC تبدیل می‌شد و تاریخ انقضا چند ساعت زودتر می‌شد)
      expiresAt: expiresAt || undefined,
      isPinned,
    };

    try {
      const res = await adminAnnouncementApi.create(payload);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "اطلاعیه ساخته شد" });
        setTitle("");
        setContent("");
        setTargetCity("");
        setExpiresAt("");
        setIsPinned(false);
        fetchAll();
      } else {
        setMessage({ type: "error", text: res.message || "خطا در ساخت اطلاعیه" });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در ساخت اطلاعیه",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (a: Announcement) => {
    try {
      await adminAnnouncementApi.togglePin(a.id);
      fetchAll();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "خطا" });
    }
  };

  const handleToggleActive = async (a: Announcement) => {
    try {
      await adminAnnouncementApi.toggleActive(a.id);
      fetchAll();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "خطا" });
    }
  };

  const handleDelete = async (a: Announcement) => {
    if (!window.confirm(`اطلاعیه «${a.title}» حذف شود؟`)) return;
    try {
      await adminAnnouncementApi.remove(a.id);
      setMessage({ type: "success", text: "اطلاعیه حذف شد" });
      fetchAll();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "خطا در حذف" });
    }
  };

  return (
    <div className="announcements-container">
      <div className="page-header-simple">
        <h1>📢 اطلاعیه‌های سراسری</h1>
        <p>مدیریت محتوای داینامیک و اطلاعیه‌های سراسری</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      <div className="announcements-layout">
        {/* فرم ساخت */}
        <div className="announcement-form-card">
          <h3>✍️ ساخت اطلاعیه جدید</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>عنوان</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: تعطیلی موقت سامانه"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>متن اطلاعیه</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="متن کامل اطلاعیه..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>اولویت</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}>
                  {priorityList.map((p) => (
                    <option key={p} value={p}>
                      {AnnouncementPriorityPersian[p]}
                    </option>
                  ))}
                </select>
                <div className="priority-hint" style={{ color: AnnouncementPriorityColors[priority] }}>
                  ● {AnnouncementPriorityPersian[priority]}
                </div>
              </div>

              <div className="form-group">
                <label>مخاطب</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}>
                  {audienceList.map((a) => (
                    <option key={a} value={a}>
                      {AnnouncementAudiencePersian[a]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {audience === "CITY" && (
              <div className="form-group">
                <label>🏙️ نام شهر</label>
                <input
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  placeholder="مثلاً: تهران"
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>⏰ تاریخ انقضا</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>📌 پین کردن</label>
                <label className="pin-checkbox">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <span>نمایش ویژه در داشبورد همه</span>
                </label>
              </div>
            </div>

            <button className="btn-gradient-full" type="submit" disabled={submitting}>
              {submitting ? "⏳ در حال ساخت..." : "🚀 ارسال اطلاعیه"}
            </button>
          </form>
        </div>

        {/* تاریخچه */}
        <div className="announcement-history">
          <h3>📜 تاریخچه اطلاعیه‌ها ({announcements.length})</h3>
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="empty-state" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              هنوز اطلاعیه‌ای ارسال نشده است
            </div>
          ) : (
            <div className="announcement-list">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className={`announcement-item ${!a.isActive ? "inactive" : ""} ${a.isExpired ? "expired" : ""}`}
                >
                  <div className="announcement-item-header">
                    <div className="announcement-title-wrap">
                      {a.isPinned && <span className="pin-badge">📌</span>}
                      <h4>{a.title}</h4>
                    </div>
                    <span
                      className="priority-badge"
                      style={{ background: AnnouncementPriorityColors[a.priority] }}
                    >
                      {a.priorityPersian}
                    </span>
                  </div>
                  <p className="announcement-content">{a.content}</p>
                  <div className="announcement-item-meta">
                    <span>👥 {a.audiencePersian}{a.audience === "CITY" && a.targetCity ? ` — ${a.targetCity}` : ""}</span>
                    <span>⏳ {formatDate(a.expiresAt)}</span>
                    <span>👤 {a.createdBy}</span>
                    <span>📅 {formatDate(a.createdAt)}</span>
                    {!a.isActive && <span className="status-badge">غیرفعال</span>}
                    {a.isExpired && <span className="status-badge expired-badge">منقضی</span>}
                  </div>
                  <div className="announcement-item-actions">
                    <button
                      className={`action-btn ${a.isPinned ? "pinned" : ""}`}
                      onClick={() => handleTogglePin(a)}
                      title="پین/آنپین"
                    >
                      {a.isPinned ? "📌 پین شده" : "📌 پین"}
                    </button>
                    <button
                      className={`action-btn ${a.isActive ? "" : "active-toggle"}`}
                      onClick={() => handleToggleActive(a)}
                    >
                      {a.isActive ? "⏸ غیرفعال" : "▶ فعال"}
                    </button>
                    <button className="action-btn danger" onClick={() => handleDelete(a)}>
                      🗑 حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManagement;
