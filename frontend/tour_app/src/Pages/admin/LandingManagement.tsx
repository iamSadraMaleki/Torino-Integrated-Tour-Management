import React, { useCallback, useEffect, useState } from "react";
import { landingApi } from "../../Services/landingApi";
import {
  HeroContent,
  parseHero,
  parseList,
} from "../../Types/landing";
import "./LandingManagement.css";

// ========== تعریف فیلدهای هر بخش ==========

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "commaList";
  help?: string;
}

type SectionConfig = {
  key: string;
  title: string;
  icon: string;
  nameField: string;
  fields: FieldDef[];
};

const SECTIONS: SectionConfig[] = [
  {
    key: "CITIES",
    title: "شهرها",
    icon: "🏙️",
    nameField: "name",
    fields: [
      { key: "name", label: "نام شهر", type: "text" },
      { key: "icon", label: "آیکون (ایموجی)", type: "text" },
      { key: "image", label: "مسیر تصویر", type: "text", help: "مثلاً /images/place/tabriz.jpg" },
    ],
  },
  {
    key: "PLACES",
    title: "جاذبه‌ها",
    icon: "🏛️",
    nameField: "name",
    fields: [
      { key: "name", label: "نام جاذبه", type: "text" },
      { key: "icon", label: "آیکون (ایموجی)", type: "text" },
      { key: "location", label: "موقعیت", type: "text" },
      { key: "image", label: "مسیر تصویر", type: "text" },
      { key: "description", label: "توضیح کوتاه", type: "text" },
      { key: "fullDescription", label: "توضیحات کامل", type: "textarea" },
      { key: "bestTime", label: "بهترین زمان بازدید", type: "text" },
      { key: "duration", label: "مدت بازدید", type: "text" },
      { key: "price", label: "هزینه ورودی", type: "text" },
    ],
  },
  {
    key: "HOTELS",
    title: "هتل‌ها",
    icon: "🏨",
    nameField: "name",
    fields: [
      { key: "name", label: "نام هتل", type: "text" },
      { key: "stars", label: "تعداد ستاره", type: "number" },
      { key: "location", label: "موقعیت", type: "text" },
      { key: "price", label: "قیمت", type: "text" },
      { key: "image", label: "مسیر تصویر", type: "text" },
      { key: "fullDescription", label: "توضیحات کامل", type: "textarea" },
      { key: "address", label: "آدرس", type: "text" },
      { key: "phone", label: "تلفن", type: "text" },
      { key: "website", label: "وب‌سایت", type: "text" },
      { key: "checkIn", label: "زمان ورود", type: "text" },
      { key: "checkOut", label: "زمان خروج", type: "text" },
      { key: "facilities", label: "امکانات (هر خط یک مورد)", type: "commaList" },
      { key: "roomTypes", label: "انواع اتاق (هر خط یک مورد)", type: "commaList" },
      { key: "nearby", label: "جاهای نزدیک (هر خط یک مورد)", type: "commaList" },
    ],
  },
  {
    key: "FOODS",
    title: "غذاها",
    icon: "🍽️",
    nameField: "name",
    fields: [
      { key: "name", label: "نام غذا", type: "text" },
      { key: "region", label: "منطقه", type: "text" },
      { key: "emoji", label: "ایموجی", type: "text" },
      { key: "description", label: "توضیحات", type: "textarea" },
      { key: "spice", label: "میزان تندی", type: "text" },
      { key: "image", label: "مسیر تصویر", type: "text" },
    ],
  },
  {
    key: "VEHICLES",
    title: "وسایل نقلیه",
    icon: "🚌",
    nameField: "name",
    fields: [
      { key: "name", label: "نام وسیله", type: "text" },
      { key: "type", label: "نوع (اتوبوس/هواپیما/...)", type: "text" },
      { key: "capacity", label: "ظرفیت", type: "text" },
      { key: "features", label: "امکانات", type: "textarea" },
      { key: "class", label: "کلاس", type: "text" },
      { key: "icon", label: "آیکون (ایموجی)", type: "text" },
      { key: "image", label: "مسیر تصویر", type: "text" },
    ],
  },
];

// ========== هدر متن معرفی ==========

const HERO_FIELDS: { key: keyof HeroContent; label: string; type: "text" | "textarea" }[] = [
  { key: "badge", label: "متن بج بالا", type: "text" },
  { key: "title", label: "قسمت اول عنوان", type: "text" },
  { key: "titleHighlight", label: "کلمه هایلایت عنوان", type: "text" },
  { key: "titleEnd", label: "قسمت آخر عنوان", type: "text" },
  { key: "subtitle", label: "زیرعنوان", type: "text" },
  { key: "description", label: "متن معرفی", type: "textarea" },
  { key: "buttonPrimary", label: "متن دکمه اصلی", type: "text" },
  { key: "buttonSecondary", label: "متن دکمه دوم", type: "text" },
];

