import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaCalendarAlt, FaSyncAlt } from "react-icons/fa";
import { tourApi, getBaseToursForSelect, tourStatusApi } from "../../../Services/tourApi";
import { Tour, TourDetails, BaseTourReference, TourStatus, TourStatusPersian, TourStatusColors, TourStatusBgColors } from "../../../Types/tour";
import TourForm from "./TourForm";
import TourDetailsModal from "./TourDetailsModal";
import ConfirmModal from "../profile/ConfirmModal";
import TourStatusBadge from "./TourStatusBadge";
import "./ToursManagement.css";

const ToursManagement: React.FC = () => {
  // ========== State Definitions ==========
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [baseTours, setBaseTours] = useState<BaseTourReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TourStatus | null>(null);
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [selectedTour, setSelectedTour] = useState<TourDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusTour, setSelectedStatusTour] = useState<Tour | null>(null);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  
  // UI states
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ========== Effects ==========
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterTours();
  }, [searchTerm, tours]);

  // ========== Data Fetching ==========
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [toursRes, baseToursRes] = await Promise.all([
        tourApi.getMyTours(),
        getBaseToursForSelect(),
      ]);
      if (toursRes.success) {
        setTours(toursRes.data);
        setFilteredTours(toursRes.data);
      }
      setBaseTours(baseToursRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      showMessage("error", "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const fetchToursByStatus = async (status: TourStatus | null) => {
    setLoading(true);
    try {
      if (status) {
        const response = await tourStatusApi.getMyToursByStatus(status);
        if (response.success) {
          setTours(response.data);
          setFilteredTours(response.data);
        }
      } else {
        const response = await tourApi.getMyTours();
        if (response.success) {
          setTours(response.data);
          setFilteredTours(response.data);
        }
      }
    } catch (error) {
      console.error("Error filtering tours:", error);
      showMessage("error", "خطا در فیلتر تورها");
    } finally {
      setLoading(false);
    }
  };

  // ========== Helper Functions ==========
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filterTours = () => {
    if (!searchTerm) {
      setFilteredTours(tours);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    setFilteredTours(
      tours.filter(
        (t) =>
          t.baseTourName.toLowerCase().includes(lowerSearch) ||
          t.baseTourCode.toLowerCase().includes(lowerSearch)
      )
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  // ========== CRUD Operations ==========
  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await tourApi.createTour(data);
      if (response.success) {
        showMessage("success", response.message);
        await fetchAllData();
        setShowForm(false);
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در ثبت تور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingTour) return;
    setIsSubmitting(true);
    try {
      const response = await tourApi.updateTour(editingTour.id, data);
      if (response.success) {
        showMessage("success", response.message);
        await fetchAllData();
        setShowForm(false);
        setEditingTour(null);
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در ویرایش تور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const response = await tourApi.deleteTour(deletingId);
      if (response.success) {
        showMessage("success", response.message);
        await fetchAllData();
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در حذف تور");
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  // ========== Status Operations ==========
  const handleChangeStatus = async (tourId: number, status: TourStatus) => {
    setStatusLoading(tourId);
    try {
      const response = await tourStatusApi.changeStatus(tourId, status);
      if (response.success) {
        showMessage("success", `وضعیت تور به ${TourStatusPersian[status]} تغییر یافت`);
        await fetchAllData();
        // اگر فیلتر وضعیت فعال است، دوباره فیلتر را اعمال کن
        if (filterStatus) {
          await fetchToursByStatus(filterStatus);
        }
      }
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "خطا در تغییر وضعیت");
    } finally {
      setStatusLoading(null);
      setShowStatusModal(false);
      setSelectedStatusTour(null);
    }
  };

  const handleStatusFilter = async (status: TourStatus | null) => {
    setFilterStatus(status);
    if (status) {
      await fetchToursByStatus(status);
    } else {
      await fetchAllData();
    }
  };

  const handleViewDetails = async (tourId: number) => {
    try {
      const response = await tourApi.getTourDetails(tourId);
      if (response.success) {
        setSelectedTour(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
      showMessage("error", "خطا در دریافت جزئیات تور");
    }
  };

  // ========== Status Change Modal Component ==========
  const StatusChangeModal = () => {
    if (!selectedStatusTour) return null;

    const statusOptions = [
      { value: TourStatus.ACTIVE, label: "فعال", icon: "✅", color: "#22c55e", bg: "#dcfce7" },
      { value: TourStatus.SUSPENDED, label: "تعلیق", icon: "⏸️", color: "#f59e0b", bg: "#fef3c7" },
    ];

    const canActivate = selectedStatusTour.status !== TourStatus.EXPIRED && 
                        selectedStatusTour.status !== TourStatus.SOLD_OUT;

    return (
      <div className="tour-modal-overlay" onClick={() => setShowStatusModal(false)}>
        <div className="tour-modal tour-modal-small" onClick={(e) => e.stopPropagation()}>
          <div className="tour-modal-header">
            <h3>تغییر وضعیت تور</h3>
            <button className="tour-modal-close" onClick={() => setShowStatusModal(false)}>✕</button>
          </div>
          <div className="tour-modal-body">
            <p style={{ marginBottom: "1rem" }}>
              <strong>{selectedStatusTour.baseTourName}</strong>
              <br />
              وضعیت فعلی: <TourStatusBadge status={selectedStatusTour.status} />
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {statusOptions.map(opt => {
                const isDisabled = (opt.value === TourStatus.ACTIVE && !canActivate);
                const isLoading = statusLoading === selectedStatusTour.id;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleChangeStatus(selectedStatusTour.id, opt.value)}
                    disabled={isDisabled || isLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.75rem",
                      padding: "0.875rem",
                      borderRadius: "var(--radius-lg)",
                      border: "none",
                      backgroundColor: opt.bg,
                      color: opt.color,
                      fontWeight: 600,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.5 : 1,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isLoading ? (
                      <div className="tour-spinner-small" />
                    ) : (
                      <>
                        {opt.icon} {opt.label}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {!canActivate && (
              <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#ef4444", textAlign: "center" }}>
                ⚠️ تور منقضی شده یا ظرفیت آن تکمیل است، قابل فعالسازی مجدد نیست
              </p>
            )}
          </div>
          <div className="tour-modal-footer">
            <button className="tour-btn-close" onClick={() => setShowStatusModal(false)}>بستن</button>
          </div>
        </div>
      </div>
    );
  };

  // ========== Render ==========
  if (loading) {
    return (
      <div className="tour-loading">
        <div className="tour-spinner"></div>
        <p>در حال بارگذاری تورها...</p>
      </div>
    );
  }

  return (
    <div className="tours-container">
      {/* Toast Message */}
      {message && (
        <div className={`tour-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="tour-header">
        <h2><FaCalendarAlt /> مدیریت تورها</h2>
        <button className="tour-btn-add" onClick={() => setShowForm(true)}>
          <FaPlus /> افزودن تور جدید
        </button>
      </div>

      {/* Search Bar */}
      <div className="tour-search">
        <FaSearch className="tour-search-icon" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام تور یا کد تور..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Status Filter Buttons */}
      <div className="tour-status-filters">
        <button
          onClick={() => handleStatusFilter(null)}
          className={`filter-btn ${!filterStatus ? "active" : ""}`}
        >
          همه تورها
        </button>
        {Object.values(TourStatus).map(status => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`filter-btn ${filterStatus === status ? "active" : ""}`}
            style={{
              borderColor: TourStatusColors[status],
              backgroundColor: filterStatus === status ? TourStatusBgColors[status] : "white",
              color: filterStatus === status ? TourStatusColors[status] : "var(--gray-600)"
            }}
          >
            {status === TourStatus.ACTIVE && "✅"}
            {status === TourStatus.EXPIRED && "⏰"}
            {status === TourStatus.SOLD_OUT && "❌"}
            {status === TourStatus.SUSPENDED && "⏸️"}
            {TourStatusPersian[status]}
          </button>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="tour-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="tour-modal-header">
              <h3>{editingTour ? "ویرایش تور" : "افزودن تور جدید"}</h3>
              <button className="tour-modal-close" onClick={() => {
                setShowForm(false);
                setEditingTour(null);
              }}>
                ✕
              </button>
            </div>
            <TourForm
              initialData={editingTour || undefined}
              baseTours={baseTours}
              onSubmit={editingTour ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingTour(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <div className="tour-no-data">
          <FaCalendarAlt />
          <p>هیچ توری ثبت نشده است</p>
          <button className="tour-btn-add" onClick={() => setShowForm(true)}>
            افزودن تور جدید
          </button>
        </div>
      ) : (
        <div className="tours-grid">
          {filteredTours.map((tour) => (
            <div key={tour.id} className="tour-card">
              <div className="tour-card-hero">
                <div className="tour-card-hero-glow" />
                <div className="tour-card-hero-pattern" />
                <div className="tour-card-hero-top">
                  <span className="tour-code">{tour.baseTourCode}</span>
                  <TourStatusBadge status={tour.status} size="sm" />
                </div>
                <h3 className="tour-card-hero-title">{tour.baseTourName}</h3>
              </div>
              <div className="tour-card-body">
                <div className="tour-meta-row">
                  <div className="tour-meta-item">
                    <span className="tour-meta-icon">📅</span>
                    <div className="tour-meta-text">
                      <span className="tour-meta-label">حرکت</span>
                      <strong>{new Date(tour.departureDate).toLocaleDateString("fa-IR")}</strong>
                    </div>
                  </div>
                  <div className="tour-meta-item">
                    <span className="tour-meta-icon">🏁</span>
                    <div className="tour-meta-text">
                      <span className="tour-meta-label">بازگشت</span>
                      <strong>{new Date(tour.returnDate).toLocaleDateString("fa-IR")}</strong>
                    </div>
                  </div>
                </div>
                <div className="tour-stats">
                  <div className="tour-stat tour-stat-price">
                    <span>💰 قیمت</span>
                    <strong>{formatPrice(tour.price)}</strong>
                  </div>
                  <div className="tour-stat tour-stat-capacity">
                    <span>👥 ظرفیت</span>
                    <strong>{tour.capacity} نفر</strong>
                  </div>
                </div>
              </div>
              <div className="tour-card-footer">
                <span className="tour-created-date">
                  🕓 ایجاد: {new Date(tour.createdAt).toLocaleDateString("fa-IR")}
                </span>
                <div className="tour-card-actions">
                  <button 
                    className="tour-btn-view" 
                    onClick={() => handleViewDetails(tour.id)}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="tour-btn-edit" 
                    onClick={() => {
                      setEditingTour(tour);
                      setShowForm(true);
                    }}
                    title="ویرایش تور"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="tour-btn-status" 
                    onClick={() => {
                      setSelectedStatusTour(tour);
                      setShowStatusModal(true);
                    }}
                    title="تغییر وضعیت"
                  >
                    <FaSyncAlt />
                  </button>
                  <button 
                    className="tour-btn-delete" 
                    onClick={() => {
                      setDeletingId(tour.id);
                      setShowDeleteModal(true);
                    }}
                    title="حذف تور"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف تور"
        message="آیا از حذف این تور اطمینان دارید؟ تمام اطلاعات مرتبط با ایستگاه‌ها نیز حذف خواهد شد."
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
        isLoading={isSubmitting}
      />

      {/* Status Change Modal */}
      {showStatusModal && <StatusChangeModal />}

      {/* Tour Details Modal */}
      {showDetailModal && selectedTour && (
        <TourDetailsModal
          tourDetails={selectedTour}
          onClose={() => setShowDetailModal(false)}
          onRefresh={fetchAllData}
        />
      )}
    </div>
  );
};

export default ToursManagement;