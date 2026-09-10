import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaSyncAlt,
  FaPlus,
} from "react-icons/fa";
import { adminFinanceApi } from "../../Services/financeApi";
import {
  AgencyRevenue,
  CommissionConfig,
  FinanceSummary,
  FinanceTransaction,
  SettlementRequest,
  SETTLEMENT_STATUS_META,
} from "../../Types/finance";
import "./FinanceManagement.css";

type FinanceTab = "transactions" | "agencies" | "settlements" | "commissions";

interface FinanceManagementProps {
  initialTab?: FinanceTab;
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat("fa-IR").format(v) + " تومان";

const formatNum = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fa-IR") : "—";

const FinanceManagement: React.FC<FinanceManagementProps> = ({ initialTab = "transactions" }) => {
  const { tab } = useParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<FinanceTab>(
    (tab as FinanceTab) || initialTab
  );
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [agencyRevenue, setAgencyRevenue] = useState<AgencyRevenue[]>([]);
  const [settlements, setSettlements] = useState<SettlementRequest[]>([]);
  const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // جستجو و فیلتر
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // مودال رد تسویه
  const [rejectTarget, setRejectTarget] = useState<SettlementRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // فرم کمیسیون
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [commissionAgencyId, setCommissionAgencyId] = useState<number | null>(null);
  const [commissionPercent, setCommissionPercent] = useState(10);

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sumRes, txRes, agRes, stRes, cmRes] = await Promise.all([
        adminFinanceApi.getSummary(),
        adminFinanceApi.getTransactions(),
        adminFinanceApi.getAgencyRevenue(),
        adminFinanceApi.getSettlementRequests(),
        adminFinanceApi.getCommissions(),
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (txRes.success) setTransactions(txRes.data || []);
      if (agRes.success) setAgencyRevenue(agRes.data || []);
      if (stRes.success) setSettlements(stRes.data || []);
      if (cmRes.success) setCommissions(cmRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات مالی");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ============ تسویه ============
  const handleApproveSettlement = async (s: SettlementRequest) => {
    setActionLoading(true);
    try {
      const res = await adminFinanceApi.approveSettlement(s.id);
      if (res.success) {
        showNotice("✓ تسویه تأیید شد");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در تأیید تسویه");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSettlement = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await adminFinanceApi.rejectSettlement(rejectTarget.id, rejectReason);
      if (res.success) {
        showNotice("✓ تسویه رد شد");
        setRejectTarget(null);
        setRejectReason("");
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در رد تسویه");
    } finally {
      setActionLoading(false);
    }
  };

  // ============ کمیسیون ============
  const handleSaveCommission = async () => {
    if (!commissionAgencyId) return;
    setActionLoading(true);
    try {
      const res = await adminFinanceApi.upsertCommission(commissionAgencyId, commissionPercent);
      if (res.success) {
        showNotice("✓ کمیسیون آژانس تنظیم شد");
        setShowCommissionForm(false);
        setCommissionAgencyId(null);
        setCommissionPercent(10);
        fetchAll();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در تنظیم کمیسیون");
    } finally {
      setActionLoading(false);
    }
  };

  const commissionMap = new Map(commissions.map((c) => [c.agencyId, c]));

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (t.userUsername || "").toLowerCase().includes(q) ||
      (t.tourName || "").toLowerCase().includes(q) ||
      (t.tourCode || "").toLowerCase().includes(q) ||
      (t.agencyUsername || "").toLowerCase().includes(q) ||
      (t.sourceCardNumber || "").includes(q)
    );
  });

  const filteredAgencies = agencyRevenue.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.agencyName.toLowerCase().includes(q) ||
      a.agencyUsername.toLowerCase().includes(q)
    );
  });

