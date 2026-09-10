import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaPhoneAlt, FaSearch, FaBriefcase, FaUserTie, FaStickyNote } from "react-icons/fa";
import { phonebookApi } from "../../Services/phonebookApi";
import { PhonebookContact, PhonebookContactRequest, PhonebookJob, PhonebookJobRequest } from "../../Types/phonebook";
import ConfirmModal from "../ceo/profile/ConfirmModal";
import "./Phonebook.css";

interface PhonebookProps {
  /** user = مسافر / ceo = مدیر آژانس */
  role: "user" | "ceo";
}

const Phonebook: React.FC<PhonebookProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<"jobs" | "contacts">("contacts");
  const [jobs, setJobs] = useState<PhonebookJob[]>([]);
  const [contacts, setContacts] = useState<PhonebookContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // جستجو و فیلتر مخاطبین
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJobId, setFilterJobId] = useState<number | null>(null);

  // فرم‌ها
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<PhonebookJob | null>(null);
  const [jobForm, setJobForm] = useState<PhonebookJobRequest>({ name: "", description: "" });

  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<PhonebookContact | null>(null);
  const [contactForm, setContactForm] = useState<PhonebookContactRequest>({ fullName: "", phone: "", jobId: null, notes: "" });
  const [saving, setSaving] = useState(false);

  // حذف
  const [deleteTarget, setDeleteTarget] = useState<{ type: "job" | "contact"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [jobsRes, contactsRes] = await Promise.all([
        phonebookApi.getJobs(),
        phonebookApi.getContacts(),
      ]);
      if (jobsRes.success) setJobs(jobsRes.data || []);
      if (contactsRes.success) setContacts(contactsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات دفترچه تلفن");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ============ سمتها ============
  const openJobModal = (job?: PhonebookJob) => {
    setEditingJob(job || null);
    setJobForm(job ? { name: job.name, description: job.description || "" } : { name: "", description: "" });
    setShowJobModal(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingJob) {
        const res = await phonebookApi.updateJob(editingJob.id, jobForm);
        if (res.success) showNotice("✓ سمت با موفقیت ویرایش شد");
      } else {
        const res = await phonebookApi.createJob(jobForm);
        if (res.success) showNotice("✓ سمت با موفقیت ثبت شد");
      }
      setShowJobModal(false);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ذخیره سمت");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget || deleteTarget.type !== "job") return;
    setDeleting(true);
    try {
      const res = await phonebookApi.deleteJob(deleteTarget.id);
      if (res.success) {
        showNotice("✓ سمت حذف شد");
        setDeleteTarget(null);
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف سمت");
    } finally {
      setDeleting(false);
    }
  };

  // ============ مخاطبین ============
  const openContactModal = (contact?: PhonebookContact) => {
    setEditingContact(contact || null);
    setContactForm(
      contact
        ? { fullName: contact.fullName, phone: contact.phone, jobId: contact.jobId, notes: contact.notes || "" }
        : { fullName: "", phone: "", jobId: null, notes: "" }
    );
    setShowContactModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingContact) {
        const res = await phonebookApi.updateContact(editingContact.id, contactForm);
        if (res.success) showNotice("✓ مخاطب با موفقیت ویرایش شد");
      } else {
        const res = await phonebookApi.createContact(contactForm);
        if (res.success) showNotice("✓ مخاطب با موفقیت ثبت شد");
      }
      setShowContactModal(false);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ذخیره مخاطب");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteTarget || deleteTarget.type !== "contact") return;
    setDeleting(true);
    try {
      const res = await phonebookApi.deleteContact(deleteTarget.id);
      if (res.success) {
        showNotice("✓ مخاطب حذف شد");
        setDeleteTarget(null);
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف مخاطب");
    } finally {
      setDeleting(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (filterJobId && c.jobId !== filterJobId) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.jobName || "").toLowerCase().includes(q)
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
        <p>در حال بارگذاری دفترچه تلفن...</p>
      </div>
    );
  }

  return (
    <div className="phonebook-container">
      {notice && <div className="phonebook-notice">{notice}</div>}
      {error && <div className="phonebook-error">{error}</div>}

      <div className="phonebook-header">
        <div>
          <h1>📇 دفترچه تلفن</h1>
          <p>{role === "ceo" ? "مخاطبین و سمتها/مشاغل آژانس شما" : "مخاطبین و سمتها/مشاغل شما"}</p>
        </div>
        <button
          className="phonebook-btn-add"
          onClick={() => (activeTab === "jobs" ? openJobModal() : openContactModal())}
        >
          <FaPlus /> {activeTab === "jobs" ? "افزودن سمت جدید" : "افزودن مخاطب جدید"}
        </button>
      </div>

      {/* آمار */}
      <div className="phonebook-stats">
        <div className="phonebook-stat-card">
          <span className="phonebook-stat-icon">👥</span>
          <div>
            <strong>{contacts.length}</strong>
            <span>مخاطب</span>
          </div>
        </div>
        <div className="phonebook-stat-card">
          <span className="phonebook-stat-icon">💼</span>
          <div>
            <strong>{jobs.length}</strong>
            <span>سمت و شغل</span>
          </div>
        </div>
      </div>

      {/* تبها */}
      <div className="phonebook-tabs">
        <button
          className={`phonebook-tab ${activeTab === "contacts" ? "active" : ""}`}
          onClick={() => setActiveTab("contacts")}
        >
          📇 دفترچه تلفن
        </button>
        <button
          className={`phonebook-tab ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          💼 سمتها و مشاغل
        </button>
      </div>

      {/* ============ تب مخاطبین ============ */}
      {activeTab === "contacts" && (
        <div className="phonebook-contacts-tab">
          <div className="phonebook-toolbar">
            <div className="phonebook-search">
              <FaSearch className="phonebook-search-icon" />
              <input
                type="text"
                placeholder="جستجوی نام، شماره یا سمت..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="phonebook-filter"
              value={filterJobId === null ? "" : String(filterJobId)}
              onChange={(e) => setFilterJobId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">همه سمتها</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="phonebook-empty">
              <div className="phonebook-empty-icon">📭</div>
              <p>{contacts.length === 0 ? "دفترچه تلفن شما خالی است" : "مخاطبی با این فیلتر پیدا نشد"}</p>
              <button className="phonebook-btn-add" onClick={() => openContactModal()}>
                <FaPlus /> افزودن اولین مخاطب
              </button>
            </div>
          ) : (
            <div className="phonebook-list">
              {filteredContacts.map((c) => (
                <div key={c.id} className="phonebook-card">
                  <div className="phonebook-avatar" style={{ backgroundColor: avatarColor(c.fullName) }}>
                    {c.fullName.charAt(0)}
                  </div>
                  <div className="phonebook-card-body">
                    <div className="phonebook-card-title">
                      <h4>{c.fullName}</h4>
                      {c.jobName && <span className="phonebook-job-badge"><FaBriefcase /> {c.jobName}</span>}
                    </div>
                    <a className="phonebook-phone" href={`tel:${c.phone}`}>
                      <FaPhoneAlt /> {c.phone}
                    </a>
                    {c.notes && (
                      <p className="phonebook-notes"><FaStickyNote /> {c.notes}</p>
                    )}
                  </div>
                  <div className="phonebook-card-actions">
                    <button className="phonebook-action edit" title="ویرایش" onClick={() => openContactModal(c)}>
                      <FaEdit />
                    </button>
                    <button
                      className="phonebook-action delete"
                      title="حذف"
                      onClick={() => setDeleteTarget({ type: "contact", id: c.id })}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ تب سمتها ============ */}
      {activeTab === "jobs" && (
        <div className="phonebook-jobs-tab">
          {jobs.length === 0 ? (
            <div className="phonebook-empty">
              <div className="phonebook-empty-icon">💼</div>
              <p>هنوز سمت یا شغلی تعریف نشده است</p>
              <button className="phonebook-btn-add" onClick={() => openJobModal()}>
                <FaPlus /> تعریف اولین سمت
              </button>
            </div>
          ) : (
            <div className="phonebook-jobs-grid">
              {jobs.map((j) => (
                <div key={j.id} className="phonebook-job-card">
                  <div className="phonebook-job-icon"><FaUserTie /></div>
                  <div className="phonebook-job-info">
                    <h4>{j.name}</h4>
                    {j.description && <p>{j.description}</p>}
                    <span className="phonebook-job-count">👥 {j.contactCount} مخاطب با این سمت</span>
                  </div>
                  <div className="phonebook-job-actions">
                    <button className="phonebook-action edit" title="ویرایش" onClick={() => openJobModal(j)}>
                      <FaEdit />
                    </button>
                    <button
                      className="phonebook-action delete"
                      title="حذف"
                      onClick={() => setDeleteTarget({ type: "job", id: j.id })}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ مودال سمت ============ */}
      {showJobModal && (
        <div className="phonebook-modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="phonebook-modal" onClick={(e) => e.stopPropagation()}>
            <div className="phonebook-modal-header">
              <h3>{editingJob ? "ویرایش سمت" : "تعریف سمت جدید"}</h3>
              <button className="phonebook-modal-close" onClick={() => setShowJobModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveJob}>
              <div className="phonebook-form-group">
                <label>نام سمت / شغل *</label>
                <input
                  type="text"
                  value={jobForm.name}
                  onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })}
                  placeholder="مثال: راننده، راهنمای تور، لیدر..."
                  required
                />
              </div>
              <div className="phonebook-form-group">
                <label>توضیحات</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="توضیح کوتاه درباره این سمت (اختیاری)"
                  rows={2}
                />
              </div>
              <div className="phonebook-modal-actions">
                <button type="button" className="phonebook-btn-cancel" onClick={() => setShowJobModal(false)}>
                  انصراف
                </button>
                <button type="submit" className="phonebook-btn-save" disabled={saving || !jobForm.name.trim()}>
                  {saving ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ مودال مخاطب ============ */}
      {showContactModal && (
        <div className="phonebook-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="phonebook-modal" onClick={(e) => e.stopPropagation()}>
            <div className="phonebook-modal-header">
              <h3>{editingContact ? "ویرایش مخاطب" : "افزودن مخاطب جدید"}</h3>
              <button className="phonebook-modal-close" onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveContact}>
              <div className="phonebook-form-group">
                <label>نام و نام خانوادگی *</label>
                <input
                  type="text"
                  value={contactForm.fullName}
                  onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                  placeholder="مثال: علی محمدی"
                  required
                />
              </div>
              <div className="phonebook-form-group">
                <label>شماره تلفن *</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="0912XXXXXXX"
                  style={{ textAlign: "left" }}
                  required
                />
              </div>
              <div className="phonebook-form-group">
                <label>سمت / شغل</label>
                <select
                  value={contactForm.jobId === null ? "" : String(contactForm.jobId)}
                  onChange={(e) => setContactForm({ ...contactForm, jobId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">بدون سمت</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>
              <div className="phonebook-form-group">
                <label>یادداشت</label>
                <textarea
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  placeholder="توضیح کوتاه (اختیاری)"
                  rows={2}
                />
              </div>
              <div className="phonebook-modal-actions">
                <button type="button" className="phonebook-btn-cancel" onClick={() => setShowContactModal(false)}>
                  انصراف
                </button>
                <button
                  type="submit"
                  className="phonebook-btn-save"
                  disabled={saving || !contactForm.fullName.trim() || !contactForm.phone.trim()}
                >
                  {saving ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* تایید حذف */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === "job" ? "حذف سمت" : "حذف مخاطب"}
        message={
          deleteTarget?.type === "job"
            ? "آیا از حذف این سمت اطمینان دارید؟ مخاطبینی که به این سمت متصل هستند بدون سمت باقی میمانند."
            : "آیا از حذف این مخاطب اطمینان دارید؟"
        }
        onConfirm={deleteTarget?.type === "job" ? handleDeleteJob : handleDeleteContact}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
      />
    </div>
  );
};

export default Phonebook;
