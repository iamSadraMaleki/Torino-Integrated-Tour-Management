import React, { useCallback, useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaWallet,
  FaHandHoldingUsd,
  FaSyncAlt,
  FaPlus,
  FaHistory,
} from "react-icons/fa";
import { ceoFinanceApi } from "../../../Services/financeApi";
import {
  CeoSettlementSummary,
  SettlementRequest,
  SETTLEMENT_STATUS_META,
} from "../../../Types/finance";
import "./CeoSettlement.css";

const formatPrice = (v: number) =>
  new Intl.NumberFormat("fa-IR").format(v) + " تومان";

const formatNum = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fa-IR") : "—";

const CeoSettlement: React.FC = () => {
  const [summary, setSummary] = useState<CeoSettlementSummary | null>(null);
  const [requests, setRequests] = useState<SettlementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // فرم درخواست
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sumRes, reqRes] = await Promise.all([
        ceoFinanceApi.getSummary(),
        ceoFinanceApi.getMyRequests(),
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (reqRes.success) setRequests(reqRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات تسویه حساب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setError("مبلغ معتبر وارد کنید");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      const res = await ceoFinanceApi.createSettlementRequest(num);
      if (res.success) {
        showNotice("✓ درخواست تسویه ثبت شد");
        setShowForm(false);
        setAmount("");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ثبت درخواست تسویه");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cs-loading">
        <div className="cs-spinner" />
        <p>در حال بارگذاری تسویه حساب...</p>
      </div>
    );
  }

  return (
    <div className="cs-container">
      {notice && <div className="cs-notice">{notice}</div>}
      {error && <div className="cs-error">{error}</div>}

      <div className="cs-header">
        <div>
          <h1>💳 تسویه حساب آژانس</h1>
          <p>موجودی، درخواست تسویه و تاریخچه پرداخت‌ها</p>
        </div>
        <div className="cs-header-actions">
          <button className="cs-refresh" onClick={fetchAll}>
            <FaSyncAlt /> بروزرسانی
          </button>
          <button
            className="cs-btn-request"
            onClick={() => setShowForm(!showForm)}
          >
            <FaPlus /> {showForm ? "بستن فرم" : "درخواست تسویه"}
          </button>
        </div>
      </div>

      {/* فرم درخواست */}
      {showForm && (
        <div className="cs-form-card">
          <div className="cs-form-title">
            <FaHandHoldingUsd /> ثبت درخواست تسویه
          </div>
          <div className="cs-form-body">
            <div className="cs-form-group">
              <label>مبلغ درخواستی (تومان) *</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثلاً 50000000"
                dir="ltr"
              />
            </div>
            {summary && (
              <div className="cs-form-hint">
                حداکثر قابل تسویه: <strong>{formatPrice(summary.availableAmount)}</strong>
              </div>
            )}
            <button
              className="cs-btn-submit"
              disabled={actionLoading}
              onClick={handleCreate}
            >
              ثبت درخواست
            </button>
          </div>
        </div>
      )}

      {/* کارت‌های موجودی */}
      {summary && (
        <div className="cs-summary-grid">
          <div className="cs-summary-card">
            <span className="cs-summary-icon blue">💰</span>
            <div>
              <strong>{formatPrice(summary.totalRevenue)}</strong>
              <span>درآمد کل</span>
            </div>
          </div>
          <div className="cs-summary-card">
            <span className="cs-summary-icon purple">📈</span>
            <div>
              <strong>٪{summary.commissionPercent}</strong>
              <span>کمیسیون پلتفرم ({formatPrice(summary.commissionAmount)})</span>
            </div>
          </div>
          <div className="cs-summary-card">
            <span className="cs-summary-icon green">💵</span>
            <div>
              <strong>{formatPrice(summary.netAmount)}</strong>
              <span>خالص درآمد</span>
            </div>
          </div>
          <div className="cs-summary-card">
            <span className="cs-summary-icon amber">🏦</span>
            <div>
              <strong>{formatPrice(summary.settledAmount)}</strong>
              <span>تسویه شده</span>
            </div>
          </div>
          <div className="cs-summary-card highlight">
            <span className="cs-summary-icon teal">💳</span>
            <div>
              <strong>{formatPrice(summary.availableAmount)}</strong>
              <span>قابل تسویه</span>
            </div>
          </div>
          <div className="cs-summary-card">
            <span className="cs-summary-icon gray">⏳</span>
            <div>
              <strong>{formatNum(summary.pendingRequests)}</strong>
              <span>درخواست در انتظار</span>
            </div>
          </div>
        </div>
      )}

      {/* تاریخچه */}
      <div className="cs-history-card">
        <div className="cs-history-header">
          <h3>
            <FaHistory /> تاریخچه درخواست‌های تسویه
          </h3>
        </div>
        {requests.length === 0 ? (
          <div className="cs-empty">
            <FaWallet className="cs-empty-icon" />
            <p>هنوز درخواست تسویه‌ای ثبت نکرده‌اید</p>
          </div>
        ) : (
          <div className="cs-table-wrap">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>مبلغ درخواستی</th>
                  <th>کمیسیون</th>
                  <th>خالص دریافتی</th>
                  <th>وضعیت</th>
                  <th>تاریخ درخواست</th>
                  <th>تاریخ بررسی</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const meta = SETTLEMENT_STATUS_META[r.status] || SETTLEMENT_STATUS_META.PENDING;
                  return (
                    <tr key={r.id}>
                      <td className="cs-amount">{formatPrice(r.requestedAmount)}</td>
                      <td className="cs-sub">
                        ٪{r.commissionPercent} ({formatPrice(r.commissionAmount)})
                      </td>
                      <td className="cs-amount">{formatPrice(r.netAmount)}</td>
                      <td>
                        <span className="cs-status" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        {r.rejectionReason && (
                          <>
                            <br />
                            <small className="cs-sub" style={{ color: "#dc2626" }}>
                              دلیل: {r.rejectionReason}
                            </small>
                          </>
                        )}
                      </td>
                      <td className="cs-sub">{formatDate(r.requestedAt)}</td>
                      <td className="cs-sub">{formatDate(r.processedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CeoSettlement;
