# 🧳 TourMS — Travel & Tour Management System

A multi-role travel and tour management platform covering the full tour lifecycle — from creation and resource allocation to bookings, payments, settlements, and analytics. Built on a RESTful API architecture with **328 endpoints** across **61 controllers**, it serves travelers, travel agencies, platform admins, and geographic operators through role-based access.

---

## ✨ Features

- **Tour Management** — itineraries, schedules, vehicles, staff, hotels, food, insurance
- **Booking & Reservations** — seat selection, payment proofs, cancellations, refunds
- **Finance** — settlements, commissions, discounts, staff payments
- **Communication** — tour chat, inbox, ticketing
- **Fleet & Inventory** — vehicles, repairs, stock management
- **Content** — announcements, reviews, wishlists, landing pages
- **Analytics** — dedicated dashboards for CEO and Admin

---

## 👤 User Roles

| Role | Prefix | Description |
|------|--------|-------------|
| **User** | `/api/user/*` | Traveler — browse, book, pay, cancel, chat, review |
| **CEO** | `/api/ceo/*` | Travel agency — manage tours, vehicles, staff, finance |
| **Admin** | `/api/admin/*` | Platform administrator — users, tickets, content, analytics |
| **Geo** | `/api/geo/*` | Geographic operator — stations, inventory, reservations |
| **SuperAdmin** | — | System-level elevated privileges |

---

## 🧩 Core Modules

| Module | Controllers | Responsibility |
|--------|-------------|----------------|
| Tour | `TourController`, `BaseTourController`, `TourRealScheduleController` | Tour lifecycle, schedules, itineraries |
| Booking | `ReservationController`, `CeoReservationController`, `SeatController` | Reservations, cancellations, seats |
| Finance | `CeoFinanceController`, `AdminFinanceController`, `BankAccountController` | Settlements, commissions, payments |
| Fleet | `VehicleController`, `VehicleRepairController`, `VehicleFeatureController` | Vehicles, repairs, features |
| Staff | `StaffMemberController`, `PositionController`, `StaffPaymentController` | HR, positions, payroll |
| Communication | `*TourChatController`, `*InboxController`, `TicketController` | Chat, inbox, support tickets |
| Content | `AnnouncementController`, `ReviewController`, `LandingController` | Announcements, reviews, landing |
| Geo | `GeoController`, `StationController`, `PhonebookController` | Locations, stations, contacts |
| Discounts | `CeoDiscountController`, `AdminDiscountController`, `UserDiscountController` | Codes, specials, validation |
| Analytics | `AnalyticsController`, `ApiDocumentationController` | Dashboards, API docs |

---

## 🏗️ Architecture

| Aspect | Detail |
|--------|--------|
| Style | RESTful API |
| Port | `8081` |
| Total Endpoints | `328` |
| Total Controllers | `61` |
| Auth | Role-Based Access Control (RBAC) |
| Tenancy | Multi-tenant (multiple agencies) |
| Docs | Swagger / OpenAPI |

---

## 📚 API Prefixes

```
/api/auth/*     → Authentication (login, register, logout)
/api/user/*     → Traveler operations
/api/ceo/*      → Agency operations
/api/admin/*    → Platform administration
/api/geo/*      → Geographic operations
/api/public/*   → Public endpoints
```

---

## 🚀 Use Cases

- Multi-agency travel booking platforms
- Tour operator management systems
- Travel marketplace backends
- Agency ERP with integrated booking and finance

---

## 📄 License

Specify your license here (e.g., MIT, Apache 2.0).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

---

**TourMS** — *Powering the business of travel, end to end.* 🌍
