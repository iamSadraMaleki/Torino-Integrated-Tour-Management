import React, { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import DashboardLayout from "../../Components/Dashboard/DashboardLayout";
import DashboardStats from "../../Components/Dashboard/DashboardStats";
import AvailableTours from "./tours/AvailableTours";
import TourBooking from "./tours/TourBooking";
import SpecialTours from "./tours/SpecialTours";
import MyBookings from "./bookings/MyBookings";
import MyTrips from "./trips/MyTrips";
import UserProfile from "./profile/UserProfile";
import UserBankAccount from "./profile/UserBankAccount";
import UserChangePassword from "./profile/UserChangePassword";
import UserAuditLogs from "./profile/UserAuditLogs";
import MyTickets from "../tickets/MyTickets";
import CreateTicket from "../tickets/CreateTicket";
import TicketChat from "../tickets/TicketChat";
import TourChats from "../tourchat/TourChats";
import TourChat from "../tourchat/TourChat";
import Inbox from "../inbox/Inbox";
import Phonebook from "../phonebook/Phonebook";
import { userTourApi } from "../../Services/userTourApi";
import { reservationApi } from "../../Services/reservationApi";
import { Reservation, ReservationStatus, UserTour } from "../../Types/reservation";
import "../ceo/CeoDashboard.css";
import "./UserPages.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

const UserDashboard: React.FC = () => {
  return (
    <DashboardLayout title="داشبورد کاربری" role="user">
      <Routes>
        <Route path="/" element={<UserDashboardHome />} />
        <Route path="tours" element={<AvailableTours />} />
        <Route path="special-tours" element={<SpecialTours />} />
        <Route path="tours/:tourId/book" element={<TourBooking />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="trips/upcoming" element={<MyTrips initialTab="upcoming" />} />
        <Route path="trips/past" element={<MyTrips initialTab="past" />} />
        <Route path="trips/wishlist" element={<MyTrips initialTab="wishlist" />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="bank-account" element={<UserBankAccount />} />
        <Route path="change-password" element={<UserChangePassword />} />
        <Route path="audit-logs" element={<UserAuditLogs />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/create" element={<CreateTicket />} />
        <Route path="tickets/:ticketId" element={<TicketChat />} />
        <Route path="chat" element={<TourChats role="user" />} />
        <Route path="chat/:conversationId" element={<TourChat role="user" />} />
        <Route path="inbox" element={<Inbox role="user" />} />
        <Route path="phonebook" element={<Phonebook role="user" />} />
      </Routes>
    </DashboardLayout>
  );
};

const UserDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState<UserTour[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [toursRes, bookingsRes] = await Promise.all([
        userTourApi.getAvailableTours(),
        reservationApi.getMyReservations(),
      ]);
      if (toursRes.success) setTours(toursRes.data || []);
      if (bookingsRes.success) setReservations(bookingsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmedCount = reservations.filter((r) => r.status === ReservationStatus.CONFIRMED).length;
  const pendingCount = reservations.filter(
    (r) =>
      r.status === ReservationStatus.PENDING_PAYMENT ||
      r.status === ReservationStatus.WAITING_FOR_VERIFICATION
  ).length;

  const stats = [
    { title: "تورهای رزرو شده", value: confirmedCount, icon: "✈️" },
    { title: "در انتظار تأیید", value: pendingCount, icon: "⏳" },
    { title: "تورهای موجود", value: tours.length, icon: "🌍" },
    { title: "کل رزروها", value: reservations.length, icon: "📋" },
  ];

  const recentBookings = reservations.slice(0, 5);
  const featuredTours = tours.slice(0, 4);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <>
      <div className="welcome-card">
        <h2 className="welcome-title">خوش آمدی، {user?.username}!</h2>
        <p className="welcome-text">
          به پنل کاربری تورینو خوش آمدی. می‌توانی تورها را مشاهده و رزرو کنی.
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            <span>✈️</span> تورهای موجود
          </h3>
          <Link to="/user/dashboard/tours" className="section-link">
            مشاهده همه →
          </Link>
        </div>
        {featuredTours.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            تور فعالی موجود نیست
          </div>
        ) : (
          featuredTours.map((tour) => (
            <div key={tour.id} className="tour-list-item">
              <div className="tour-list-info">
                <h4>{tour.baseTourName}</h4>
                <p>
                  {formatDate(tour.departureDate)} — {formatPrice(tour.price)} — ظرفیت:{" "}
                  {tour.availableCapacity}
                </p>
              </div>
              <Link to={`/user/dashboard/tours/${tour.id}/book`} className="btn-primary">
                رزرو
              </Link>
            </div>
          ))
        )}
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            <span>📅</span> آخرین رزروها
          </h3>
          <Link to="/user/dashboard/bookings" className="section-link">
            مشاهده همه →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            هنوز رزروی ثبت نشده
          </div>
        ) : (
          recentBookings.map((r) => (
            <div key={r.id} className="tour-list-item">
              <div className="tour-list-info">
                <h4>{r.tourName}</h4>
                <p>
                  {formatDate(r.departureDate)} — {r.statusPersian} — {formatPrice(r.totalPrice)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default UserDashboard;
