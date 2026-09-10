import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { BaseFood, CreateFoodRequest, FoodType, MealType, Ingredient } from "../../../Types/food";

interface FoodFormProps {
  initialData?: BaseFood;
  onSubmit: (data: CreateFoodRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const FoodForm: React.FC<FoodFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateFoodRequest>({
    name: "",
    foodType: "IRANIAN",
    mealType: "ALL_DAY",
    ingredients: [{ ingredientName: "", amount: "" }],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        foodType: initialData.foodType,
        mealType: initialData.mealType,
        ingredients: initialData.ingredients.length > 0 ? initialData.ingredients : [{ ingredientName: "", amount: "" }],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientName: "", amount: "" }],
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length === 1) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [{ ingredientName: "", amount: "" }],
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // فیلتر کردن مواد اولیه خالی
    const validIngredients = formData.ingredients.filter(
      (ing) => ing.ingredientName.trim() !== ""
    );
    await onSubmit({ ...formData, ingredients: validIngredients });
  };

  return (
    <form className="food-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>نام غذا *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: چلو کباب، قرمه سبزی، ..."
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>نوع غذا *</label>
          <select
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            {foodTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>وعده غذایی *</label>
          <select
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            {mealTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <label>مواد اولیه</label>
          <button type="button" className="btn-add-ingredient" onClick={addIngredient} disabled={isLoading}>
            <FaPlus /> افزودن ماده اولیه
          </button>
        </div>

        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-row">
            <div className="ingredient-name">
              <input
                type="text"
                placeholder="نام ماده اولیه"
                value={ingredient.ingredientName}
                onChange={(e) => handleIngredientChange(index, "ingredientName", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="ingredient-amount">
              <input
                type="text"
                placeholder="مقدار (مثال: 500 گرم، 2 قاشق)"
                value={ingredient.amount}
                onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              className="btn-remove-ingredient"
              onClick={() => removeIngredient(index)}
              disabled={isLoading}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          <FaTimes /> انصراف
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          <FaSave /> {isLoading ? "در حال ذخیره..." : initialData ? "ویرایش غذا" : "ثبت غذا"}
        </button>
      </div>
    </form>
  );
};

export default FoodForm;