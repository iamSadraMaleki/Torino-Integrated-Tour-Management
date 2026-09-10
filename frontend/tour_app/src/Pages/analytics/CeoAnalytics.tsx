import React, { useEffect, useState } from "react";
import { FaChartBar, FaSyncAlt } from "react-icons/fa";
import { ceoAnalyticsApi } from "../../Services/analyticsApi";
import { CeoAnalytics as CeoAnalyticsData } from "../../Types/analytics";
import { ReservationStatus, ReservationStatusColors } from "../../Types/reservation";
import { BarChart, DonutChart, GaugeChart, HBarList, KpiCard, LineChart, SegmentedBar } from "../../Components/Dashboard/AnalyticsCharts";
import "./Analytics.css";

const formatMoney = (v: number) =>
  new Intl.NumberFormat("fa-IR").format(v) + " تومان";

const formatNum = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

const CeoAnalytics: React.FC = () => {
  const [data, setData] = useState<CeoAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ceoAnalyticsApi.getAnalytics();
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
          <p>در حال محاسبه تحلیل هوشمند...</p>
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

  const statusSlices = data.statusDistribution.map((s) => ({
    label: s.persianName,
    value: s.count,
    color: ReservationStatusColors[s.status as ReservationStatus] || "#94a3b8",
  }));

  const topTourItems = data.topTours.map((t) => ({
    label: `${t.tourName} (${t.tourCode})`,
    value: t.passengers,
    display: `${formatNum(t.passengers)} مسافر`,
    sublabel: `${formatNum(t.reservations)} رزرو — تکمیل ظرفیت ${t.occupancyRate}٪ — درآمد ${formatMoney(t.revenue)}`,
    color: "#7c3aed",
  }));

  const topRevenueItems = data.topTours.map((t) => ({
    label: `${t.tourName} (${t.tourCode})`,
    value: t.revenue,
    display: formatMoney(t.revenue),
    sublabel: `${formatNum(t.passengers)} مسافر — تکمیل ظرفیت ${t.occupancyRate}٪`,
    color: "#0d9488",
  }));

  const totalReservations = data.totalReservations;

  return (
    <div className="an-container">
      <div className="an-header">
        <div>
          <h2>
            <FaChartBar /> تحلیل هوشمند آژانس
          </h2>
          <p>بر اساس داده‌های رزرو، درآمد و تورهای شما</p>
        </div>
        <button className="an-refresh-btn" onClick={fetchData} disabled={loading}>
          <FaSyncAlt /> به‌روزرسانی
        </button>
      </div>

      {/* شاخص‌های کلیدی */}
      <div className="an-kpi-grid">
        <KpiCard
          title="درآمد کل (تأیید شده)"
          value={formatMoney(data.totalRevenue)}
          icon="💰"
          color="#0d9488"
        />
        <KpiCard
          title="تکمیل ظرفیت"
          value={`٪${formatNum(data.occupancyRate)}`}
          icon="📈"
          color="#7c3aed"
        />
        <KpiCard
          title="میانگین مبلغ هر رزرو"
          value={formatMoney(data.avgTicketPrice)}
          icon="🧾"
          color="#3b82f6"
        />
        <KpiCard
          title="رزروهای تأیید شده"
          value={formatNum(data.confirmedReservations)}
          icon="✅"
          color="#22c55e"
        />
        <KpiCard
          title="تورهای فعال"
          value={`${formatNum(data.activeTours)} از ${formatNum(data.totalTours)}`}
          icon="✈️"
          color="#f59e0b"
        />
      </div>

      {/* بینش‌های هوشمند */}
      <div className="an-insights">
        <span className="an-insight-chip">
          🏆 پرفروش‌ترین تور: <b>{data.bestTourName}</b>
        </span>
        <span className="an-insight-chip">
          📅 پررونق‌ترین ماه درآمد: <b>{data.busiestMonth}</b>
        </span>
        <span className="an-insight-chip">
          📆 پررونق‌ترین روز رزرو: <b>{data.busiestDay}</b>
        </span>
      </div>

      {/* چارت‌ها */}
      <div className="an-chart-grid">
        <div className="an-chart-card">
          <h4 className="an-chart-title">
            💰 روند درآمد ماهانه <span className="an-chart-subtitle">۶ ماه اخیر (تأیید شده)</span>
          </h4>
          <LineChart
            data={data.revenueByMonth.map((m) => ({ label: m.label, value: m.amount }))}
            color="#0d9488"
            formatValue={(v) => new Intl.NumberFormat("fa-IR").format(v)}
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            📈 روند درآمد روزانه <span className="an-chart-subtitle">۱۴ روز اخیر (تأیید شده)</span>
          </h4>
          <LineChart
            data={data.revenueByDay.map((d) => ({ label: d.label, value: d.amount }))}
            color="#3b82f6"
            formatValue={(v) => new Intl.NumberFormat("fa-IR").format(v)}
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            🎯 تکمیل ظرفیت کل تورها <span className="an-chart-subtitle">نرخ اشغال صندلی‌ها</span>
          </h4>
          <GaugeChart value={data.occupancyRate} label="تکمیل ظرفیت" color="#7c3aed" />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            📊 روند رزروها <span className="an-chart-subtitle">۱۴ روز اخیر</span>
          </h4>
          <BarChart
            data={data.reservationsByDay.map((d) => ({ label: d.label, value: d.count }))}
            color="#7c3aed"
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">🔄 وضعیت رزروها</h4>
          <DonutChart
            data={statusSlices}
            centerValue={formatNum(totalReservations)}
            centerLabel="کل رزروها"
          />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">📊 توزیع وضعیت رزروها</h4>
          <SegmentedBar data={statusSlices} formatValue={(v) => formatNum(v)} />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            🏆 پرطرفدارترین تورها <span className="an-chart-subtitle">۵ تای برتر بر اساس مسافر</span>
          </h4>
          <HBarList items={topTourItems} />
        </div>

        <div className="an-chart-card">
          <h4 className="an-chart-title">
            💵 پرسودترین تورها <span className="an-chart-subtitle">۵ تای برتر بر اساس درآمد</span>
          </h4>
          <HBarList items={topRevenueItems} color="#0d9488" />
        </div>
      </div>
    </div>
  );
};

export default CeoAnalytics;
