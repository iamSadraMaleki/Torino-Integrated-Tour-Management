import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from "react-icons/fa";
import { BaseFood, CreateFoodRequest, FoodType, MealType } from "../../../Types/food";
import { foodApi } from "../../../Services/foodApi";
import FoodForm from "./FoodForm";
import FoodDetailModal from "./FoodDetailModal";
import ConfirmModal from "../../ceo/profile/ConfirmModal";

interface FoodsListProps {
  onFoodChange?: () => void;
}

const FoodsList: React.FC<FoodsListProps> = ({ onFoodChange }) => {
  const [foods, setFoods] = useState<BaseFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<BaseFood | null>(null);
  const [selectedFood, setSelectedFood] = useState<BaseFood | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFoodType, setFilterFoodType] = useState<FoodType | "all">("all");
  const [filterMealType, setFilterMealType] = useState<MealType | "all">("all");

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const data = await foodApi.getAllFoods();
      setFoods(data);
    } catch (error) {
      console.error("Error fetching foods:", error);
      setMessage({ type: "error", text: "خطا در دریافت لیست غذاها" });
    } finally {
      setLoading(false);
    }
  };

  const getFoodTypeLabel = (type: FoodType): string => {
    const types: Record<FoodType, string> = {
      IRANIAN: "ایرانی",
      INTERNATIONAL: "بین‌المللی",
      FASTFOOD: "فست فود",
      SEAFOOD: "بحر و بر",
      VEGETARIAN: "گیاهی",
      DESSERT: "دسر",
    };
    return types[type] || type;
  };

  const getMealTypeLabel = (type: MealType): string => {
    const types: Record<MealType, string> = {
      BREAKFAST: "صبحانه",
      LUNCH: "ناهار",
      DINNER: "شام",
      SNACK: "میان وعده",
      ALL_DAY: "همه وعده‌ها",
    };
    return types[type] || type;
  };

  const foodTypeOptions: { value: FoodType; label: string }[] = [
    { value: "IRANIAN", label: "ایرانی" },
    { value: "INTERNATIONAL", label: "بین‌المللی" },
    { value: "FASTFOOD", label: "فست فود" },
    { value: "SEAFOOD", label: "بحر و بر" },
    { value: "VEGETARIAN", label: "گیاهی" },
    { value: "DESSERT", label: "دسر" },
  ];

  const mealTypeOptions: { value: MealType; label: string }[] = [
    { value: "BREAKFAST", label: "صبحانه" },
    { value: "LUNCH", label: "ناهار" },
    { value: "DINNER", label: "شام" },
    { value: "SNACK", label: "میان وعده" },
    { value: "ALL_DAY", label: "همه وعده‌ها" },
  ];

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFoodType = filterFoodType === "all" || food.foodType === filterFoodType;
    const matchesMealType = filterMealType === "all" || food.mealType === filterMealType;
    return matchesSearch && matchesFoodType && matchesMealType;
  });

  const handleCreate = async (data: CreateFoodRequest) => {
    setIsSubmitting(true);
    try {
      const newFood = await foodApi.createFood(data);
      setFoods([newFood, ...foods]);
      setMessage({ type: "success", text: "غذا با موفقیت ثبت شد" });
      setShowForm(false);
      if (onFoodChange) onFoodChange();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ثبت غذا" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: CreateFoodRequest) => {
    if (!editingFood) return;
    setIsSubmitting(true);
    try {
      const updatedFood = await foodApi.updateFood(editingFood.id, data);
      setFoods(foods.map((f) => (f.id === updatedFood.id ? updatedFood : f)));
      setMessage({ type: "success", text: "غذا با موفقیت ویرایش شد" });
      setShowForm(false);
      setEditingFood(null);
      if (onFoodChange) onFoodChange();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش غذا" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await foodApi.deleteFood(deletingId);
      setFoods(foods.filter((f) => f.id !== deletingId));
      setMessage({ type: "success", text: "غذا با موفقیت حذف شد" });
      if (onFoodChange) onFoodChange();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف غذا" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
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
    <div className="foods-list-section">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-header-actions">
        <h3>لیست غذاها</h3>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="جستجوی غذا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterFoodType}
            onChange={(e) => setFilterFoodType(e.target.value as FoodType | "all")}
          >
            <option value="all">همه نوع غذاها</option>
            {foodTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterMealType}
            onChange={(e) => setFilterMealType(e.target.value as MealType | "all")}
          >
            <option value="all">همه وعده‌ها</option>
            {mealTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <FaPlus /> افزودن غذای جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal form-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingFood ? "ویرایش غذا" : "ثبت غذای جدید"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <FoodForm
              initialData={editingFood || undefined}
              onSubmit={editingFood ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingFood(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="foods-table-wrapper">
        <table className="foods-table">
          <thead>
            <tr>
              <th>نام غذا</th>
              <th>نوع غذا</th>
              <th>وعده غذایی</th>
              <th>تعداد مواد</th>
              <th>تاریخ ثبت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredFoods.map((food) => (
              <tr key={food.id}>
                <td>{food.name}</td>
                <td>{getFoodTypeLabel(food.foodType)}</td>
                <td>{getMealTypeLabel(food.mealType)}</td>
                <td>{food.ingredients?.length || 0} عدد</td>
                <td>{new Date(food.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn view"
                    onClick={() => {
                      setSelectedFood(food);
                      setShowDetailModal(true);
                    }}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingFood(food);
                      setShowForm(true);
                    }}
                    title="ویرایش"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => {
                      setDeletingId(food.id);
                      setShowDeleteModal(true);
                    }}
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFoods.length === 0 && (
          <div className="empty-state">
            <p>هیچ غذایی ثبت نشده است</p>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              افزودن غذای جدید
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف غذا"
        message="آیا از حذف این غذا اطمینان دارید؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      {showDetailModal && selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default FoodsList;