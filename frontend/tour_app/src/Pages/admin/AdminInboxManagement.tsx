import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminInboxApi } from "../../Services/inboxApi";
import { adminUserApi } from "../../services/adminApi";
import { INBOX_TYPE_META, InboxHistoryMessage } from "../../Types/inbox";
import "./AdminInboxManagement.css";

interface UserItem {
  id: number;
  username: string;
  email: string;
  mobile: string;
  roles: string[];
  enabled: boolean;
}

const rolePersian = (roles: string[]) => {
  if (roles.includes("ROLE_SUPERADMIN")) return "سوپرادمین";
  if (roles.includes("ROLE_ADMIN")) return "ادمین";
  if (roles.includes("ROLE_CEO")) return "مدیر آژانس";
  return "مسافر";
};

const formatDateTime = (date?: string) =>
  date
    ? new Date(date).toLocaleString("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const AdminInboxManagement: React.FC = () => {
  const [tab, setTab] = useState<"send" | "suspended" | "history">("send");

  // ---------- ارسال پیام خصوصی ----------
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  // ---------- کاربران معلق ----------
  const [suspended, setSuspended] = useState<UserItem[]>([]);

  // ---------- تاریخچه ارسال ----------
  const [history, setHistory] = useState<InboxHistoryMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyType, setHistoryType] = useState<string>("ALL");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const usersList = await adminUserApi.getAllUsers();
      setUsers(usersList || []);
    } catch {
      // بدون دسترسی به لیست کامل، فقط لیست معلق‌ها کار می‌کند
      setUsers([]);
    }
  }, []);

  const loadSuspended = useCallback(async () => {
    try {
      const res = await adminInboxApi.getSuspendedUsers();
      if (res.success) setSuspended(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت کاربران معلق");
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await adminInboxApi.getHistory();
      if (res.success) setHistory(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تاریخچه ارسال");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadSuspended();
    loadHistory();
  }, [loadUsers, loadSuspended, loadHistory]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return history.filter((m) => {
      if (historyType !== "ALL" && m.type !== historyType) return false;
      if (!q) return true;
      return (
        m.recipientUsername.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        (m.senderUsername || "").toLowerCase().includes(q)
      );
    });
  }, [history, historySearch, historyType]);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!recipient || !title.trim() || !content.trim()) {
      setError("گیرنده، عنوان و متن پیام الزامی است");
      return;
    }
    setSending(true);
    setError("");
    setNotice("");
    try {
      const res = await adminInboxApi.send({
        recipientUsername: recipient,
        title: title.trim(),
        content: content.trim(),
      });
      if (res.success) {
        setNotice(`✓ پیام به اینباکس «${recipient}» ارسال شد`);
        setRecipient("");
        setTitle("");
        setContent("");
      } else {
        setError(res.message || "خطا در ارسال پیام");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const handleUnsuspend = async (user: UserItem) => {
    if (!window.confirm(`حساب «${user.username}» رفع تعلیق شود؟`)) return;
    setError("");
    setNotice("");
    try {
      const res = await adminInboxApi.unsuspend(user.id);
      if (res.success) {
        setNotice(`✓ حساب «${user.username}» رفع تعلیق شد و به او اطلاع‌رسانی شد`);
        await loadSuspended();
      } else {
        setError(res.message || "خطا در رفع تعلیق");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در رفع تعلیق");
    }
  };

  return (
    <div className="aim-container">
      <div className="aim-header">
        <div>
          <h1>📨 اینباکس و مدیریت پیام‌ها</h1>
          <p>ارسال پیام خصوصی به کاربران و مدیریت حساب‌های معلق</p>
        </div>
      </div>

      <div className="aim-tabs">
        <button
          className={`aim-tab ${tab === "send" ? "active" : ""}`}
          onClick={() => setTab("send")}
        >
          📨 ارسال پیام خصوصی
        </button>
        <button
          className={`aim-tab ${tab === "suspended" ? "active" : ""}`}
          onClick={() => setTab("suspended")}
        >
          🚫 کاربران معلق ({suspended.length})
        </button>
        <button
          className={`aim-tab ${tab === "history" ? "active" : ""}`}
          onClick={() => setTab("history")}
        >
          🗂️ تاریخچه ارسال ({history.length})
        </button>
      </div>

      {notice && <div className="aim-notice">✅ {notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {tab === "send" && (
        <div className="aim-send-card">
          <div className="aim-form-group">
            <label>گیرنده (جستجو بر اساس نام کاربری یا ایمیل)</label>
            <input
              className="aim-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی کاربر..."
            />
            <div className="aim-user-list">
              {filteredUsers.length === 0 ? (
                <div className="aim-no-users">کاربری یافت نشد</div>
              ) : (
                filteredUsers.slice(0, 40).map((u) => (
                  <div
                    key={u.id}
                    className={`aim-user-item ${recipient === u.username ? "selected" : ""}`}
                    onClick={() => {
                      setRecipient(u.username);
                      setSearch("");
                    }}
                  >
                    <span className="aim-user-name">👤 {u.username}</span>
                    <span className="aim-user-role">{rolePersian(u.roles)}</span>
                    {!u.enabled && <span className="aim-user-suspended">معلق</span>}
                  </div>
                ))
              )}
            </div>
            {recipient && (
              <div className="aim-recipient-selected">گیرنده انتخاب‌شده: {recipient}</div>
            )}
          </div>

          <div className="aim-form-group">
            <label>عنوان پیام</label>
            <input
              className="aim-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: اطلاعیه مهم"
              maxLength={200}
            />
          </div>

          <div className="aim-form-group">
            <label>متن پیام</label>
            <textarea
              className="aim-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="متن پیام خصوصی..."
              rows={4}
              maxLength={4000}
            />
          </div>

          <button
            className="aim-send-btn"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "در حال ارسال..." : "📨 ارسال به اینباکس"}
          </button>
        </div>
      )}

      {tab === "suspended" && (
        <div className="aim-suspend-card">
          {suspended.length === 0 ? (
            <div className="aim-empty">
              <div className="aim-empty-icon">✅</div>
              <p>هیچ کاربر معلقی وجود ندارد</p>
            </div>
          ) : (
            <div className="aim-suspend-table-wrap">
              <table className="aim-suspend-table">
                <thead>
                  <tr>
                    <th>نام کاربری</th>
                    <th>ایمیل</th>
                    <th>موبایل</th>
                    <th>نقش</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {suspended.map((u) => (
                    <tr key={u.id}>
                      <td className="aim-cell-name">👤 {u.username}</td>
                      <td className="aim-cell-ltr">{u.email || "-"}</td>
                      <td className="aim-cell-ltr">{u.mobile || "-"}</td>
                      <td>{rolePersian(u.roles)}</td>
                      <td>
                        <span className="aim-status suspended">🚫 معلق</span>
                      </td>
                      <td>
                        <button
                          className="aim-unsuspend-btn"
                          onClick={() => handleUnsuspend(u)}
                        >
                          ✅ رفع تعلیق
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="aim-history-card">
          <div className="aim-history-toolbar">
            <input
              className="aim-search"
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="جستجو در گیرنده، عنوان یا متن پیام..."
            />
            <select
              className="aim-type-filter"
              value={historyType}
              onChange={(e) => setHistoryType(e.target.value)}
            >
              <option value="ALL">همه انواع</option>
              {Object.entries(INBOX_TYPE_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.icon} {meta.label}
                </option>
              ))}
            </select>
            <button className="btn-secondary" onClick={loadHistory}>
              بروزرسانی
            </button>
          </div>

          {historyLoading ? (
            <div className="aim-empty">
              <div className="loading-container">
                <div className="spinner" />
                <p>در حال بارگذاری تاریخچه...</p>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="aim-empty">
              <div className="aim-empty-icon">🗂️</div>
              <p>پیامی یافت نشد</p>
            </div>
          ) : (
            <div className="aim-history-table-wrap">
              <table className="aim-history-table">
                <thead>
                  <tr>
                    <th>نوع</th>
                    <th>گیرنده</th>
                    <th>فرستنده</th>
                    <th>عنوان</th>
                    <th>متن پیام</th>
                    <th>تاریخ ارسال</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((m) => {
                    const meta = INBOX_TYPE_META[m.type] || {
                      icon: "📄",
                      label: m.type,
                    };
                    return (
                      <tr key={m.id}>
                        <td>
                          <span className="aim-hist-type">
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td>
                          <div className="aim-hist-recipient">
                            👤 {m.recipientUsername}
                            <span className="aim-hist-role">
                              {m.recipientRolePersian}
                            </span>
                          </div>
                        </td>
                        <td className="aim-hist-sender">
                          {m.senderRolePersian}
                          <small>@{m.senderUsername}</small>
                        </td>
                        <td className="aim-hist-title">{m.title}</td>
                        <td className="aim-hist-content">{m.content}</td>
                        <td className="aim-hist-date">{formatDateTime(m.createdAt)}</td>
                        <td>
                          <span
                            className={`aim-read-badge ${m.isRead ? "read" : "unread"}`}
                          >
                            {m.isRead ? "خوانده شده" : "نخوانده"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminInboxManagement;
