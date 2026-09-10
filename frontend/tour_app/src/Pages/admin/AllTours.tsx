import React, { useCallback, useEffect, useMemo, useState } from "react";
import { tourApi } from "../../Services/tourApi";
import { Tour, TourStatus, TourStatusColors, TourStatusPersian } from "../../Types/tour";
import "./AllTours.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const AllTours: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | TourStatus>("ALL");
  const [search, setSearch] = useState("");

  const fetchTours = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await tourApi.getAllTours();
      if (res.success) setTours(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تورها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      if (filter !== "ALL" && t.status !== filter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${t.baseTourName} ${t.baseTourCode || ""} ${t.createdByUsername || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tours, filter, search]);

  return (
    <div className="at-container">
      <div className="at-header">
        <div>
          <h2>🌍 همه تورهای سیستم</h2>
          <p>مشاهده تمام تورهای ثبت‌شده توسط همه آژانس‌ها ({tours.length} تور)</p>
        </div>
        <button className="btn-secondary" onClick={fetchTours}>
          🔄 بروزرسانی
        </button>
      </div>

      <div className="at-toolbar">
        <input
          className="at-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام تور، کد یا آژانس..."
        />
        <select
          className="at-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="ALL">همه وضعیت‌ها</option>
          {Object.values(TourStatus).map((s) => (
            <option key={s} value={s}>
              {TourStatusPersian[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>در حال بارگذاری تورها...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="at-empty">
          <div className="at-empty-icon">🌍</div>
          <p>توری یافت نشد</p>
        </div>
      ) : (
        <div className="at-table-wrap">
          <table className="at-table">
            <thead>
              <tr>
                <th>نام تور</th>
                <th>کد</th>
                <th>آژانس برگزارکننده</th>
                <th>حرکت</th>
                <th>بازگشت</th>
                <th>قیمت</th>
                <th>ظرفیت</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="at-cell-name">{t.baseTourName}</td>
                  <td className="at-code">{t.baseTourCode || "-"}</td>
                  <td className="at-agency">@{t.createdByUsername || "-"}</td>
                  <td>{formatDate(t.departureDate)}</td>
                  <td>{formatDate(t.returnDate)}</td>
                  <td className="at-price">{formatPrice(t.price)}</td>
                  <td>{t.capacity ?? "-"}</td>
                  <td>
                    <span
                      className="at-status"
                      style={{
                        color: TourStatusColors[t.status],
                        background: `${TourStatusColors[t.status]}1a`,
                      }}
                    >
                      {t.statusPersian || TourStatusPersian[t.status] || t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllTours;
