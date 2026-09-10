import React from "react";
import { FaTimes } from "react-icons/fa";
import { BaseFood, FoodType, MealType } from "../../../Types/food";

interface FoodDetailModalProps {
  food: BaseFood;
  onClose: () => void;
}

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose }) => {
  if (!food) return null;

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content food-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات غذا</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>اطلاعات اصلی</h4>
            <div className="detail-row">
              <span className="detail-label">نام غذا:</span>
              <span className="detail-value">{food.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">نوع غذا:</span>
              <span className="detail-value">{getFoodTypeLabel(food.foodType)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">وعده غذایی:</span>
              <span className="detail-value">{getMealTypeLabel(food.mealType)}</span>
            </div>
          </div>

          {food.ingredients && food.ingredients.length > 0 && (
            <div className="detail-section">
              <h4>مواد اولیه</h4>
              <div className="ingredients-list">
                {food.ingredients.map((ing, index) => (
                  <div key={index} className="ingredient-item">
                    <span className="ingredient-name">{ing.ingredientName}</span>
                    <span className="ingredient-amount">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4>اطلاعات سیستمی</h4>
            <div className="detail-row">
              <span className="detail-label">تاریخ ثبت:</span>
              <span className="detail-value">
                {new Date(food.createdAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            {food.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">آخرین ویرایش:</span>
                <span className="detail-value">
                  {new Date(food.updatedAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;