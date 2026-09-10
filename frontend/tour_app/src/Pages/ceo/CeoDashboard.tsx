import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../Components/Dashboard/DashboardLayout";
import CeoDashboardHome from "./CeoDashboardHome";
import CeoProfile from "./profile/CeoProfile";
import BankAccount from "./profile/BankAccount";
import AuditLogs from "./profile/AuditLogs";
import CeoVerificationPage from "../ceo/profile/CeoVerificationPage";
import ChangePassword from "./profile/ChangePassword";
import StaffManagement from "./staff/StaffManagement";
import HotelsManagement from "./hotel/HotelsManagement";
import FoodsManagement from "./food/FoodsManagement";
import VehiclesManagement from "./vehicles/VehiclesManagement";
import InsurancesManagement from "./insurance/InsurancesManagement";
import SeatArrangements from "./seat/SeatArrangements";
import SeatsManagement from "./seat/SeatsManagement";
import SeatManagement from "./seat/SeatManagement";
import GeoManagement from "./station/GeoManagement";
import StationTypesManagement from "./station/StationTypesManagement";
import StationsManagement from "./station/StationsManagement";
import BaseToursManagement from "./tour/BaseToursManagement";
import ToursManagement from "./maintour/ToursManagement";
import PoliciesManagement from "./policytour/PoliciesManagement";
import PaymentApprovals from "./reservations/PaymentApprovals";
import CeoCancelRequests from "./cancel-requests/CeoCancelRequests";
import CeoAnalytics from "../analytics/CeoAnalytics";
import MyTickets from "../tickets/MyTickets";
import CreateTicket from "../tickets/CreateTicket";
import TicketChat from "../tickets/TicketChat";
import TourChats from "../tourchat/TourChats";
import TourChat from "../tourchat/TourChat";
import Inbox from "../inbox/Inbox";
import Phonebook from "../phonebook/Phonebook";
import CeoSettlement from "./finance/CeoSettlement";
import CeoReviews from "./reviews/CeoReviews";
import CeoDiscounts from "./discount/CeoDiscounts";
import "./CeoDashboard.css";

const CeoDashboard: React.FC = () => {
  return (
    <DashboardLayout title="پنل مدیر آژانس" role="ceo">
      <Routes>
        <Route path="/" element={<CeoDashboardHome />} />
        <Route path="analytics" element={<CeoAnalytics />} />
        <Route path="verification" element={<CeoVerificationPage />} />
        <Route path="profile" element={<CeoProfile />} />
        <Route path="bank-account" element={<BankAccount />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="staff-management" element={<StaffManagement />} />
        <Route path="hotels-management" element={<HotelsManagement />} />
        <Route path="foods-management" element={<FoodsManagement />} />
        <Route path="vehicles-management" element={<VehiclesManagement />} />
        <Route path="insurances-management" element={<InsurancesManagement />} />
        <Route path="seats" element={<SeatsManagement />} />
        <Route path="seats/:vehicleId" element={<SeatManagement />} />
        <Route path="seat-arrangements" element={<SeatArrangements />} />
        <Route path="geo" element={<GeoManagement />} />
        <Route path="station-types" element={<StationTypesManagement />} />
        <Route path="stations" element={<StationsManagement />} />
        <Route path="base-tours" element={<BaseToursManagement />} />
        <Route path="tours" element={<ToursManagement />} />
        <Route path="policies" element={<PoliciesManagement />} />
        <Route path="payment-approvals" element={<PaymentApprovals />} />
        <Route path="cancel-requests" element={<CeoCancelRequests />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/create" element={<CreateTicket />} />
        <Route path="tickets/:ticketId" element={<TicketChat />} />
        <Route path="chat" element={<TourChats role="ceo" />} />
        <Route path="chat/:conversationId" element={<TourChat role="ceo" />} />
        <Route path="inbox" element={<Inbox role="ceo" />} />
        <Route path="phonebook" element={<Phonebook role="ceo" />} />
        <Route path="settlement" element={<CeoSettlement />} />
        <Route path="reviews" element={<CeoReviews />} />
        <Route path="discounts" element={<CeoDiscounts />} />
      </Routes>
    </DashboardLayout>
  );
};

export default CeoDashboard;
