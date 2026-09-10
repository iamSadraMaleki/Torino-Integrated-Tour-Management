import React, { useCallback, useEffect, useState } from "react";
import { FaSyncAlt, FaFire, FaTag, FaPlus, FaTrash, FaPowerOff } from "react-icons/fa";
import { ceoDiscountApi } from "../../../Services/discountApi";
import { tourApi } from "../../../Services/tourApi";
import { Tour } from "../../../Types/tour";
import { DiscountCode, TourSpecialDiscount } from "../../../Types/discount";
import "./Discounts.css";

type DiscountTab = "special" | "codes";

const formatPrice = (v: number) =>
  new Intl.NumberFormat("fa-IR").format(v) + " تومان";

const formatNum = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fa-IR") + " " + new Date(d).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) : "—";

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const CeoDiscounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiscountTab>("special");
  const [specials, setSpecials] = useState<TourSpecialDiscount[]>([]);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // فرم تور ویژه
  const [showSpecialForm, setShowSpecialForm] = useState(false);
  const [specialTourId, setSpecialTourId] = useState<number | null>(null);
  const [specialPercent, setSpecialPercent] = useState(20);
  const [specialHours, setSpecialHours] = useState(10);

  // فرم کد تخفیف
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [codeVal, setCodeVal] = useState("");
  const [codeTitle, setCodeTitle] = useState("");
  const [codePercent, setCodePercent] = useState(10);
  const [codeMaxUses, setCodeMaxUses] = useState("");
  const [codeExpires, setCodeExpires] = useState("");
  const [codeForUser, setCodeForUser] = useState("");

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [spRes, cdRes, tourRes] = await Promise.all([
        ceoDiscountApi.getSpecials(),
        ceoDiscountApi.getCodes(),
        tourApi.getMyTours(),
      ]);
      if (spRes.success) setSpecials(spRes.data || []);
      if (cdRes.success) setCodes(cdRes.data || []);
      if (tourRes.success) setTours(tourRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات تخفیف");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ============ تور ویژه ============
  const handleCreateSpecial = async () => {
    if (!specialTourId || !specialPercent || !specialHours) {
      setError("همه فیلدها را کامل کنید");
      return;
    }
    const expiresAt = new Date(Date.now() + specialHours * 3600 * 1000);
    setActionLoading(true);
    setError("");
    try {
      const res = await ceoDiscountApi.createSpecial({
        tourId: specialTourId,
        discountPercent: specialPercent,
        expiresAt: expiresAt.toISOString(),
      });
      if (res.success) {
        showNotice("✓ تخفیف ویژه تور فعال شد");
        setShowSpecialForm(false);
        setSpecialTourId(null);
        setSpecialPercent(20);
        setSpecialHours(10);
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ایجاد تخفیف ویژه");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSpecial = async (s: TourSpecialDiscount) => {
    setActionLoading(true);
    try {
      const res = await ceoDiscountApi.toggleSpecial(s.id, !s.isActive);
      if (res.success) {
        showNotice(res.success ? "✓ وضعیت تغییر کرد" : "");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در تغییر وضعیت");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSpecial = async (s: TourSpecialDiscount) => {
    if (!window.confirm(`تخفیف ویژه «${s.tourName}» حذف شود؟`)) return;
    setActionLoading(true);
    try {
      const res = await ceoDiscountApi.deleteSpecial(s.id);
      if (res.success) {
        showNotice("✓ تخفیف ویژه حذف شد");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف");
    } finally {
      setActionLoading(false);
    }
  };

  // ============ کد تخفیف ============
  const handleCreateCode = async () => {
    if (!codeVal.trim() || !codePercent) {
      setError("کد و درصد تخفیف الزامی است");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      const res = await ceoDiscountApi.createCode({
        code: codeVal.trim(),
        title: codeTitle.trim(),
        discountPercent: codePercent,
        maxUses: codeMaxUses ? Number(codeMaxUses) : null,
        expiresAt: codeExpires ? fromLocalInput(codeExpires) : null,
        forUserUsername: codeForUser.trim() || null,
      });
      if (res.success) {
        showNotice(res.success ? "✓ کد تخفیف ساخته شد" : "");
        setShowCodeForm(false);
        setCodeVal("");
        setCodeTitle("");
        setCodePercent(10);
        setCodeMaxUses("");
        setCodeExpires("");
        setCodeForUser("");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ساخت کد تخفیف");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCode = async (c: DiscountCode) => {
    setActionLoading(true);
    try {
      const res = await ceoDiscountApi.toggleCode(c.id, !c.isActive);
      if (res.success) {
        showNotice("✓ وضعیت کد تغییر کرد");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در تغییر وضعیت کد");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCode = async (c: DiscountCode) => {
    if (!window.confirm(`کد تخفیف «${c.code}» حذف شود؟`)) return;
    setActionLoading(true);
    try {
      const res = await ceoDiscountApi.deleteCode(c.id);
      if (res.success) {
        showNotice("✓ کد تخفیف حذف شد");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در حذف کد");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dc-loading">
        <div className="dc-spinner" />
        <p>در حال بارگذاری تخفیف‌ها...</p>
      </div>
    );
  }

  return (
    <div className="dc-container">
      {notice && <div className="dc-notice">{notice}</div>}
      {error && <div className="dc-error">{error}</div>}

      <div className="dc-header">
        <div>
          <h1>🎟️ تخفیف‌ها</h1>
          <p>تورهای ویژه (عمومی) و کدهای تخفیف برای مسافران</p>
        </div>
        <button className="dc-refresh" onClick={fetchAll}>
          <FaSyncAlt /> بروزرسانی
        </button>
      </div>

      <div className="dc-tabs">
        <button
          className={`dc-tab ${activeTab === "special" ? "active" : ""}`}
          onClick={() => setActiveTab("special")}
        >
          <FaFire /> تور ویژه {specials.length > 0 && <span className="dc-tab-count">{specials.length}</span>}
        </button>
        <button
          className={`dc-tab ${activeTab === "codes" ? "active" : ""}`}
          onClick={() => setActiveTab("codes")}
        >
          <FaTag /> کد تخفیف {codes.length > 0 && <span className="dc-tab-count">{codes.length}</span>}
        </button>
      </div>

      {/* ============ تب تور ویژه ============ */}
      {activeTab === "special" && (
        <>
          <div className="dc-form-card">
            <div className="dc-form-title">
              <FaFire /> فعال‌سازی تخفیف ویژه روی تور (فلش‌سیل)
            </div>
            {showSpecialForm ? (
              <>
                <div className="dc-form-body">
                  <div className="dc-form-group">
                    <label>تور *</label>
                    <select
                      value={specialTourId === null ? "" : String(specialTourId)}
                      onChange={(e) => setSpecialTourId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">انتخاب تور...</option>
                      {tours.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.baseTourName} — {formatPrice(t.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dc-form-group">
                    <label>درصد تخفیف (۱ تا ۹۹) *</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={specialPercent}
                      onChange={(e) => setSpecialPercent(Number(e.target.value))}
                      dir="ltr"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>مدت (ساعت) *</label>
                    <input
                      type="number"
                      min={1}
                      value={specialHours}
                      onChange={(e) => setSpecialHours(Number(e.target.value))}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="dc-form-actions">
                  <button className="dc-btn-submit" disabled={actionLoading} onClick={handleCreateSpecial}>
                    {actionLoading ? "⏳..." : "فعال کردن تخفیف"}
                  </button>
                </div>
              </>
            ) : (
              <div className="dc-form-actions" style={{ padding: "1.1rem" }}>
                <button className="dc-btn-submit" onClick={() => setShowSpecialForm(true)}>
                  <FaPlus /> تخفیف ویژه جدید
                </button>
              </div>
            )}
          </div>

          {specials.length === 0 ? (
            <div className="dc-table-card">
              <div className="dc-empty">هنوز تخفیف ویژه‌ای ثبت نکرده‌اید</div>
            </div>
          ) : (
            <div className="dc-special-grid">
              {specials.map((s) => (
                <div className="dc-card" key={s.id}>
                  <div className="dc-card-head">
                    <div>
                      <h4>{s.tourName}</h4>
                      <small>{s.tourCode}</small>
                    </div>
                    <span className="dc-percent-badge">٪{s.discountPercent}</span>
                  </div>
                  <div className="dc-card-body">
                    <div className="dc-card-row">
                      <span>قیمت اصلی</span>
                      <span className="dc-price-old">{formatPrice(s.originalPrice)}</span>
                    </div>
                    <div className="dc-card-row">
                      <span>قیمت با تخفیف</span>
                      <span className="dc-price-new">{formatPrice(s.discountedPrice)}</span>
                    </div>
                    <div className="dc-card-row">
                      <span>انقضا</span>
                      <strong>{formatDate(s.expiresAt)}</strong>
                    </div>
                    <div className="dc-card-row">
                      <span>وضعیت</span>
                      <span className={`dc-status-badge ${s.isActive ? "active" : "inactive"}`}>
                        {s.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                  </div>
                  <div className="dc-card-actions">
                    <button
                      className={`dc-btn ${s.isActive ? "dc-btn-toggle-off" : "dc-btn-toggle-on"}`}
                      disabled={actionLoading}
                      onClick={() => handleToggleSpecial(s)}
                    >
                      <FaPowerOff /> {s.isActive ? "غیرفعال کن" : "فعال کن"}
                    </button>
                    <button
                      className="dc-btn dc-btn-danger"
                      disabled={actionLoading}
                      onClick={() => handleDeleteSpecial(s)}
                    >
                      <FaTrash /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ تب کد تخفیف ============ */}
      {activeTab === "codes" && (
        <>
          <div className="dc-form-card">
            <div className="dc-form-title">
              <FaTag /> ساخت کد تخفیف
            </div>
            {showCodeForm ? (
              <>
                <div className="dc-form-body">
                  <div className="dc-form-group">
                    <label>کد *</label>
                    <input
                      value={codeVal}
                      onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
                      placeholder="SUMMER10"
                      dir="ltr"
                      style={{ fontFamily: "monospace", letterSpacing: "1px" }}
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>عنوان</label>
                    <input
                      value={codeTitle}
                      onChange={(e) => setCodeTitle(e.target.value)}
                      placeholder="مثلاً تخفیف تابستانه"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>درصد تخفیف (۱ تا ۹۹) *</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={codePercent}
                      onChange={(e) => setCodePercent(Number(e.target.value))}
                      dir="ltr"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>سقف استفاده (خالی = نامحدود)</label>
                    <input
                      type="number"
                      min={1}
                      value={codeMaxUses}
                      onChange={(e) => setCodeMaxUses(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>انقضا (اختیاری)</label>
                    <input
                      type="datetime-local"
                      value={codeExpires}
                      onChange={(e) => setCodeExpires(e.target.value)}
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>فقط برای کاربر (اختیاری — نام کاربری)</label>
                    <input
                      value={codeForUser}
                      onChange={(e) => setCodeForUser(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                  <div className="dc-form-hint">
                    💡 اگر «فقط برای کاربر» را پر کنید، کد به اینباکس همان کاربر ارسال می‌شود و فقط او می‌تواند استفاده کند.
                  </div>
                </div>
                <div className="dc-form-actions">
                  <button className="dc-btn-submit" disabled={actionLoading} onClick={handleCreateCode}>
                    {actionLoading ? "⏳..." : "ساخت کد"}
                  </button>
                </div>
              </>
            ) : (
              <div className="dc-form-actions" style={{ padding: "1.1rem" }}>
                <button className="dc-btn-submit" onClick={() => setShowCodeForm(true)}>
                  <FaPlus /> کد تخفیف جدید
                </button>
              </div>
            )}
          </div>

          <div className="dc-table-card">
            {codes.length === 0 ? (
              <div className="dc-empty">هنوز کد تخفیفی نساخته‌اید</div>
            ) : (
              <div className="dc-table-wrap">
                <table className="dc-table">
                  <thead>
                    <tr>
                      <th>کد</th>
                      <th>عنوان</th>
                      <th>تخفیف</th>
                      <th>مصرف</th>
                      <th>برای کاربر</th>
                      <th>انقضا</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span className="dc-code-chip">{c.code}</span>
                        </td>
                        <td>{c.title || "—"}</td>
                        <td>
                          <span className="dc-percent-badge">٪{c.discountPercent}</span>
                        </td>
                        <td>
                          {formatNum(c.usedCount)} / {c.maxUses ? formatNum(c.maxUses) : "∞"}
                        </td>
                        <td>{c.forUserUsername || "عمومی"}</td>
                        <td>{formatDate(c.expiresAt)}</td>
                        <td>
                          <span className={`dc-status-badge ${c.isActive ? "active" : "inactive"}`}>
                            {c.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button
                              className={`dc-btn ${c.isActive ? "dc-btn-toggle-off" : "dc-btn-toggle-on"}`}
                              disabled={actionLoading}
                              onClick={() => handleToggleCode(c)}
                            >
                              <FaPowerOff /> {c.isActive ? "غیرفعال" : "فعال"}
                            </button>
                            <button
                              className="dc-btn dc-btn-danger"
                              disabled={actionLoading}
                              onClick={() => handleDeleteCode(c)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CeoDiscounts;
