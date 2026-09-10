import React, { useCallback, useEffect, useState } from "react";
import { FaSearch, FaPhoneAlt, FaBriefcase, FaUserShield } from "react-icons/fa";
import { adminPhonebookApi } from "../../Services/phonebookApi";
import { PhonebookContact, PhonebookJob } from "../../Types/phonebook";
import "../phonebook/Phonebook.css";

const AdminPhonebook: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"contacts" | "jobs">("contacts");
  const [contacts, setContacts] = useState<PhonebookContact[]>([]);
  const [jobs, setJobs] = useState<PhonebookJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [contactsRes, jobsRes] = await Promise.all([
        adminPhonebookApi.getAllContacts(),
        adminPhonebookApi.getAllJobs(),
      ]);
      if (contactsRes.success) setContacts(contactsRes.data || []);
      if (jobsRes.success) setJobs(jobsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات دفترچه تلفن");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const uniqueOwners = new Set(contacts.map((c) => c.ownerUsername).filter(Boolean)).size;

  const filteredContacts = contacts.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.jobName || "").toLowerCase().includes(q) ||
      (c.ownerUsername || "").toLowerCase().includes(q) ||
      (c.ownerCity || "").toLowerCase().includes(q)
    );
  });

  const filteredJobs = jobs.filter((j) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      j.name.toLowerCase().includes(q) ||
      (j.ownerUsername || "").toLowerCase().includes(q)
    );
  });

  const avatarColor = (name: string) => {
    const colors = ["#0d9488", "#7c3aed", "#2563eb", "#ea580c", "#db2777", "#16a34a"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  if (loading) {
    return (
      <div className="phonebook-loading">
        <div className="phonebook-spinner" />
        <p>در حال بارگذاری دفترچه تلفن کاربران...</p>
      </div>
    );
  }

  return (
    <div className="pbmon-container">
      {error && <div className="phonebook-error">{error}</div>}

      <div className="pbmon-header">
        <div>
          <h1>🛡️ مانیتورینگ دفترچه تلفن</h1>
          <p>دسترسی کامل به دفترچه تلفن همه کاربران و آژانسها برای نظارت</p>
        </div>
        <button className="phonebook-btn-add" onClick={fetchAll}>
          🔄 بروزرسانی
        </button>
      </div>

      {/* آمار */}
      <div className="pbmon-stats">
        <div className="pbmon-stat-card">
          <span className="pbmon-stat-icon">👥</span>
          <div>
            <strong>{contacts.length}</strong>
            <span>کل مخاطبین سیستم</span>
          </div>
        </div>
        <div className="pbmon-stat-card">
          <span className="pbmon-stat-icon">🧑‍🤝‍🧑</span>
          <div>
            <strong>{uniqueOwners}</strong>
            <span>کاربر دارای دفترچه</span>
          </div>
        </div>
        <div className="pbmon-stat-card">
          <span className="pbmon-stat-icon">💼</span>
          <div>
            <strong>{jobs.length}</strong>
            <span>کل سمتها و مشاغل</span>
          </div>
        </div>
      </div>

      {/* جستجو */}
      <div className="pbmon-toolbar">
        <div className="pbmon-search">
          <FaSearch className="pbmon-search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام، شماره، سمت، مالک یا شهر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* تبها */}
      <div className="pbmon-tabs">
        <button
          className={`pbmon-tab ${activeTab === "contacts" ? "active" : ""}`}
          onClick={() => setActiveTab("contacts")}
        >
          📇 مخاطبین
        </button>
        <button
          className={`pbmon-tab ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          💼 سمتها و مشاغل
        </button>
      </div>

      {activeTab === "contacts" && (
        filteredContacts.length === 0 ? (
          <div className="pbmon-empty">
            <div className="pbmon-empty-icon">📭</div>
            <p>مخاطبی یافت نشد</p>
          </div>
        ) : (
          <div className="pbmon-table-wrapper">
            <table className="pbmon-table">
              <thead>
                <tr>
                  <th>نام مخاطب</th>
                  <th>شماره تلفن</th>
                  <th>سمت</th>
                  <th>مالک (کاربر)</th>
                  <th>شهر</th>
                  <th>نقش</th>
                  <th>تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="pbmon-owner">
                        <span className="pbmon-owner-badge" style={{ backgroundColor: avatarColor(c.fullName) }}>
                          {c.fullName.charAt(0)}
                        </span>
                        {c.fullName}
                      </span>
                    </td>
                    <td>
                      <a className="pbmon-phone" href={`tel:${c.phone}`}>
                        <FaPhoneAlt /> {c.phone}
                      </a>
                    </td>
                    <td>
                      {c.jobName ? (
                        <span className="pbmon-job-chip"><FaBriefcase /> {c.jobName}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td>{c.ownerUsername || "—"}</td>
                    <td className="pbmon-city">{c.ownerCity || "—"}</td>
                    <td>
                      <span className="pbmon-role-badge"><FaUserShield /> {c.ownerRoles || "—"}</span>
                    </td>
                    <td className="pbmon-city">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fa-IR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {activeTab === "jobs" && (
        filteredJobs.length === 0 ? (
          <div className="pbmon-empty">
            <div className="pbmon-empty-icon">💼</div>
            <p>سمتی یافت نشد</p>
          </div>
        ) : (
          <div className="pbmon-table-wrapper">
            <table className="pbmon-table">
              <thead>
                <tr>
                  <th>نام سمت</th>
                  <th>توضیحات</th>
                  <th>تعداد مخاطب</th>
                  <th>مالک (کاربر)</th>
                  <th>تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <span className="pbmon-job-chip"><FaBriefcase /> {j.name}</span>
                    </td>
                    <td>{j.description || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                    <td>{j.contactCount} مخاطب</td>
                    <td>{j.ownerUsername || "—"}</td>
                    <td className="pbmon-city">
                      {j.createdAt ? new Date(j.createdAt).toLocaleDateString("fa-IR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminPhonebook;
