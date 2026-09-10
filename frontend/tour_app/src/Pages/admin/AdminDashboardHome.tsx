import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { adminUserApi, adminVerificationApi } from "../../services/adminApi";
import { adminAnalyticsApi } from "../../Services/analyticsApi";
import { adminFinanceApi } from "../../Services/financeApi";
import { adminReviewApi } from "../../Services/reviewApi";
import { adminTicketApi } from "../../Services/ticketApi";
import { AdminAnalytics } from "../../Types/analytics";
import { FinanceSummary } from "../../Types/finance";
import { TourReview } from "../../Types/review";
import { TicketStats } from "../../Types/ticket";
import {
  DonutChart,
  HBarList,
  KpiCard,
  LineChart,
  SegmentedBar,
} from "../../Components/Dashboard/AnalyticsCharts";
import RatingStars from "../../Components/Reviews/RatingStars";
import "./AdminDashboard.css";

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

const ROLE_COLORS: Record<string, string> = {
  ROLE_USER: "#3b82f6",
  ROLE_CEO: "#7c3aed",
  ROLE_ADMIN: "#0d9488",
  ROLE_SUPERADMIN: "#f59e0b",
};

const QUICK_ACTIONS = [
  { path: "/admin/dashboard/users", icon: "👥", title: "مدیریت کاربران", desc: "فعال/غیرفعال و حذف کاربران" },
  { path: "/admin/dashboard/verifications", icon: "✅", title: "احراز هویت", desc: "بررسی درخواست آژانس‌ها" },
  { path: "/admin/dashboard/tickets", icon: "🎫", title: "تیکت‌های پشتیبانی", desc: "پاسخ به تیکت‌ها" },
  { path: "/admin/dashboard/finance-management", icon: "💰", title: "مدیریت مالی", desc: "تراکنش‌ها، تسویه و کمیسیون" },
  { path: "/admin/dashboard/reviews-monitor", icon: "⭐", title: "نظرات کاربران", desc: "مانیتورینگ نظرات" },
  { path: "/admin/dashboard/announcements", icon: "📢", title: "اطلاعیه‌های سراسری", desc: "پیام به همه کاربران" },
  { path: "/admin/dashboard/agencies-list", icon: "🏛️", title: "لیست آژانس‌ها", desc: "آژانس‌های ثبت‌شده" },
  { path: "/admin/dashboard/all-tours", icon: "🌍", title: "همه تورها", desc: "تورهای کل سیستم" },
];

const AdminDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [tickets, setTickets] = useState<TicketStats | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [anRes, finRes, revRes, ticRes, users, vStats] = await Promise.all([
        adminAnalyticsApi.getAnalytics(),
        adminFinanceApi.getSummary(),
        adminReviewApi.getReviews(),
        adminTicketApi.getStats(),
        adminUserApi.getAllUsers().catch(() => []),
        adminVerificationApi.getStatistics().catch(() => null),
      ]);
      if (anRes.success) setAnalytics(anRes.data);
      if (finRes.success) setFinance(finRes.data);
      if (revRes.success) setReviews(revRes.data || []);
      if (ticRes.success) setTickets(ticRes.data);
      setUserCount(Array.isArray(users) ? users.length : 0);
      setPendingVerifications(vStats?.pending ?? 0);
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
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
        <p>در حال بارگذاری داشبورد مدیریتی...</p>
      </div>
    );
  }

  const totals = analytics?.totals;
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const statusData = (analytics?.reservationStatusDistribution || []).map((s) => ({
    label: s.persianName,
    value: s.count,
    color: STATUS_COLORS[s.status] || "#94a3b8",
  }));

  const roleData = (analytics?.roleDistribution || []).map((r) => ({
    label: r.persianName,
    value: r.count,
    color: ROLE_COLORS[r.role] || "#94a3b8",
  }));

  const topAgencyItems = (analytics?.topAgencies || []).map((a) => ({
    label: a.agencyName || a.username,
    sublabel: `${formatNum(a.reservations)} رزرو — ${formatNum(a.passengers)} مسافر`,
    value: a.revenue,
    display: formatPrice(a.revenue),
  }));

  const revenueData = (analytics?.revenueByMonth || []).map((m) => ({
    label: m.label,
    value: m.amount,
  }));

  return (
    <>
      <div className="welcome-card">
        <div>
          <h2 className="welcome-title">خوش آمدی، {user?.username}! 👋</h2>
          <p className="welcome-text">
            نمای کلی پلتفرم — کاربران، آژانس‌ها، درآمد، نظرات و وضعیت پشتیبانی
          </p>
        </div>
        <button className="ad-home-refresh" onClick={fetchAll}>
          🔄 بروزرسانی
        </button>
      </div>

      {/* ============ شاخص‌های کلیدی ============ */}
      <div className="ad-kpi-grid">
        <KpiCard title="کل کاربران" value={formatNum(totals?.totalUsers ?? userCount)} icon="👥" color="#3b82f6" hint="کل حساب‌های پلتفرم" />
        <KpiCard title="آژانس‌ها" value={formatNum(totals?.totalCeos ?? 0)} icon="🏢" color="#7c3aed" hint="مدیران آژانس تاییدشده" />
        <KpiCard title="تورهای سیستم" value={formatNum(totals?.totalTours ?? 0)} icon="🌍" color="#0d9488" hint="همه تورهای ثبت‌شده" />
        <KpiCard title="رزروهای تاییدشده" value={formatNum(totals?.confirmedReservations ?? 0)} icon="✅" color="#22c55e" hint="رزرو نهایی شده" />
        <KpiCard title="درآمد کل پلتفرم" value={formatPrice(totals?.totalRevenue ?? 0)} icon="💰" color="#16a34a" hint="از رزروهای تاییدشده" />
        <KpiCard title="کمیسیون پلتفرم" value={formatPrice(finance?.totalCommission ?? 0)} icon="📈" color="#f59e0b" hint="سهم پلتفرم از فروش" />
        <KpiCard title="تسویه در انتظار" value={formatNum(finance?.pendingSettlements ?? 0)} icon="⏳" color="#f97316" hint="درخواست تسویه آژانس‌ها" />
        <KpiCard title="تیکت‌های باز" value={formatNum((tickets?.open ?? 0) + (tickets?.inProgress ?? 0))} icon="🎫" color="#ef4444" hint="نیاز به پاسخ پشتیبانی" />
      </div>

      {/* ============ نمودارها ============ */}
      <div className="ad-charts-row">
        <div className="ad-chart-card">
          <div className="ad-chart-head">
            <h3>📈 روند درآمد پلتفرم</h3>
            <span className="ad-chart-sub">۶ ماه اخیر</span>
          </div>
          <LineChart
            data={revenueData}
            color="#6366f1"
            formatValue={(v) => formatPrice(v)}
          />
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-head">
            <h3>📊 وضعیت رزروهای پلتفرم</h3>
            <span className="ad-chart-sub">{formatNum(totals?.totalReservations ?? 0)} رزرو</span>
          </div>
          <SegmentedBar data={statusData} formatValue={(v) => formatNum(v)} />
        </div>
      </div>

      <div className="ad-charts-row">
        <div className="ad-chart-card">
          <div className="ad-chart-head">
            <h3>🏆 پرسودترین آژانس‌ها</h3>
            <span className="ad-chart-sub">بر اساس درآمد</span>
          </div>
          <HBarList items={topAgencyItems} color="#0d9488" />
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-head">
            <h3>👥 توزیع نقش‌های کاربران</h3>
            <span className="ad-chart-sub">کاربر / آژانس / مدیر</span>
          </div>
          <DonutChart
            data={roleData}
            centerLabel="کاربر"
            centerValue={formatNum(totals?.totalUsers ?? 0)}
          />
        </div>
      </div>

      {/* ============ بخش پایین ============ */}
      <div className="ad-charts-row">
        {/* آخرین نظرات */}
        <div className="ad-chart-card">
          <div className="ad-chart-head">
            <h3>⭐ آخرین نظرات مسافران</h3>
            <Link to="/admin/dashboard/reviews-monitor" className="ad-chart-link">
              مشاهده همه ({reviews.length})
            </Link>
          </div>
          {reviews.length === 0 ? (
            <div className="ad-home-empty">هنوز نظری ثبت نشده است</div>
          ) : (
            <div className="ad-reviews-list">
              {reviews.slice(0, 4).map((r) => (
                <div className="ad-review-item" key={r.id}>
                  <div className="ad-review-top">
                    <div className="ad-review-user">
                      <strong>{r.userUsername}</strong>
                      <span className="ad-review-tour">{r.tourName}</span>
                    </div>
                    <RatingStars rating={r.rating} size={13} />
                  </div>
                  {r.comment && <p className="ad-review-comment">{r.comment}</p>}
                  <span className="ad-review-date">🗓 {formatDate(r.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* دسترسی سریع */}
        <div className="ad-chart-card">
          <div className="ad-chart-head">
            <h3>⚡ دسترسی سریع</h3>
            <span className="ad-chart-sub">ماژول‌های پنل مدیریت</span>
          </div>
          <div className="ad-quick-grid">
            {QUICK_ACTIONS.map((qa) => (
              <Link key={qa.path} to={qa.path} className="ad-quick-item">
                <span className="ad-quick-icon">{qa.icon}</span>
                <div>
                  <strong>{qa.title}</strong>
                  <small>{qa.desc}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* نوار هشدار تسویه/تیکت */}
      {(finance?.pendingSettlements ?? 0) > 0 || (tickets?.open ?? 0) > 0 ? (
        <div className="ad-alert-bar">
          {pendingVerifications > 0 && (
            <Link to="/admin/dashboard/verifications">
              ⚠️ {formatNum(pendingVerifications)} درخواست احراز هویت در انتظار بررسی
            </Link>
          )}
          {(finance?.pendingSettlements ?? 0) > 0 && (
            <Link to="/admin/dashboard/finance-management/settlements">
              💳 {formatNum(finance!.pendingSettlements)} درخواست تسویه در انتظار
            </Link>
          )}
          {(tickets?.open ?? 0) > 0 && (
            <Link to="/admin/dashboard/tickets">
              🎫 {formatNum(tickets!.open)} تیکت باز نیاز به پاسخ
            </Link>
          )}
        </div>
      ) : (
        <div className="ad-alert-bar">
          <span style={{ color: "#16a34a" }}>✅ همه‌چیز مرتب است — مورد نیاز به بررسی فوری ندارید</span>
        </div>
      )}
    </>
  );
};

export default AdminDashboardHome;
