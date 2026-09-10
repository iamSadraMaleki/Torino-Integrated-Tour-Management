import React, { useEffect, useState } from "react";
import { Ticket } from "../../../Types/reservation";
import { reservationApi } from "../../../Services/reservationApi";
import "./TicketModal.css";

interface TicketModalProps {
  isOpen: boolean;
  reservationId: number;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fa-IR") : "-";

/** ساخت نوارهای بارکد از روی کد بلیط — هر کاراکتر یک نوار با عرض متفاوت */
const buildBarcode = (code: string): number[] => {
  const chars = code.split("");
  const widths: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const n = chars[i].charCodeAt(0) % 5;
    widths.push(n + 1, (chars[i].charCodeAt(0) >> 3) % 4 + 1);
  }
  return widths;
};

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, reservationId, onClose }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !reservationId) return;
    setLoading(true);
    setError("");
    setTicket(null);
    reservationApi
      .getTicket(reservationId)
      .then((res) => {
        if (res.success) setTicket(res.data);
        else setError(res.message || "خطا در دریافت بلیط");
      })
      .catch((err: any) =>
        setError(err.response?.data?.message || "خطا در دریافت بلیط")
      )
      .finally(() => setLoading(false));
  }, [isOpen, reservationId]);

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  // نام خریدار — از customerName بک‌اند، در غیر این صورت از اولین مسافر لیست
  const customerName =
    (ticket?.customerName || "").trim() ||
    (ticket?.passengers && ticket.passengers.length > 0
      ? `${ticket.passengers[0].firstName || ""} ${ticket.passengers[0].lastName || ""}`.trim()
      : "") ||
    "—";

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal-inner" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>در حال صدور بلیط...</p>
          </div>
        ) : error ? (
          <div className="ticket-error">
            <div className="ticket-error-icon">🎫</div>
            <p>{error}</p>
            <button className="btn-secondary" onClick={onClose}>
              بستن
            </button>
          </div>
        ) : ticket ? (
          <div className="ticket-wrap">
            {/* ===== بلیط ===== */}
            <div className="ticket">
              {/* سوراخ‌های پانچ کناره */}
              <div className="ticket-notch ticket-notch-top" />
              <div className="ticket-notch ticket-notch-bottom" />

              {/* هدر بلیط */}
              <div className="ticket-header">
                <div className="ticket-header-right">
                  <span className="ticket-brand">تورینو</span>
                  <span className="ticket-label">بلیط سفر</span>
                </div>
                <div className="ticket-header-left">
                  <div className="ticket-code" dir="ltr">
                    {ticket.tourCode}
                  </div>
                  <div className="ticket-tour-name">{ticket.tourName}</div>
                </div>
              </div>

              {/* مسیر */}
              <div className="ticket-route">
                <div className="ticket-city">
                  <span className="ticket-city-name">{ticket.originCity || "—"}</span>
                  <span className="ticket-city-label">مبدأ</span>
                </div>
                <div className="ticket-route-line">
                  <span className="ticket-vehicle-icon">🚌</span>
                  <div className="ticket-route-arrow">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="ticket-city">
                  <span className="ticket-city-name">{ticket.destinationCity || "—"}</span>
                  <span className="ticket-city-label">مقصد</span>
                </div>
              </div>

              {/* خریدار بلیط */}
              <div className="ticket-customer">
                <div className="ticket-customer-right">
                  <span className="ticket-customer-icon">🧑</span>
                  <div className="ticket-customer-info">
                    <span className="ticket-customer-label">مسافر / خریدار</span>
                    <span className="ticket-customer-name">{customerName}</span>
                  </div>
                </div>
                {ticket.customerMobile && (
                  <div className="ticket-customer-mobile" dir="ltr">
                    📱 {ticket.customerMobile}
                  </div>
                )}
              </div>

              {/* اطلاعات سفر */}
              <div className="ticket-info-grid">
                <div className="ticket-info-item">
                  <span className="ticket-info-label">تاریخ حرکت</span>
                  <span className="ticket-info-value">{formatDate(ticket.departureDate)}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-info-label">تاریخ بازگشت</span>
                  <span className="ticket-info-value">{formatDate(ticket.returnDate)}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-info-label">آژانس</span>
                  <span className="ticket-info-value" dir="ltr">
                    {ticket.agencyName}
                  </span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-info-label">تعداد مسافران</span>
                  <span className="ticket-info-value">{ticket.passengerCount} نفر</span>
                </div>
              </div>

              {/* مسافران + صندلی */}
              <div className="ticket-passengers">
                <div className="ticket-section-title">👥 مسافران و صندلی‌ها</div>
                <div className="ticket-passenger-head">
                  <span>نام و نام خانوادگی</span>
                  <span>کد ملی</span>
                  <span>صندلی</span>
                </div>
                {ticket.passengers.map((p, i) => (
                  <div className="ticket-passenger-row" key={i}>
                    <span className="ticket-p-name">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="ticket-p-nid" dir="ltr">
                      {p.nationalCode}
                    </span>
                    <span className="ticket-p-seat">
                      <span className="ticket-seat-badge">{p.seatNumber || "—"}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* خط جداکننده سوراخ‌دار */}
              <div className="ticket-divider">
                <span className="ticket-divider-hole" />
                <span className="ticket-divider-hole" />
                <span className="ticket-divider-hole" />
                <span className="ticket-divider-hole" />
              </div>

              {/* مبلغ + شماره بلیط */}
              <div className="ticket-footer">
                <div className="ticket-price">
                  <span className="ticket-price-label">مبلغ کل</span>
                  <span className="ticket-price-value">{formatPrice(ticket.totalPrice)}</span>
                </div>
                <div className="ticket-meta">
                  <div className="ticket-res-id">
                    شماره بلیط: <b dir="ltr">#{ticket.reservationId}</b>
                  </div>
                  <div className="ticket-status">✓ {ticket.statusPersian}</div>
                </div>
              </div>

              {/* بارکد */}
              <div className="ticket-barcode-section">
                <div className="ticket-barcode" dir="ltr">
                  {buildBarcode(`TOR-${ticket.tourCode}-${ticket.reservationId}`).map(
                    (w, i) => (
                      <span key={i} style={{ width: `${w}px` }} />
                    )
                  )}
                </div>
                <div className="ticket-barcode-text" dir="ltr">
                  TOR-{ticket.tourCode}-{ticket.reservationId}
                </div>
              </div>
            </div>

            {/* دکمه‌ها */}
            <div className="ticket-actions no-print">
              <button className="btn-secondary" onClick={onClose}>
                بستن
              </button>
              <button className="btn-primary" onClick={handlePrint}>
                🖨️ چاپ بلیط
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TicketModal;
