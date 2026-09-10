import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaEye, FaSearch } from "react-icons/fa";
import { CeoVerification } from "../../Types/admin";
import { adminVerificationApi } from "../../services/adminApi";
import VerificationDetailModal from "../admin/VerificationDetailModal";
import RejectModal from "../admin/RejectModal";

interface VerificationsListProps {
  onStatsChange?: () => void;
}

const VerificationsList: React.FC<VerificationsListProps> = ({ onStatsChange }) => {
  const [verifications, setVerifications] = useState<CeoVerification[]>([]);
  const [filteredList, setFilteredList] = useState<CeoVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVerification, setSelectedVerification] = useState<CeoVerification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, [activeTab]);

  useEffect(() => {
    filterVerifications();
  }, [searchTerm, verifications]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const data = activeTab === "pending"
        ? await adminVerificationApi.getPendingVerifications()
        : await adminVerificationApi.getAllVerifications();
      setVerifications(data);
      setFilteredList(data);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست درخواست‌ها" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const filterVerifications = () => {
    if (!searchTerm) {
      setFilteredList(verifications);
      return;
    }

    const filtered = verifications.filter(
      (v) =>
        v.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ceoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(filtered);
  };

  const handleApprove = async (id: number) => {
    try {
      await adminVerificationApi.approveVerification(id);
      setMessage({ type: "success", text: "درخواست با موفقیت تایید شد" });
      setTimeout(() => setMessage(null), 3000);
      fetchVerifications();
      if (onStatsChange) onStatsChange();
    } catch (error) {
      console.error("Error approving:", error);
      setMessage({ type: "error", text: "خطا در تایید درخواست" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      await adminVerificationApi.rejectVerification(id, reason);
      setMessage({ type: "success", text: "درخواست با موفقیت رد شد" });
      setTimeout(() => setMessage(null), 3000);
      setShowRejectModal(false);
      fetchVerifications();
      if (onStatsChange) onStatsChange();
    } catch (error) {
      console.error("Error rejecting:", error);
      setMessage({ type: "error", text: "خطا در رد درخواست" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleViewDetail = (verification: CeoVerification) => {
    setSelectedVerification(verification);
    setShowDetailModal(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "VERIFIED":
        return "status-verified";
      case "REJECTED":
        return "status-rejected";
      default:
        return "status-not-verified";
    }
  };

  const getStatusPersian = (status: string) => {
    switch (status) {
      case "PENDING":
        return "در انتظار بررسی";
      case "VERIFIED":
        return "تایید شده";
      case "REJECTED":
        return "رد شده";
      default:
        return "احراز نشده";
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="verifications-list-container">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="verifications-tabs">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          در انتظار بررسی
          <span className="tab-count">{verifications.filter(v => v.status === "PENDING").length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          همه درخواست‌ها
        </button>
      </div>

      <div className="search-box verifications-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام آژانس، نام کاربری، مدیرعامل یا ایمیل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="verifications-table-wrapper">
        <table className="verifications-table">
          <thead>
            <tr>
              <th>نام آژانس</th>
              <th>نام کاربری</th>
              <th>مدیرعامل</th>
              <th>ایمیل</th>
              <th>تاریخ ارسال</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((v) => (
              <tr key={v.id}>
                <td>{v.agencyName}</td>
                <td>{v.username}</td>
                <td>{v.ceoName}</td>
                <td>{v.companyEmail}</td>
                <td>{new Date(v.submittedAt).toLocaleDateString("fa-IR")}</td>
                <td>
                  <span className={`status-badge-verification ${getStatusBadgeClass(v.status)}`}>
                    {getStatusPersian(v.status)}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewDetail(v)}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  {v.status === "PENDING" && (
                    <>
                      <button
                        className="action-btn approve"
                        onClick={() => handleApprove(v.id)}
                        title="تایید"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => {
                          setSelectedVerification(v);
                          setShowRejectModal(true);
                        }}
                        title="رد"
                      >
                        <FaTimesCircle />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredList.length === 0 && (
          <div className="empty-state">
            <p>هیچ درخواستی یافت نشد</p>
          </div>
        )}
      </div>

      {showDetailModal && selectedVerification && (
        <VerificationDetailModal
          verification={selectedVerification}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showRejectModal && selectedVerification && (
        <RejectModal
          verification={selectedVerification}
          onConfirm={handleReject}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
};

export default VerificationsList;