const EMPTY_HERO: HeroContent = {
  badge: "",
  title: "",
  titleHighlight: "",
  titleEnd: "",
  subtitle: "",
  description: "",
  buttonPrimary: "",
  buttonSecondary: "",
  stats: [],
};

// ========== کامپوننت ویرایشگر آیتم (مودال) ==========

interface ItemEditorModalProps {
  fields: FieldDef[];
  item: Record<string, any>;
  onChange: (item: Record<string, any>) => void;
  onClose: () => void;
}

const ItemEditorModal: React.FC<ItemEditorModalProps> = ({ fields, item, onChange, onClose }) => {
  const [draft, setDraft] = useState<Record<string, any>>({ ...item });

  const setField = (key: string, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="lm-modal-overlay" onClick={onClose}>
      <div className="lm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="lm-modal-title">✏️ ویرایش آیتم</h3>
        <div className="lm-modal-fields">
          {fields.map((f) => (
            <div key={f.key} className="lm-field">
              <label className="lm-field-label">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  className="lm-input lm-textarea"
                  value={draft[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={3}
                />
              ) : f.type === "commaList" ? (
                <textarea
                  className="lm-input lm-textarea"
                  value={Array.isArray(draft[f.key]) ? draft[f.key].join("\n") : (draft[f.key] || "")}
                  onChange={(e) =>
                    setField(
                      f.key,
                      e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  rows={3}
                />
              ) : f.type === "number" ? (
                <input
                  className="lm-input"
                  type="number"
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setField(f.key, Number(e.target.value) || 0)}
                />
              ) : (
                <input
                  className="lm-input"
                  type="text"
                  value={draft[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              )}
              {f.help && <span className="lm-field-help">{f.help}</span>}
            </div>
          ))}
        </div>
        <div className="lm-modal-actions">
          <button className="lm-btn-save" onClick={() => onChange(draft)}>
            ✓ ذخیره
          </button>
          <button className="lm-btn-cancel" onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== ویرایشگر لیست (شهرها/جاذبه/هتل/غذا/حمل‌ونقل) ==========

interface LandingListEditorProps {
  section: SectionConfig;
  items: Record<string, any>[];
  onSave: (items: Record<string, any>[]) => void;
  saving: boolean;
}

const LandingListEditor: React.FC<LandingListEditorProps> = ({ section, items, onSave, saving }) => {
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startEdit = (item: Record<string, any>) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const startNew = () => {
    const empty: Record<string, any> = { id: Date.now() };
    section.fields.forEach((f) => {
      empty[f.key] = f.type === "commaList" ? [] : f.type === "number" ? 0 : "";
    });
    setEditing(empty);
    setIsNew(true);
  };

  const handleChange = (updated: Record<string, any>) => {
    if (isNew) {
      onSave([...items, updated]);
    } else {
      onSave(items.map((it) => (it.id === updated.id ? updated : it)));
    }
    setEditing(null);
  };

  const handleDelete = (item: Record<string, any>) => {
    if (!window.confirm("این آیتم حذف شود؟")) return;
    onSave(items.filter((it) => it.id !== item.id));
  };

  return (
    <div className="lm-section">
      <div className="lm-section-header">
        <h3 className="lm-section-title">
          {section.icon} {section.title} ({items.length})
        </h3>
        <div className="lm-section-actions">
          <button className="lm-btn-add" onClick={startNew}>
            ＋ افزودن
          </button>
          <button
            className="lm-btn-save"
            onClick={() => onSave(items)}
            disabled={saving}
          >
            {saving ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
          </button>
        </div>
      </div>

      <div className="lm-items">
        {items.length === 0 ? (
          <div className="lm-empty">موردی وجود ندارد — روی «افزودن» بزنید</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="lm-item">
              {item.image && (
                <img src={item.image} alt="" className="lm-item-thumb" />
              )}
              <div className="lm-item-info">
                <span className="lm-item-name">
                  {item.icon ? `${item.icon} ` : ""}
                  {item[section.nameField] || "(بدون نام)"}
                </span>
                {item.location && (
                  <span className="lm-item-sub">📍 {item.location}</span>
                )}
              </div>
              <div className="lm-item-actions">
                <button className="lm-item-edit" onClick={() => startEdit(item)}>
                  ✏️
                </button>
                <button
                  className="lm-item-delete"
                  onClick={() => handleDelete(item)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <ItemEditorModal
          fields={section.fields}
          item={editing}
          onChange={handleChange}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

// ========== صفحه اصلی ==========

const LandingManagement: React.FC = () => {
  const [tab, setTab] = useState<string>("HERO");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const [hero, setHero] = useState<HeroContent>(EMPTY_HERO);
  const [heroStats, setHeroStats] = useState<{ number: string; label: string }[]>([]);
  const [lists, setLists] = useState<Record<string, Record<string, any>[]>>({});

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await landingApi.getContent();
      if (res.success && res.data) {
        const h = parseHero(res.data.HERO);
        if (h) {
          setHero(h);
          setHeroStats(h.stats || []);
        }
        SECTIONS.forEach((s) => {
          setLists((prev) => ({ ...prev, [s.key]: parseList(res.data[s.key]) }));
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت محتوای صفحه معرفی");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const saveHero = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const heroPayload: HeroContent = { ...hero, stats: heroStats };
      const res = await landingApi.updateContent({
        HERO: JSON.stringify(heroPayload),
      });
      if (res.success) {
        setNotice("✓ متن معرفی ذخیره شد");
        setTimeout(() => setNotice(""), 2500);
      } else {
        setError(res.message || "خطا در ذخیره");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const saveList = async (key: string, items: Record<string, any>[]) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await landingApi.updateContent({
        [key]: JSON.stringify(items),
      });
      if (res.success) {
        setLists((prev) => ({ ...prev, [key]: items }));
        setNotice("✓ ذخیره شد");
        setTimeout(() => setNotice(""), 2500);
      } else {
        setError(res.message || "خطا در ذخیره");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm("همه تغییرات صفحه معرفی به حالت پیش‌فرض برگردد؟")) return;
    setError("");
    setNotice("");
    try {
      const res = await landingApi.restoreDefaults();
      if (res.success) {
        await fetchContent();
        setNotice("✓ محتوا به حالت پیش‌فرض بازگشت");
        setTimeout(() => setNotice(""), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در بازنشانی");
    }
  };

  const section = SECTIONS.find((s) => s.key === tab);

  return (
    <div className="lm-container">
      <div className="lm-header">
        <div>
          <h1>🌐 مدیریت صفحه معرفی سیستم</h1>
          <p>محتویات صفحه ورود (لندینگ) را بدون تغییر کد، از همین‌جا ویرایش کنید</p>
        </div>
        <button className="lm-btn-restore" onClick={handleRestoreDefaults}>
          ↺ بازنشانی به پیش‌فرض
        </button>
      </div>

      {notice && <div className="lm-notice">✅ {notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="lm-tabs">
        <button
          className={`lm-tab ${tab === "HERO" ? "active" : ""}`}
          onClick={() => setTab("HERO")}
        >
          🎯 متن معرفی
        </button>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={`lm-tab ${tab === s.key ? "active" : ""}`}
            onClick={() => setTab(s.key)}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>در حال بارگذاری محتوا...</p>
        </div>
      ) : tab === "HERO" ? (
        <div className="lm-hero-card">
          <div className="lm-hero-grid">
            {HERO_FIELDS.map((f) => (
              <div key={f.key} className="lm-field">
                <label className="lm-field-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    className="lm-input lm-textarea"
                    value={hero[f.key] || ""}
                    onChange={(e) => setHero((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <input
                    className="lm-input"
                    type="text"
                    value={hero[f.key] || ""}
                    onChange={(e) => setHero((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="lm-hero-stats-editor">
            <h4 className="lm-subtitle">📊 آمار نمایشی (عدد + عنوان)</h4>
            {heroStats.map((stat, i) => (
              <div key={i} className="lm-stat-row">
                <input
                  className="lm-input"
                  type="text"
                  value={stat.number}
                  onChange={(e) =>
                    setHeroStats((prev) =>
                      prev.map((s, idx) => (idx === i ? { ...s, number: e.target.value } : s))
                    )
                  }
                  placeholder="عدد (مثلاً 50+)"
                />
                <input
                  className="lm-input"
                  type="text"
                  value={stat.label}
                  onChange={(e) =>
                    setHeroStats((prev) =>
                      prev.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s))
                    )
                  }
                  placeholder="عنوان"
                />
                <button
                  className="lm-stat-remove"
                  onClick={() => setHeroStats((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  🗑
                </button>
              </div>
            ))}
            <button
              className="lm-btn-add"
              onClick={() => setHeroStats((prev) => [...prev, { number: "", label: "" }])}
            >
              ＋ افزودن آمار
            </button>
          </div>

          <div className="lm-section-actions" style={{ marginTop: "1rem" }}>
            <button className="lm-btn-save" onClick={saveHero} disabled={saving}>
              {saving ? "در حال ذخیره..." : "💾 ذخیره متن معرفی"}
            </button>
          </div>
        </div>
      ) : section ? (
        <LandingListEditor
          section={section}
          items={lists[section.key] || []}
          onSave={(items) => saveList(section.key, items)}
          saving={saving}
        />
      ) : null}
    </div>
  );
};

export default LandingManagement;
