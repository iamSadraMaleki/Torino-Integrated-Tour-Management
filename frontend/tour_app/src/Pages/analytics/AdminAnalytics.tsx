import React, { useEffect, useState } from "react";
import { FaChartLine, FaSyncAlt } from "react-icons/fa";
import { adminAnalyticsApi } from "../../Services/analyticsApi";
import { AdminAnalytics as AdminAnalyticsData } from "../../Types/analytics";
import { ReservationStatus, ReservationStatusColors } from "../../Types/reservation";
import { BarChart, DonutChart, HBarList, KpiCard, LineChart, SegmentedBar } from "../../Components/Dashboard/AnalyticsCharts";
import "./Analytics.css";

const formatMoney = (v: number) =>
  new Intl.NumberFormat("fa-IR").format(v) + " تومان";

const formatNum = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

const ROLE_COLORS: Record<string, string> = {
  ROLE_USER: "#0d9488",
  ROLE_CEO: "#7c3aed",
  ROLE_ADMIN: "#3b82f6",
  ROLE_SUPERADMIN: "#ef4444",
};

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsApi.getAnalytics();
      if (res.success) setData(res.data);
      else setError(res.message || "خطا در دریافت تحلیل");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت تحلیل هوشمند");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="an-container">
        <div className="an-loading">
          <div className="spinner" />
          <p>در حال محاسبه تحلیل کل پلتفرم...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="an-container">
        <div className="an-error">
          <p>⚠️ {error || "داده‌ای یافت نشد"}</p>
          <button className="an-refresh-btn" onClick={fetchData}>
            <FaSyncAlt /> تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const totals = data.totals;

  const statusSlices = data.reservationStatusDistribution.map((s) => ({
    label: s.persianName,
    value: s.count,
    color: ReservationStatusColors[s.status as ReservationStatus] || "#94a3b8",
  }));

  const roleSlices = data.roleDistribution.map((r) => ({
    label: r.persianName,
    value: r.count,
    color: ROLE_COLORS[r.role] || "#94a3b8",
  }));

  const topAgencyItems = data.topAgencies.map((a) => ({
    label: a.agencyName || a.username,
    value: a.revenue,
    display: formatMoney(a.revenue),
    sublabel: `${formatNum(a.reservations)} رزرو — ${formatNum(a.passengers)} مسافر — ${a.username}`,
    color: "#0d9488",
  }));

  const topAgencyPassengerItems = data.topAgencies.map((a) => ({
    label: a.agencyName || a.username,
    value: a.passengers,
    display: `${formatNum(a.passengers)} مسافر`,
    sublabel: `${formatNum(a.reservations)} رزرو — درآمد ${formatMoney(a.revenue)} — ${a.username}`,
    color: "#7c3aed",
  }));

  return (
    <div className="an-container">
      <div className="an-header">
        <div>
          <h2>
            <FaChartLine /> تحلیل هوشمند پلتفرم
          </h2>
          <p>نمای کلی کل سیستم — کاربران، آژانس‌ها، تورها و رزروها</p>
        </div>
        <button className="an-refresh-btn" onClick={fetchData} disabled={loading}>
          <FaSyncAlt /> به‌روزرسانی
        </button>
      </div>

      {/* شاخص‌های کلیدی */}
      <div className="an-kpi-grid">
        <KpiCard
          title="کل کاربران"
          value={formatNum(totals.totalUsers)}
          icon="👥"
          color="#3b82f6"
        />
        <KpiCard
          title="مدیران آژانس"
          value={formatNum(totals.totalCeos)}
          icon="🏢"
          color="#7c3aed"
        />
        <KpiCard
          title="تورهای ثبت‌شده"
          value={formatNum(totals.totalTours)}
          icon="✈️"
          color="#f59e0b"
        />
        <KpiCard
          title="کل رزروها"
          value={formatNum(totals.totalReservations)}
          icon="📅"
          color="#0d9488"
        />
        <KpiCard
          title="درآمد کل پلتفرم"
          value={formatMoney(totals.totalRevenue)}
          icon="💰"
          color="#22c55e"
        />
        <KpiCard
          title="در انتظار احراز هویت"
          value={formatNum(totals.pendingVerifications)}
          icon="⏳"
          color="#ef4444"
        />
      </div>

      {/* چارت‌ها */}
      <div className="an-chart-grid">
        <div className="an-chart-card">
          <h4 className="an-chart-title">
            💰 روند درآمد کل پلتفرم <span className="an-chart-subtitle">۶ ماه اخیر (تأیید شده)</span>
          </h4>
          <LineChart
            data={data.revenueByMonth.map((m) => ({ label: m.label, value: m.amount }))}
            color="#22c55e"
            formatValue={(v) => new Intl.NumberFormat("fa-IR").format(v)}
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            📊 روند رزروهای کل پلتفرم <span className="an-chart-subtitle">۱۴ روز اخیر</span>
          </h4>
          <LineChart
            data={data.reservationsByDay.map((d) => ({ label: d.label, value: d.count }))}
            color="#0d9488"
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            📈 رشد تورهای ثبت‌شده <span className="an-chart-subtitle">۶ ماه اخیر</span>
          </h4>
          <BarChart
            data={data.toursByMonth.map((m) => ({ label: m.label, value: m.count }))}
            color="#f59e0b"
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">🔄 وضعیت رزروهای پلتفرم</h4>
          <DonutChart
            data={statusSlices}
            centerValue={formatNum(totals.totalReservations)}
            centerLabel="کل رزروها"
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">👥 توزیع نقش کاربران</h4>
          <DonutChart
            data={roleSlices}
            centerValue={formatNum(totals.totalUsers)}
            centerLabel="کل کاربران"
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">📊 توزیع وضعیت رزروهای پلتفرم</h4>
          <SegmentedBar data={statusSlices} formatValue={(v) => formatNum(v)} />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            🏆 برترین آژانس‌ها <span className="an-chart-subtitle">۵ تای برتر بر اساس درآمد</span>
          </h4>
          <HBarList items={topAgencyItems} />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            👥 پرجمعیت‌ترین آژانس‌ها <span className="an-chart-subtitle">۵ تای برتر بر اساس مسافر</span>
          </h4>
          <HBarList items={topAgencyPassengerItems} color="#7c3aed" />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