  const filteredSettlements = settlements.filter((s) => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.agencyName.toLowerCase().includes(q) ||
      s.agencyUsername.toLowerCase().includes(q)
    );
  });

  const statusOptions = ["PENDING", "APPROVED", "REJECTED"];

  if (loading) {
    return (
      <div className="fin-loading">
        <div className="fin-spinner" />
        <p>در حال بارگذاری اطلاعات مالی...</p>
      </div>
    );
  }

  return (
    <div className="fin-container">
      {notice && <div className="fin-notice">{notice}</div>}
      {error && <div className="fin-error">{error}</div>}

      <div className="fin-header">
        <div>
          <h1>💰 مدیریت مالی پلتفرم</h1>
          <p>تراکنشها، درآمد آژانسها، تسویه حساب و کمیسیونها</p>
        </div>
        <button className="fin-refresh" onClick={fetchAll}>
          <FaSyncAlt /> بروزرسانی
        </button>
      </div>

      {/* خلاصه مالی */}
      {summary && (
        <div className="fin-summary-grid">
          <div className="fin-summary-card">
            <span className="fin-summary-icon blue">💳</span>
            <div>
              <strong>{formatNum(summary.totalTransactions)}</strong>
              <span>کل تراکنشها</span>
            </div>
          </div>
          <div className="fin-summary-card">
            <span className="fin-summary-icon green">💰</span>
            <div>
              <strong>{formatPrice(summary.totalAmount)}</strong>
              <span>مجموع درآمد پلتفرم</span>
            </div>
          </div>
          <div className="fin-summary-card">
            <span className="fin-summary-icon purple">📈</span>
            <div>
              <strong>{formatPrice(summary.totalCommission)}</strong>
              <span>مجموع کمیسیون پلتفرم</span>
            </div>
          </div>
          <div className="fin-summary-card">
            <span className="fin-summary-icon amber">⏳</span>
            <div>
              <strong>{formatNum(summary.pendingSettlements)}</strong>
              <span>تسویه در انتظار بررسی</span>
            </div>
          </div>
        </div>
      )}

      {/* تبها */}
      <div className="fin-tabs">
        <button
          className={`fin-tab ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          💰 تراکنشهای کل
        </button>
        <button
          className={`fin-tab ${activeTab === "agencies" ? "active" : ""}`}
          onClick={() => setActiveTab("agencies")}
        >
          📊 درآمد آژانسها
        </button>
        <button
          className={`fin-tab ${activeTab === "settlements" ? "active" : ""}`}
          onClick={() => setActiveTab("settlements")}
        >
          💳 درخواستهای تسویه
        </button>
        <button
          className={`fin-tab ${activeTab === "commissions" ? "active" : ""}`}
          onClick={() => setActiveTab("commissions")}
        >
          🔖 مدیریت کمیسیونها
        </button>
      </div>

      {/* تولبار جستجو */}
      {(activeTab === "transactions" || activeTab === "agencies" || activeTab === "settlements") && (
        <div className="fin-toolbar">
          <div className="fin-search">
            <FaSearch className="fin-search-icon" />
            <input
              type="text"
              placeholder={
                activeTab === "transactions"
                  ? "جستجوی کاربر، تور، آژانس یا شماره کارت..."
                  : activeTab === "agencies"
                  ? "جستجوی آژانس..."
                  : "جستجوی آژانس..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab !== "agencies" && (
            <select
              className="fin-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">همه وضعیتها</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {SETTLEMENT_STATUS_META[s].label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ============ تب ۱: تراکنشها ============ */}
      {activeTab === "transactions" && (
        <div className="fin-table-card">
          {filteredTransactions.length === 0 ? (
            <div className="fin-empty">تراکنشی یافت نشد</div>
          ) : (
            <div className="fin-table-wrap">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>کاربر</th>
                    <th>تور</th>
                    <th>آژانس</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                    <th>کارت مبدأ</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.reservationId}>
                      <td>
                        <strong>{t.userUsername}</strong>
                        <br />
                        <small className="fin-sub">{t.userMobile}</small>
                      </td>
                      <td>
                        {t.tourName}
                        <br />
                        <small className="fin-sub">{t.tourCode}</small>
                      </td>
                      <td>{t.agencyUsername}</td>
                      <td className="fin-amount">{formatPrice(t.amount)}</td>
                      <td>
                        <span
                          className="fin-status"
                          style={{
                            background: `${t.status === "CONFIRMED" ? "#16a34a" : "#94a3b8"}22`,
                            color: t.status === "CONFIRMED" ? "#16a34a" : "#64748b",
                          }}
                        >
                          {t.statusPersian}
                        </span>
                      </td>
                      <td dir="ltr">{t.sourceCardNumber}</td>
                      <td className="fin-sub">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============ تب ۲: درآمد آژانسها ============ */}
      {activeTab === "agencies" && (
        <div className="fin-table-card">
          {filteredAgencies.length === 0 ? (
            <div className="fin-empty">آژانسی یافت نشد</div>
          ) : (
            <div className="fin-table-wrap">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>آژانس</th>
                    <th>درآمد کل</th>
                    <th>رزرو / مسافر</th>
                    <th>کمیسیون</th>
                    <th>مبلغ کمیسیون</th>
                    <th>خالص آژانس</th>
                    <th>تسویه شده</th>
                    <th>قابل تسویه</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.map((a) => (
                    <tr key={a.agencyId}>
                      <td>
                        <strong>{a.agencyName}</strong>
                        <br />
                        <small className="fin-sub">{a.agencyUsername}</small>
                      </td>
                      <td className="fin-amount">{formatPrice(a.totalRevenue)}</td>
                      <td className="fin-sub">
                        {formatNum(a.totalReservations)} رزرو — {formatNum(a.totalPassengers)} مسافر
                      </td>
                      <td>
                        <span className="fin-commission-badge">٪{a.commissionPercent}</span>
                      </td>
                      <td>{formatPrice(a.commissionAmount)}</td>
                      <td className="fin-amount">{formatPrice(a.netAmount)}</td>
                      <td>{formatPrice(a.settledAmount)}</td>
                      <td>
                        <strong style={{ color: a.availableAmount > 0 ? "#16a34a" : "#94a3b8" }}>
                          {formatPrice(a.availableAmount)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============ تب ۳: تسویهها ============ */}
      {activeTab === "settlements" && (
        <div className="fin-table-card">
          {filteredSettlements.length === 0 ? (
            <div className="fin-empty">درخواست تسویهای وجود ندارد</div>
          ) : (
            <div className="fin-table-wrap">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>آژانس</th>
                    <th>مبلغ درخواستی</th>
                    <th>کمیسیون</th>
                    <th>خالص پرداختی</th>
                    <th>وضعیت</th>
                    <th>تاریخ درخواست</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSettlements.map((s) => {
                    const meta = SETTLEMENT_STATUS_META[s.status] || SETTLEMENT_STATUS_META.PENDING;
                    return (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.agencyName}</strong>
                          <br />
                          <small className="fin-sub">{s.agencyUsername}</small>
                        </td>
                        <td className="fin-amount">{formatPrice(s.requestedAmount)}</td>
                        <td className="fin-sub">
                          ٪{s.commissionPercent} ({formatPrice(s.commissionAmount)})
                        </td>
                        <td className="fin-amount">{formatPrice(s.netAmount)}</td>
                        <td>
                          <span className="fin-status" style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                          {s.rejectionReason && (
                            <>
                              <br />
                              <small className="fin-sub" style={{ color: "#dc2626" }}>
                                دلیل: {s.rejectionReason}
                              </small>
                            </>
                          )}
                        </td>
                        <td className="fin-sub">{formatDate(s.requestedAt)}</td>
                        <td>
                          {s.status === "PENDING" ? (
                            <div className="fin-actions">
                              <button
                                className="fin-btn-approve"
                                disabled={actionLoading}
                                onClick={() => handleApproveSettlement(s)}
                              >
                                <FaCheckCircle /> تأیید
                              </button>
                              <button
                                className="fin-btn-reject"
                                disabled={actionLoading}
                                onClick={() => {
                                  setRejectTarget(s);
                                  setRejectReason("");
                                }}
                              >
                                <FaTimesCircle /> رد
                              </button>
                            </div>
                          ) : (
                            <span className="fin-sub">{s.processedBy || "—"}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============ تب ۴: کمیسیونها ============ */}
      {activeTab === "commissions" && (
        <div className="fin-commission-section">
          <div className="fin-commission-header">
            <div>
              <h3>🔖 کمیسیون آژانسها</h3>
              <p>درصد کمیسیون پلتفرم را برای هر آژانس تنظیم کنید (پیشفرض ۱۰٪)</p>
            </div>
            <button className="fin-btn-add" onClick={() => setShowCommissionForm(!showCommissionForm)}>
              <FaPlus /> {showCommissionForm ? "بستن فرم" : "تنظیم کمیسیون"}
            </button>
          </div>

          {showCommissionForm && (
            <div className="fin-commission-form">
              <div className="fin-form-group">
                <label>آژانس *</label>
                <select
                  value={commissionAgencyId === null ? "" : String(commissionAgencyId)}
                  onChange={(e) => setCommissionAgencyId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">انتخاب آژانس...</option>
                  {agencyRevenue.map((a) => (
                    <option key={a.agencyId} value={a.agencyId}>
                      {a.agencyName} ({a.agencyUsername})
                    </option>
                  ))}
                </select>
              </div>
              <div className="fin-form-group">
                <label>درصد کمیسیون (۰ تا ۱۰۰) *</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  dir="ltr"
                />
              </div>
              <button
                className="fin-btn-save"
                disabled={actionLoading || commissionAgencyId === null}
                onClick={handleSaveCommission}
              >
                ذخیره کمیسیون
              </button>
            </div>
          )}

          <div className="fin-table-card">
            {commissions.length === 0 ? (
              <div className="fin-empty">
                هنوز کمیسیون خاصی تنظیم نشده — همه آژانسها از پیشفرض ۱۰٪ استفاده میکنند
              </div>
            ) : (
              <div className="fin-table-wrap">
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th>آژانس</th>
                      <th>درصد کمیسیون</th>
                      <th>تنظیم توسط</th>
                      <th>آخرین بروزرسانی</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.agencyName}</strong>
                          <br />
                          <small className="fin-sub">{c.agencyUsername}</small>
                        </td>
                        <td>
                          <span className="fin-commission-badge">٪{c.commissionPercent}</span>
                        </td>
                        <td>{c.updatedBy || "—"}</td>
                        <td className="fin-sub">{formatDate(c.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* پیشنمایش کمیسیون فعلی در گزارش درآمد */}
          <div className="fin-commission-preview">
            <h4>💡 پیشنمایش تأثیر کمیسیون</h4>
            <div className="fin-table-wrap">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>آژانس</th>
                    <th>درآمد</th>
                    <th>کمیسیون فعلی</th>
                    <th>خالص آژانس</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.slice(0, 10).map((a) => (
                    <tr key={a.agencyId}>
                      <td>{a.agencyName}</td>
                      <td>{formatPrice(a.totalRevenue)}</td>
                      <td>
                        <span className="fin-commission-badge">٪{commissionMap.get(a.agencyId)?.commissionPercent ?? 10}</span>
                      </td>
                      <td className="fin-amount">{formatPrice(a.netAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* مودال رد تسویه */}
      {rejectTarget && (
        <div className="fin-modal-overlay" onClick={() => setRejectTarget(null)}>
          <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fin-modal-header">
              <h3>رد درخواست تسویه</h3>
              <button className="fin-modal-close" onClick={() => setRejectTarget(null)}>✕</button>
            </div>
            <div className="fin-modal-body">
              <p style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>
                آژانس: <strong>{rejectTarget.agencyName}</strong> — مبلغ:{" "}
                <strong>{formatPrice(rejectTarget.requestedAmount)}</strong>
              </p>
              <label className="fin-form-label">دلیل رد *</label>
              <textarea
                className="fin-textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="دلیل رد تسویه..."
              />
            </div>
            <div className="fin-modal-actions">
              <button className="fin-btn-cancel" onClick={() => setRejectTarget(null)}>
                انصراف
              </button>
              <button
                className="fin-btn-reject"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={handleRejectSettlement}
              >
                <FaTimesCircle /> رد تسویه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;
