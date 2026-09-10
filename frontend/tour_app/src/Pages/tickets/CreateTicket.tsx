import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userTicketApi } from "../../Services/ticketApi";
import {
  TicketCreateRequest,
  TicketPriority,
  TicketPriorityColors,
  TicketPriorityPersian,
} from "../../Types/ticket";
import "./Tickets.css";

const priorityList: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("عنوان تیکت را وارد کنید");
      return;
    }
    if (!content.trim()) {
      setError("متن تیکت را وارد کنید");
      return;
    }

    const payload: TicketCreateRequest = {
      title: title.trim(),
      content: content.trim(),
      priority,
    };

    setSubmitting(true);
    try {
      const res = await userTicketApi.create(payload);
      if (res.success && res.data) {
        // رفتن مستقیم به صفحه گفتگوی تیکت جدید
        navigate(`../${res.data.id}`, { replace: true });
      } else {
        setError(res.message || "خطا در ثبت تیکت");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ثبت تیکت");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tkt-container">
      <div className="tkt-header">
        <div>
          <h1>✍️ ثبت تیکت جدید</h1>
          <p>مشکل خود را توضیح دهید؛ پشتیبانی در کوتاه‌ترین زمان پاسخ می‌دهد.</p>
        </div>
      </div>

      <div className="tkt-form-card">
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

        <form onSubmit={handleSubmit}>
          <div className="tkt-form-group">
            <label>عنوان تیکت</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: مشکل در ثبت رزرو"
              maxLength={200}
            />
          </div>

          <div className="tkt-form-group">
            <label>توضیحات کامل</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="مشکل خود را با جزئیات شرح دهید..."
              rows={6}
            />
          </div>

          <div className="tkt-form-row">
            <div className="tkt-form-group">
              <label>اولویت</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                {priorityList.map((p) => (
                  <option key={p} value={p}>
                    {TicketPriorityPersian[p]}
                  </option>
                ))}
              </select>
              <div
                className="priority-hint"
                style={{ color: TicketPriorityColors[priority] }}
              >
                ● اولویت {TicketPriorityPersian[priority]}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="tkt-btn tkt-btn-primary"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {submitting ? "⏳ در حال ارسال..." : "🚀 ثبت تیکت"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
