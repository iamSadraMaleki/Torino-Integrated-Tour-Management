import React, { useEffect, useState } from "react";
import { announcementApi } from "../../Services/announcementApi";
import {
  Announcement,
  AnnouncementPriority,
  AnnouncementPriorityColors,
} from "../../Types/announcement";
import "./AnnouncementsBanner.css";

const priorityOrder: Record<AnnouncementPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "";

const AnnouncementsBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementApi.getActive();
      if (res.success) setAnnouncements(res.data || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // به‌روزرسانی خودکار هر ۶۰ ثانیه تا اطلاعیه‌های جدید و پین‌شده فوری دیده شوند
    const interval = setInterval(fetchAnnouncements, 60000);
    const onFocus = () => fetchAnnouncements();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (loading) return null;
  if (announcements.length === 0) return null;

  // مرتب‌سازی: پین‌شده‌ها اول، بعد اولویت، بعد تاریخ
  const sorted = [...announcements].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const pw = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (pw !== 0) return pw;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const hasCritical = announcements.some((a) => a.priority === "CRITICAL");
  const displayed = collapsed ? sorted.slice(0, 2) : sorted;

  return (
    <div className={`announcements-banner ${hasCritical ? "has-critical" : ""}`}>
      <div className="announcements-banner-header">
        <div className="announcements-banner-title">
          <span className="banner-icon">📢</span>
          <strong>اطلاعیه‌های سامانه</strong>
          {announcements.length > 0 && (
            <span className="announcement-count">{announcements.length}</span>
          )}
        </div>
        <button
          className="announcements-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "نمایش همه" : "جمع کردن"}
        >
          {collapsed ? "▾ نمایش همه" : "▴ جمع کردن"}
        </button>
      </div>

      <div className="announcements-banner-list">
        {displayed.map((a) => (
          <div
            key={a.id}
            className={`announcement-banner-item priority-${a.priority.toLowerCase()} ${
              a.isPinned ? "pinned" : ""
            }`}
            style={{
              borderRightColor: AnnouncementPriorityColors[a.priority],
              background:
                a.isPinned
                  ? `linear-gradient(135deg, ${AnnouncementPriorityColors[a.priority]}1a, #ffffff)`
                  : "#ffffff",
            }}
          >
            <div className="announcement-banner-item-head">
              <span className="announcement-banner-priority">
                {a.isPinned && <span className="pin-star">📌</span>}
                <span
                  className="priority-chip"
                  style={{ background: AnnouncementPriorityColors[a.priority] }}
                >
                  {a.priorityPersian}
                </span>
              </span>
              <span className="announcement-banner-title">{a.title}</span>
              {a.expiresAt && (
                <span className="announcement-banner-expiry">
                  ⏳ تا {formatDate(a.expiresAt)}
                </span>
              )}
            </div>
            <p className="announcement-banner-content">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsBanner;
