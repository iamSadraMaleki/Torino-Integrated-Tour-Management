import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { tourApi } from "../../Services/tourApi";
import { ceoDashboardApi, ceoReservationApi } from "../../Services/ceoReservationApi";
import { ceoAnalyticsApi } from "../../Services/analyticsApi";
import { ceoFinanceApi } from "../../Services/financeApi";
import { ceoReviewApi } from "../../Services/reviewApi";
import { CeoDashboardStats, Reservation, UserTour } from "../../Types/reservation";
import { CeoAnalytics } from "../../Types/analytics";
import { CeoSettlementSummary } from "../../Types/finance";
import { TourReview } from "../../Types/review";
import { Tour, TourStatus } from "../../Types/tour";
import {
  DonutChart,
  HBarList,
  KpiCard,
  LineChart,
  SegmentedBar,
} from "../../Components/Dashboard/AnalyticsCharts";
import RatingStars from "../../Components/Reviews/RatingStars";
import TourStatusBadge from "./maintour/TourStatusBadge";
import "./CeoDashboard.css";

const formatPrice = (v: number) =>
  new Intl.NumberFormat("fa-IR").format(v) + " تومان";

const formatNum = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fa-IR") : "—";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#22c55e",
  PENDING_PAYMENT: "#f59e0b",
  WAITING_FOR_VERIFICATION: "#3b82f6",
  CANCELLED: "#94a3b8",
  REJECTED: "#ef4444",
};

const QUICK_ACTIONS = [
  { path: "/ceo/dashboard/tours", icon: "🎫", title: "مدیریت تورها", desc: "ایجاد و مدیریت تورها" },
  { path: "/ceo/dashboard/payment-approvals", icon: "💳", title: "تأیید پرداخت‌ها", desc: "بررسی رسیدهای پرداخت" },
  { path: "/ceo/dashboard/cancel-requests", icon: "📋", title: "درخواست‌های لغو", desc: "مدیریت کنسلی مسافران" },
  { path: "/ceo/dashboard/settlement", icon: "💸", title: "تسویه حساب", desc: "موجودی و درخواست تسویه" },
  { path: "/ceo/dashboard/reviews", icon: "⭐", title: "نظرات مسافران", desc: "بازخورد تورهای شما" },
  { path: "/ceo/dashboard/analytics", icon: "📊", title: "تحلیل هوشمند", desc: "گزارش‌ها و نمودارها" },
  { path: "/ceo/dashboard/staff-management", icon: "👥", title: "مدیریت کارمندان", desc: "کارمندان و پرداخت‌ها" },
  { path: "/ceo/dashboard/tickets", icon: "🎫", title: "پشتیبانی و تیکت‌ها", desc: "تیکت‌های شما" },
];

const CeoDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CeoDashboardStats | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [analytics, setAnalytics] = useState<CeoAnalytics | null>(null);
  const [finance, setFinance] = useState<CeoSettlementSummary | null>(null);
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Reservation[]>([]);
  const [pendingCancels, setPendingCancels] = useState<number>(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [stRes, toursRes, anRes, finRes, revRes, pendRes, cancRes] = await Promise.all([
        ceoDashboardApi.getStats(),
        tourApi.getMyTours(),
        ceoAnalyticsApi.getAnalytics(),
        ceoFinanceApi.getSummary(),
        ceoReviewApi.getReviews(),
        ceoReservationApi.getPending().catch(() => null),
        ceoReservationApi.getCancelRequests().catch(() => null),
      ]);
      if (stRes.success) setStats(stRes.data);
      if (toursRes.success) setTours(toursRes.data || []);
      if (anRes.success) setAnalytics(anRes.data);
      if (finRes.success) setFinance(finRes.data);
      if (revRes.success) setReviews(revRes.data || []);
      if (pendRes?.success) setPendingApprovals(pendRes.data || []);
      if (cancRes?.success) {
        const list = cancRes.data || [];
        setPendingCancels(list.filter((c) => c.status === "PENDING").length);
      }
    } catch (err) {
      console.error("Error fetching CEO dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const statusData = (analytics?.statusDistribution || []).map((s) => ({
    label: s.persianName,
    value: s.count,
    color: STATUS_COLORS[s.status] || "#94a3b8",
  }));

  const topTourItems = (analytics?.topTours || []).map((t) => ({
    label: t.tourName,
    sublabel: `${formatNum(t.reservations)} رزرو — ${formatNum(t.passengers)} مسافر — ٪${t.occupancyRate} اشغال`,
    value: t.revenue,
    display: formatPrice(t.revenue),
  }));

  const revenueData = (analytics?.revenueByDay || []).map((m) => ({
    label: m.label,
    value: m.amount,
  }));

  const occupancy = analytics?.occupancyRate ?? 0;
  const occupancyData = [
    { label: "پر شده", value: Math.round(occupancy), color: "#0d9488" },
    { label: "خالی", value: 100 - Math.round(occupancy), color: "#e2e8f0" },
  ];

  const recentTours = tours.slice(0, 4);
  const recentApprovals = pendingApprovals.slice(0, 4);

  return (
    <>
      <div className="welcome-card">
        <div>
          <h2 className="welcome-title">خوش آمدی، {user?.username}! 👋</h2>
          <p className="welcome-text">
            نمای کلی آژانس — تورها، رزروها، درآمد، نظرات و تسویه حساب
          </p>
        </div>
        <button className="ceo-home-refresh" onClick={fetchAll}>
          🔄 بروزرسانی
        </button>
      </div>

      {/* ============ شاخص‌های کلیدی ============ */}
      <div className="ceo-kpi-grid">
        <KpiCard title="تورهای فعال" value={formatNum(stats?.activeTours ?? 0)} icon="✈️" color="#0d9488" hint="تورهای در حال برگزاری" />
        <KpiCard title="در انتظار تأیید پرداخت" value={formatNum(stats?.pendingApprovals ?? 0)} icon="💳" color="#f59e0b" hint="رسیدهایی که باید بررسی کنی" />
        <KpiCard title="مسافران تأییدشده" value={formatNum(stats?.totalPassengers ?? 0)} icon="👥" color="#3b82f6" hint="مجموع مسافران رزرو نهایی" />
        <KpiCard title="رزروهای تأییدشده" value={formatNum(stats?.confirmedReservations ?? 0)} icon="✅" color="#22c55e" hint="رزروهای نهایی شده" />
        <KpiCard title="درآمد کل" value={formatPrice(stats?.totalRevenue ?? 0)} icon="💰" color="#16a34a" hint="از رزروهای تأییدشده" />
        <KpiCard title="قابل تسویه" value={formatPrice(finance?.availableAmount ?? 0)} icon="💸" color="#7c3aed" hint="خالص قابل برداشت (کمیسیون ٪{finance?.commissionPercent ?? 10})" />
        <KpiCard title="نظرات مسافران" value={`${formatNum(reviews.length)} (${avgRating || "—"})`} icon="⭐" color="#f59e0b" hint="میانگین امتیاز" />
        <KpiCard title="درخواست لغو در انتظار" value={formatNum(pendingCancels)} icon="📋" color="#ef4444" hint="کنسلی‌های نیاز به بررسی" />
      </div>

      {/* ============ نمودارها ============ */}
      <div className="ceo-charts-row">
        <div className="ceo-chart-card">
          <div className="ceo-chart-head">
            <h3>📈 روند درآمد ۱۴ روز اخیر</h3>
            <span className="ceo-chart-sub">از رزروهای تأییدشده</span>
          </div>
          <LineChart
            data={revenueData}
            color="#0d9488"
            formatValue={(v) => formatPrice(v)}
          />
        </div>

        <div className="ceo-chart-card">
          <div className="ceo-chart-head">
            <h3>📊 وضعیت رزروهای شما</h3>
            <span className="ceo-chart-sub">{formatNum(analytics?.totalReservations ?? 0)} رزرو</span>
          </div>
          <SegmentedBar data={statusData} formatValue={(v) => formatNum(v)} />
        </div>
      </div>

      <div className="ceo-charts-row">
        <div className="ceo-chart-card">
          <div className="ceo-chart-head">
            <h3>🏆 پرسودترین تورها</h3>
            <span className="ceo-chart-sub">بر اساس درآمد</span>
          </div>
          <HBarList items={topTourItems} color="#0d9488" />
        </div>

        <div className="ceo-chart-card">
          <div className="ceo-chart-head">
            <h3>🎯 تکمیل ظرفیت</h3>
            <span className="ceo-chart-sub">
              {analytics?.bestTourName ? `پرتعدادترین: ${analytics.bestTourName}` : "میانگین تورها"}
            </span>
          </div>
          <DonutChart
            data={occupancyData}
            centerLabel="اشغال"
            centerValue={`٪${Math.round(occupancy)}`}
          />
        </div>
      </div>

      {/* ============ بخش پایین ============ */}
      <div className="ceo-charts-row">
        {/* آخرین نظرات */}
        <div className="ceo-chart-card">
          <div className="ceo-chart-head">
            <h3>⭐ آخرین نظرات مسافران</h3>
            <Link to="/ceo/dashboard/reviews" className="ceo-chart-link">
              مشاهده همه ({reviews.length})
            </Link>
          </div>
          {reviews.length === 0 ? (
            <div className="ceo-home-empty">هنوز نظری ثبت نشده است</div>
          ) : (
            <div className="ceo-reviews-list">
              {reviews.slice(0, 4).map((r) => (
                <div className="ceo-review-item" key={r.id}>
                  <div className="ceo-review-top">
                    <div className="ceo-review-user">
                      <strong>{r.userUsername}</strong>
                      <span className="ceo-review-tour">{r.tourName}</span>
                    </div>
                    <RatingStars rating={r.rating} size={13} />
                  </div>
                  {r.comment && <p className="ceo-review-comment">{r.comment}</p>}
                  <span className="ceo-review-date">🗓 {formatDate(r.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* در انتظار تأیید پرداخت */}
        <div className="ceo-chart-card">
          <div className="ceo-chart-head">
            <h3>💳 در انتظار تأیید پرداخت</h3>
            <Link to="/ceo/dashboard/payment-approvals" className="ceo-chart-link">
              بررسی همه ({pendingApprovals.length})
            </Link>
          </div>
          {recentApprovals.length === 0 ? (
            <div className="ceo-home-empty">پرداختی در انتظار بررسی نیست</div>
          ) : (
            <div className="ceo-approvals-list">
              {recentApprovals.map((r) => (
                <div className="ceo-approval-item" key={r.id}>
                  <div>
                    <strong>{r.tourName}</strong>
                    <span className="ceo-approval-sub">
                      {r.userUsername} — {formatPrice(r.totalPrice)} — {r.passengerCount} نفر
                    </span>
                  </div>
                  <Link
                    to="/ceo/dashboard/payment-approvals"
                    className="ceo-approval-btn"
                  >
                    بررسی
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* دسترسی سریع */}
      <div className="ceo-chart-card" style={{ marginBottom: "1.25rem" }}>
        <div className="ceo-chart-head">
          <h3>⚡ دسترسی سریع</h3>
          <span className="ceo-chart-sub">ماژول‌های پنل آژانس</span>
        </div>
        <div className="ceo-quick-grid">
          {QUICK_ACTIONS.map((qa) => (
            <Link key={qa.path} to={qa.path} className="ceo-quick-item">
              <span className="ceo-quick-icon">{qa.icon}</span>
              <div>
                <strong>{qa.title}</strong>
                <small>{qa.desc}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* تورهای اخیر */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            <span>✈️</span> تورهای من
          </h3>
          <Link to="/ceo/dashboard/tours" className="section-link">
            مدیریت تورها →
          </Link>
        </div>
        {recentTours.length === 0 ? (
          <div className="ceo-home-empty">هنوز توری تعریف نشده است</div>
        ) : (
          recentTours.map((tour) => (
            <div key={tour.id} className="tour-list-item">
              <div className="tour-list-info">
                <h4>{tour.baseTourName}</h4>
                <p>
                  {formatDate(tour.departureDate)} — {formatPrice(tour.price)} — ظرفیت: {tour.capacity}
                </p>
              </div>
              <TourStatusBadge status={tour.status as TourStatus} size="sm" />
            </div>
          ))
        )}
      </div>

      {/* نوار هشدار */}
      {(stats?.pendingApprovals ?? 0) > 0 || pendingCancels > 0 || (finance?.pendingRequests ?? 0) > 0 ? (
        <div className="ceo-alert-bar">
          {(stats?.pendingApprovals ?? 0) > 0 && (
            <Link to="/ceo/dashboard/payment-approvals">
              💳 {formatNum(stats!.pendingApprovals)} پرداخت در انتظار تأیید
            </Link>
          )}
          {pendingCancels > 0 && (
            <Link to="/ceo/dashboard/cancel-requests">
              📋 {formatNum(pendingCancels)} درخواست لغو در انتظار بررسی
            </Link>
          )}
          {(finance?.pendingRequests ?? 0) > 0 && (
            <Link to="/ceo/dashboard/settlement">
              💸 {formatNum(finance!.pendingRequests)} درخواست تسویه در انتظار
            </Link>
          )}
        </div>
      ) : (
        <div className="ceo-alert-bar">
          <span style={{ color: "#16a34a" }}>✅ همهچیز مرتب است — مورد نیاز به بررسی فوری ندارید</span>
        </div>
      )}
    </>
  );
};

export default CeoDashboardHome;
