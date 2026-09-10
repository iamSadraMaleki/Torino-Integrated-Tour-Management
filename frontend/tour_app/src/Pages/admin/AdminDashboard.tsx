import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../Components/Dashboard/DashboardLayout";
import { adminVerificationApi } from "../../services/adminApi";
import AdminDashboardHome from "./AdminDashboardHome";
import UsersList from "./UsersList";
import VerificationsList from "./VerificationsList";
import AnnouncementsManagement from "./AnnouncementsManagement";
import AdminAnalytics from "../analytics/AdminAnalytics";
import TicketsManagement from "./TicketsManagement";
import TicketChat from "../tickets/TicketChat";
import AdminChatMonitor from "./AdminChatMonitor";
import AdminInboxManagement from "./AdminInboxManagement";
import AdminPhonebook from "./AdminPhonebook";
import LandingManagement from "./LandingManagement";
import AgenciesList from "./AgenciesList";
import AllTours from "./AllTours";
import FinanceManagement from "./FinanceManagement";
import AdminReviews from "./AdminReviews";
import AdminDiscounts from "./AdminDiscounts";
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const fetchStatistics = async () => {
    try {
      await adminVerificationApi.getStatistics();
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  return (
    <DashboardLayout title="پنل مدیریت" role="admin">
      <Routes>
        {/* صفحه اصلی داشبورد ادمین */}
        <Route path="/" element={<AdminDashboardHome />} />
        {/* مدیریت کاربران */}
        <Route path="users" element={<UsersList onUserCountChange={() => {}} />} />
        {/* درخواست‌های احراز هویت */}
        <Route path="verifications" element={<VerificationsList onStatsChange={fetchStatistics} />} />
        {/* تحلیل هوشمند پلتفرم */}
        <Route path="analytics" element={<AdminAnalytics />} />
        {/* اطلاعیه‌های سراسری */}
        <Route path="announcements" element={<AnnouncementsManagement />} />
        {/* پشتیبانی و تیکت‌ها */}
        <Route path="tickets" element={<TicketsManagement />} />
        <Route path="tickets/:ticketId" element={<TicketChat admin />} />
        {/* مانیتورینگ چت مسافر و مدیر آژانس */}
        <Route path="chat-monitor" element={<AdminChatMonitor />} />
        {/* اینباکس و پیام خصوصی + مدیریت تعلیق */}
        <Route path="inbox-management" element={<AdminInboxManagement />} />
        {/* مانیتورینگ دفترچه تلفن کاربران */}
        <Route path="phonebook-monitor" element={<AdminPhonebook />} />
        {/* مدیریت صفحه معرفی سیستم */}
        <Route path="landing" element={<LandingManagement />} />
        {/* لیست آژانس‌ها */}
        <Route path="agencies-list" element={<AgenciesList />} />
        {/* همه تورهای سیستم */}
        <Route path="all-tours" element={<AllTours />} />
        {/* مدیریت مالی پلتفرم */}
        <Route path="finance-management" element={<FinanceManagement />} />
        <Route path="finance-management/:tab" element={<FinanceManagement />} />
        {/* مانیتورینگ نظرات کاربران */}
        <Route path="reviews-monitor" element={<AdminReviews />} />
        {/* مانیتورینگ تخفیف‌ها */}
        <Route path="discounts-monitor" element={<AdminDiscounts />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;