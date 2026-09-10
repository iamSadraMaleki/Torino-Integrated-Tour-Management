import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./DashboardSidebar.css";

interface DashboardSidebarProps {
  isOpen: boolean;
  role: "user" | "ceo" | "admin";
  isVerified?: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, role, isVerified = true }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menuName: string) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  // تعیین prefix بر اساس نقش
  const getPrefix = () => {
    if (role === "ceo") return "/ceo/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/user/dashboard";
  };

  const prefix = getPrefix();

  // آیتم‌های عمومی برای همه نقش‌ها
  const commonItems = [
    { path: `${prefix}`, icon: "🏠", label: "داشبورد" },
  ];

  const roleSpecificItems = {
    user: [
      {
        type: "submenu",
        icon: "✈️",
        label: "سفرهای من",
        submenu: [
          { path: `${prefix}/trips/upcoming`, icon: "📅", label: "سفرهای پیش رو" },
          { path: `${prefix}/trips/past`, icon: "✅", label: "سفرهای گذشته" },
          { path: `${prefix}/trips/wishlist`, icon: "📌", label: "مورد علاقه‌ها" },
        ]
      },
      {
        type: "submenu",
        icon: "🎫",
        label: "سفر و رزرو",
        submenu: [
          { path: `${prefix}/special-tours`, icon: "🔥", label: "تورهای ویژه" },
          { path: `${prefix}/tours`, icon: "🌍", label: "رزرو تور" },
          { path: `${prefix}/bookings`, icon: "📋", label: "رزروهای من" },
        ]
      },
      {
        type: "submenu",
        icon: "💬",
        label: "ارتباطات",
        submenu: [
          { path: `${prefix}/inbox`, icon: "📥", label: "اینباکس" },
          { path: `${prefix}/chat`, icon: "💬", label: "گفتگو با آژانس" },
          { path: `${prefix}/phonebook`, icon: "📇", label: "دفترچه تلفن" },
          { path: `${prefix}/tickets`, icon: "🎫", label: "پشتیبانی و تیکت‌ها" },
        ]
      },
      {
        type: "submenu",
        icon: "👤",
        label: "پروفایل",
        submenu: [
          { path: `${prefix}/profile`, icon: "📝", label: "اطلاعات کاربری" },
          { path: `${prefix}/bank-account`, icon: "🏦", label: "اطلاعات بانکی" },
          { path: `${prefix}/change-password`, icon: "🔒", label: "تغییر رمز عبور" },
          { path: `${prefix}/audit-logs`, icon: "📜", label: "مدیریت لاگ‌ها" },
        ]
      },
    ],
    ceo: [
      { path: `${prefix}/analytics`, icon: "📊", label: "تحلیل هوشمند" },
      { path: `${prefix}/reviews`, icon: "⭐", label: "نظرات مسافران" },
      { path: `${prefix}/discounts`, icon: "🎟️", label: "تخفیف‌ها" },
      { path: `${prefix}/verification`, icon: "✅", label: "احراز هویت" },
      {
        type: "submenu",
        icon: "💬",
        label: "ارتباطات",
        submenu: [
          { path: `${prefix}/inbox`, icon: "📥", label: "اینباکس" },
          { path: `${prefix}/chat`, icon: "💬", label: "گفتگو با مسافران" },
          { path: `${prefix}/phonebook`, icon: "📇", label: "دفترچه تلفن" },
          { path: `${prefix}/tickets`, icon: "🎫", label: "پشتیبانی و تیکت‌ها" },
        ]
      },
      ...(isVerified ? [
        {
          type: "submenu",
          icon: "🎫",
          label: "تورها",
          submenu: [
            { path: `${prefix}/tours`, icon: "🎫", label: "مدیریت تورها" },
            { path: `${prefix}/base-tours`, icon: "🚌", label: "تورهای پایه" },
            { path: `${prefix}/policies`, icon: "📋", label: "سیاست لغو" },
            { path: `${prefix}/seat-arrangements`, icon: "📐", label: "الگوهای چینش صندلی" },
            { path: `${prefix}/seats`, icon: "💺", label: "مدیریت صندلی‌ها" },
          ]
        },
        {
          type: "submenu",
          icon: "🏨",
          label: "منابع سفر",
          submenu: [
            { path: `${prefix}/hotels-management`, icon: "🏨", label: "مدیریت هتل‌ها" },
            { path: `${prefix}/foods-management`, icon: "🍽️", label: "مدیریت غذاها" },
            { path: `${prefix}/vehicles-management`, icon: "🚗", label: "مدیریت خودروها" },
            { path: `${prefix}/staff-management`, icon: "👥", label: "مدیریت کارمندان" },
            { path: `${prefix}/insurances-management`, icon: "🛡️", label: "مدیریت بیمه‌ها" },
          ]
        },
        {
          type: "submenu",
          icon: "🏪",
          label: "مدیریت ایستگاه",
          submenu: [
            { path: `${prefix}/geo`, icon: "🗺️", label: "استان‌ها و شهرها" },
            { path: `${prefix}/station-types`, icon: "📋", label: "نوع ایستگاه‌ها" },
            { path: `${prefix}/stations`, icon: "📍", label: "لیست ایستگاه‌ها" },
          ]
        },
        {
          type: "submenu",
          icon: "💳",
          label: "مالی و رزرو",
          submenu: [
            { path: `${prefix}/payment-approvals`, icon: "💳", label: "تأیید پرداخت‌ها" },
            { path: `${prefix}/cancel-requests`, icon: "📋", label: "درخواست‌های لغو" },
            { path: `${prefix}/settlement`, icon: "💸", label: "تسویه حساب" },
          ]
        },
        {
          type: "submenu",
          icon: "👤",
          label: "پروفایل",
          submenu: [
            { path: `${prefix}/profile`, icon: "📝", label: "اطلاعات کاربری" },
            { path: `${prefix}/bank-account`, icon: "🏦", label: "اطلاعات بانکی" },
            { path: `${prefix}/change-password`, icon: "🔒", label: "تغییر رمز عبور" },
            { path: `${prefix}/audit-logs`, icon: "📜", label: "مدیریت لاگ‌ها" },
          ]
        },
      ] : []),
    ],
    admin: [
      { path: `${prefix}/analytics`, icon: "📊", label: "تحلیل هوشمند" },
      {
        type: "submenu",
        icon: "👥",
        label: "کاربران و آژانس‌ها",
        submenu: [
          { path: `${prefix}/users`, icon: "👥", label: "مدیریت کاربران" },
          { path: `${prefix}/verifications`, icon: "✅", label: "درخواست‌های احراز هویت" },
          { path: `${prefix}/agencies-list`, icon: "🏛️", label: "لیست آژانس‌ها" },
        ]
      },
      {
        type: "submenu",
        icon: "🌍",
        label: "تورها و گزارشات",
        submenu: [
          { path: `${prefix}/all-tours`, icon: "🌍", label: "همه تورها" },
          { path: `${prefix}/reports-admin`, icon: "📈", label: "گزارشات کل" },
          { path: `${prefix}/reviews-monitor`, icon: "⭐", label: "نظرات کاربران" },
          { path: `${prefix}/discounts-monitor`, icon: "🎟️", label: "تخفیف‌ها" },
        ]
      },
      {
        type: "submenu",
        icon: "💬",
        label: "ارتباطات",
        submenu: [
          { path: `${prefix}/inbox-management`, icon: "📨", label: "اینباکس و پیام خصوصی" },
          { path: `${prefix}/chat-monitor`, icon: "🛡️", label: "مانیتورینگ چت" },
          { path: `${prefix}/phonebook-monitor`, icon: "📇", label: "مانیتورینگ دفترچه تلفن" },
          { path: `${prefix}/tickets`, icon: "🎫", label: "پشتیبانی و تیکت‌ها" },
        ]
      },
      {
        type: "submenu",
        icon: "💰",
        label: "مالی و تسویه",
        submenu: [
          { path: `${prefix}/finance-management/transactions`, icon: "💳", label: "تراکنش‌های کل" },
        ]
      },
      {
        type: "submenu",
        icon: "📢",
        label: "محتوای سیستم",
        submenu: [
          { path: `${prefix}/announcements`, icon: "📢", label: "اطلاعیه‌های سراسری" },
          { path: `${prefix}/landing`, icon: "🌐", label: "صفحه معرفی سیستم" },
        ]
      },
      { path: `${prefix}/settings-system`, icon: "🔧", label: "تنظیمات سیستم" },
      {
        type: "submenu",
        icon: "👤",
        label: "پروفایل",
        submenu: [
          { path: `${prefix}/profile`, icon: "📝", label: "اطلاعات کاربری" },
          { path: `${prefix}/change-password`, icon: "🔒", label: "تغییر رمز عبور" },
        ]
      },
    ],
  };

  let menuItems = [...commonItems];

  if (role === "user") {
    menuItems = [...menuItems, ...roleSpecificItems.user];
  } else if (role === "ceo") {
    menuItems = [...menuItems, ...roleSpecificItems.ceo];
  } else if (role === "admin") {
    menuItems = [...menuItems, ...roleSpecificItems.admin];
  }

  // برای حالت بسته سایدبار (فقط آیکون‌ها)
  if (!isOpen) {
    return (
      <aside className="dashboard-sidebar collapsed">
        <div className="sidebar-menu">
          {menuItems.map((item, index) => {
            if (item.type === "submenu") {
              return (
                <div key={index} className="sidebar-submenu-wrapper collapsed">
                  <div className="sidebar-item no-hover">
                    <span className="sidebar-icon">{item.icon}</span>
                  </div>
                </div>
              );
            }
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
                data-tooltip={item.label}
              >
                <span className="sidebar-icon">{item.icon}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    );
  }

  // حالت باز سایدبار
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item, index) => {
          if (item.type === "submenu") {
            const isSubmenuOpen = openSubmenu === item.label;
            return (
              <div key={index} className="sidebar-submenu-wrapper">
                <div
                  className={`sidebar-submenu-trigger ${isSubmenuOpen ? "active" : ""}`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                  <span className={`submenu-arrow ${isSubmenuOpen ? "open" : ""}`}>▼</span>
                </div>
                <div className={`sidebar-submenu ${isSubmenuOpen ? "open" : ""}`}>
                  {item.submenu.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      className={({ isActive }) => `sidebar-submenu-item ${isActive ? "active" : ""}`}
                    >
                      <span className="submenu-icon">{subItem.icon}</span>
                      <span className="submenu-label">{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
              data-tooltip={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default DashboardSidebar;