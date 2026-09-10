import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUtensils,
  FaSync,
  FaSave,
  FaChevronDown,
  FaChevronUp,
  FaCoffee,
  FaIceCream,
  FaHamburger,
} from "react-icons/fa";
import {
  tourFoodApi,
  tourDrinkApi,
  tourDessertApi,
  baseFoodApi,
} from "../../../Services/tourFoodApi";
import {
  BaseFood,
  AddTourFoodRequest,
  UpdateTourFoodRequest,
  TourFoodResponse,
  TourDrinkResponse,
  TourDessertResponse,
  TourMenuResponse,
  FoodCategory,
  ItemType,
} from "../../../Types/tourFood";
import ConfirmModal from "../profile/ConfirmModal";
import "./TourFoodManager.css";

interface TourFoodManagerProps {
  tourId: number;
  tourName: string;
  tourDays: number;
  onClose: () => void;
  onRefresh: () => void;
}

// آیتم یکپارچه برای نمایش در UI
interface UnifiedMenuItem {
  id: number;
  name: string;
  price: number;
  type: ItemType;
  foodType: BaseFood["foodType"];
  mealType: BaseFood["mealType"];
  serveDay: string;
  originalId: number;
  category: FoodCategory;
}

// منوی گروه‌بندی شده بر اساس روز و وعده غذایی
interface GroupedMenuByDay {
  serveDay: string;
  breakfast: UnifiedMenuItem[];
  lunch: UnifiedMenuItem[];
  dinner: UnifiedMenuItem[];
  snack: UnifiedMenuItem[];
  allDay: UnifiedMenuItem[];
}

const TourFoodManager: React.FC<TourFoodManagerProps> = ({
  tourId,
  tourName,
  tourDays,
  onClose,
  onRefresh,
}) => {
  // Stateهای جداگانه برای سه نوع مختلف
  const [tourFoods, setTourFoods] = useState<TourFoodResponse[]>([]);
  const [tourDrinks, setTourDrinks] = useState<TourDrinkResponse[]>([]);
  const [tourDesserts, setTourDesserts] = useState<TourDessertResponse[]>([]);
  const [availableFoods, setAvailableFoods] = useState<BaseFood[]>([]);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenuByDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedMenuItem | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>("food");
  const [formData, setFormData] = useState({
    baseFoodId: 0,
    serveDay: "",
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<UnifiedMenuItem | null>(null);

  // روزهای تور
  const tourDaysList = Array.from({ length: tourDays }, (_, i) => `day_${i + 1}`);

  // نگاشت برای نمایش نام وعده غذایی
  const mealTypeMap: Record<BaseFood["mealType"], string> = {
    BREAKFAST: "صبحانه",
    LUNCH: "ناهار",
    DINNER: "شام",
    SNACK: "میان‌وعده",
    ALL_DAY: "همه روز",
  };

  const mealTypeOrder: BaseFood["mealType"][] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "ALL_DAY"];

  useEffect(() => {
    fetchData();
  }, [tourId]);

  // تابع گروه‌بندی منو بر اساس روز و وعده غذایی
  const groupMenuByDayAndMeal = (
    foods: TourFoodResponse[],
    drinks: TourDrinkResponse[],
    desserts: TourDessertResponse[]
  ): GroupedMenuByDay[] => {
    const allItems: UnifiedMenuItem[] = [
      ...foods.map((f) => ({
        id: f.id,
        name: f.foodName,
        price: f.price,
        type: "FOOD" as ItemType,
        foodType: f.foodType,
        mealType: f.mealType,
        serveDay: f.serveDay,
        originalId: f.baseFoodId,
        category: "food" as FoodCategory,
      })),
      ...drinks.map((d) => ({
        id: d.id,
        name: d.drinkName,
        price: d.price,
        type: "DRINK" as ItemType,
        foodType: d.foodType,
        mealType: d.mealType,
        serveDay: d.serveDay,
        originalId: d.baseFoodId,
        category: "drink" as FoodCategory,
      })),
      ...desserts.map((d) => ({
        id: d.id,
        name: d.dessertName,
        price: d.price,
        type: "DESSERT" as ItemType,
        foodType: d.foodType,
        mealType: d.mealType,
        serveDay: d.serveDay,
        originalId: d.baseFoodId,
        category: "dessert" as FoodCategory,
      })),
    ];

    // گروه‌بندی بر اساس روز
    const groupedByDay = new Map<string, UnifiedMenuItem[]>();
    allItems.forEach((item) => {
      if (!groupedByDay.has(item.serveDay)) {
        groupedByDay.set(item.serveDay, []);
      }
      groupedByDay.get(item.serveDay)!.push(item);
    });

    // تبدیل به ساختار نهایی با تفکیک وعده‌های غذایی
    const result: GroupedMenuByDay[] = [];
    for (const [serveDay, items] of groupedByDay) {
      const dayMenu: GroupedMenuByDay = {
        serveDay,
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        allDay: [],
      };

      items.forEach((item) => {
        switch (item.mealType) {
          case "BREAKFAST":
            dayMenu.breakfast.push(item);
            break;
          case "LUNCH":
            dayMenu.lunch.push(item);
            break;
          case "DINNER":
            dayMenu.dinner.push(item);
            break;
          case "SNACK":
            dayMenu.snack.push(item);
            break;
          case "ALL_DAY":
            dayMenu.allDay.push(item);
            break;
        }
      });

      result.push(dayMenu);
    }

    // مرتب‌سازی بر اساس شماره روز
    result.sort((a, b) => {
      const dayA = parseInt(a.serveDay.replace("day_", ""));
      const dayB = parseInt(b.serveDay.replace("day_", ""));
      return dayA - dayB;
    });

    return result;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, drinksRes, dessertsRes, availableRes] = await Promise.all([
        tourFoodApi.getFoodsByTourId(tourId),
        tourDrinkApi.getDrinksByTourId(tourId),
        tourDessertApi.getDessertsByTourId(tourId),
        baseFoodApi.getAllBaseFoods(),
      ]);

      setTourFoods(foodsRes);
      setTourDrinks(drinksRes);
      setTourDesserts(dessertsRes);
      setAvailableFoods(availableRes);

      const grouped = groupMenuByDayAndMeal(foodsRes, drinksRes, dessertsRes);
      setGroupedMenu(grouped);

      // باز کردن همه روزها به صورت پیشفرض
      const allDays = new Set(grouped.map((day) => day.serveDay));
      setExpandedDays(allDays);
    } catch (error) {
      console.error("Error fetching food data:", error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات غذاها" });
    } finally {
      setLoading(false);
    }
  };

  // گرفتن آیتم‌های موجود (بر اساس دسته‌بندی انتخاب شده)
  const getAvailableItemsForCategory = () => {
    let filtered = availableFoods;

    if (selectedCategory === "food") {
      filtered = filtered.filter((f) => f.foodType !== "DESSERT");
    } else if (selectedCategory === "drink") {
      // نوشیدنی‌ها رو میتونی بر اساس логиک خودت فیلتر کنی
      filtered = filtered.filter((f) => f.mealType === "ALL_DAY");
    } else if (selectedCategory === "dessert") {
      filtered = filtered.filter((f) => f.foodType === "DESSERT");
    }

    return filtered;
  };

  const availableItems = getAvailableItemsForCategory();

  // آیا افزودن این آیتم در روز انتخابی مجاز است؟
  // قانون: هر وعده (مثلاً ناهار) در هر روز حداکثر ۲ غذا + تکرار همان غذا در همان وعده ممنوع است
  const isItemAllowedForSelectedDay = (item: BaseFood): boolean => {
    if (!formData.serveDay) return true; // بدون انتخاب روز، بک‌اند تصمیم نهایی را می‌گیرد

    const dayItems = [...tourFoods, ...tourDrinks, ...tourDesserts].filter(
      (i) => i.serveDay === formData.serveDay
    );
    const mealCount = dayItems.filter((i) => i.mealType === item.mealType).length;
    const alreadyInSameMeal = dayItems.some(
      (i) => i.mealType === item.mealType && i.baseFoodId === item.id
    );

    return mealCount < 2 && !alreadyInSameMeal;
  };

  const handleAdd = async () => {
    if (!formData.baseFoodId) {
      setMessage({ type: "error", text: "لطفاً آیتم را انتخاب کنید" });
      return;
    }
    if (!formData.serveDay) {
      setMessage({ type: "error", text: "لطفاً روز سرو را انتخاب کنید" });
      return;
    }
    if (formData.price <= 0) {
      setMessage({ type: "error", text: "قیمت باید بزرگتر از 0 باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: AddTourFoodRequest = {
        tourId: tourId,
        baseFoodId: formData.baseFoodId,
        serveDay: formData.serveDay,
        price: formData.price,
      };

      // انتخاب API مناسب بر اساس دسته‌بندی
      if (selectedCategory === "food") {
        await tourFoodApi.addFoodToTour(request);
      } else if (selectedCategory === "drink") {
        await tourDrinkApi.addDrinkToTour(request);
      } else {
        await tourDessertApi.addDessertToTour(request);
      }

      setMessage({ type: "success", text: "آیتم با موفقیت به تور اضافه شد" });
      setFormData({ baseFoodId: 0, serveDay: "", price: 0 });
      setShowAddForm(false);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در افزودن آیتم" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    if (!formData.serveDay) {
      setMessage({ type: "error", text: "لطفاً روز سرو را انتخاب کنید" });
      return;
    }
    if (formData.price <= 0) {
      setMessage({ type: "error", text: "قیمت باید بزرگتر از 0 باشد" });
      return;
    }

    setIsSubmitting(true);
    try {
      const request: UpdateTourFoodRequest = {
        serveDay: formData.serveDay,
        price: formData.price,
      };

      // انتخاب API مناسب بر اساس دسته‌بندی
      if (editingItem.category === "food") {
        await tourFoodApi.updateTourFood(editingItem.id, request);
      } else if (editingItem.category === "drink") {
        await tourDrinkApi.updateTourDrink(editingItem.id, request);
      } else {
        await tourDessertApi.updateTourDessert(editingItem.id, request);
      }

      setMessage({ type: "success", text: "آیتم با موفقیت ویرایش شد" });
      setEditingItem(null);
      setFormData({ baseFoodId: 0, serveDay: "", price: 0 });
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در ویرایش آیتم" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deletingItem) return;

    setIsSubmitting(true);
    try {
      if (deletingItem.category === "food") {
        await tourFoodApi.removeFoodFromTour(deletingItem.id);
      } else if (deletingItem.category === "drink") {
        await tourDrinkApi.removeDrinkFromTour(deletingItem.id);
      } else {
        await tourDessertApi.removeDessertFromTour(deletingItem.id);
      }

      setMessage({ type: "success", text: "آیتم با موفقیت از تور حذف شد" });
      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchData();
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "خطا در حذف آیتم" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: UnifiedMenuItem) => {
    setEditingItem(item);
    setFormData({
      baseFoodId: item.originalId,
      serveDay: item.serveDay,
      price: item.price,
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setFormData({ baseFoodId: 0, serveDay: "", price: 0 });
  };

  const toggleDayExpand = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const getCategoryIcon = (type: ItemType) => {
    switch (type) {
      case "DRINK":
        return <FaCoffee />;
      case "DESSERT":
        return <FaIceCream />;
      default:
        return <FaHamburger />;
    }
  };

  const getCategoryText = (type: ItemType) => {
    switch (type) {
      case "DRINK":
        return "نوشیدنی";
      case "DESSERT":
        return "دسر";
      default:
        return "غذا";
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const formatDayName = (day: string) => {
    const dayNumber = day.replace("day_", "");
    return `روز ${dayNumber} تور`;
  };

  const renderMealSection = (
    title: string,
    items: UnifiedMenuItem[],
    day: string
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="meal-section">
        <div className="meal-section-title">{title}</div>
        <div className="meal-items">
          {items.map((item) => (
            <div key={`${item.id}-${item.type}`} className="menu-food-item">
              <div className="food-icon">
                {getCategoryIcon(item.type)}
                <span className="food-type-badge">{getCategoryText(item.type)}</span>
              </div>
              <div className="food-info">
                <div className="food-name">{item.name}</div>
                <div className="food-details">
                  <span className="food-price">{formatPrice(item.price)}</span>
                </div>
              </div>
              <div className="food-actions">
                <button
                  className="btn-edit-food"
                  onClick={() => startEdit(item)}
                  title="ویرایش"
                >
                  <FaEdit />
                </button>
                <button
                  className="btn-remove-food"
                  onClick={() => {
                    setDeletingItem(item);
                    setShowDeleteModal(true);
                  }}
                  title="حذف از منو"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="tour-modal-overlay" onClick={onClose}>
        <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="tour-loading">
            <div className="tour-spinner-small"></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-modal-overlay" onClick={onClose}>
      <div className="tour-modal tour-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="tour-modal-header">
          <h3>
            <FaUtensils /> مدیریت غذاها و منوی تور - {tourName}
          </h3>
          <button className="tour-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tour-modal-body">
          {message && (
            <div
              className={`tour-toast ${message.type}`}
              style={{ position: "relative", top: 0, marginBottom: "1rem" }}
            >
              {message.text}
            </div>
          )}

          {/* دکمه افزودن آیتم */}
          <div className="tour-foods-add-btn">
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add-food">
              <FaPlus /> افزودن آیتم جدید به منوی تور
            </button>
          </div>

          {/* فرم افزودن آیتم */}
          {showAddForm && (
            <div className="tour-add-food-form">
              <div className="form-header">
                <h4>افزودن آیتم جدید به منوی تور</h4>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>دسته‌بندی</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value as FoodCategory);
                      setFormData({ ...formData, baseFoodId: 0 });
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="food">غذا</option>
                    <option value="drink">نوشیدنی</option>
                    <option value="dessert">دسر</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>انتخاب آیتم</label>
                  <select
                    value={formData.baseFoodId}
                    onChange={(e) => setFormData({ ...formData, baseFoodId: parseInt(e.target.value) })}
                    disabled={isSubmitting}
                  >
                    <option value={0}>انتخاب کنید...</option>
                    {availableItems.map((item) => {
                      const allowed = isItemAllowedForSelectedDay(item);
                      return (
                        <option key={item.id} value={item.id} disabled={!allowed}>
                          {item.name} - {mealTypeMap[item.mealType]}
                          {!allowed && formData.serveDay ? " (در این وعده/روز نامعتبر)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <span className="no-food-warning" style={{ color: "#0d9488" }}>
                    💡 هر وعده حداکثر ۲ غذا — تکرار یک غذا در روزهای دیگر مجاز است
                  </span>
                </div>
                <div className="form-group">
                  <label>روز سرو</label>
                  <select
                    value={formData.serveDay}
                    onChange={(e) =>
                      setFormData({ ...formData, serveDay: e.target.value, baseFoodId: 0 })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">انتخاب کنید...</option>
                    {tourDaysList.map((day) => (
                      <option key={day} value={day}>
                        {formatDayName(day)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>قیمت (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button
                    onClick={handleAdd}
                    className="btn-submit-sm"
                    disabled={!formData.baseFoodId || !formData.serveDay || formData.price <= 0 || isSubmitting}
                  >
                    {isSubmitting ? "در حال افزودن..." : "افزودن"}
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="btn-cancel-sm">
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* فرم ویرایش */}
          {editingItem && (
            <div className="tour-edit-food-form">
              <div className="form-header">
                <h4>
                  ویرایش: {editingItem.name} ({getCategoryText(editingItem.type)})
                </h4>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>روز سرو</label>
                  <select
                    value={formData.serveDay}
                    onChange={(e) => setFormData({ ...formData, serveDay: e.target.value })}
                    disabled={isSubmitting}
                  >
                    {tourDaysList.map((day) => (
                      <option key={day} value={day}>
                        {formatDayName(day)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>قیمت (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions-inline">
                  <button onClick={handleUpdate} className="btn-submit-sm" disabled={isSubmitting}>
                    <FaSave /> {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
                  </button>
                  <button onClick={cancelEdit} className="btn-cancel-sm">
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* نمایش منوی تور */}
          <div className="tour-menu-list">
            <h4>منوی تور (بر اساس روز)</h4>
            {groupedMenu.length === 0 ? (
              <div className="no-menu">
                <FaUtensils />
                <p>هیچ آیتمی به منوی تور اضافه نشده است</p>
                <small>با کلیک روی دکمه "افزودن" منوی تور را تکمیل کنید</small>
              </div>
            ) : (
              <div className="menu-days-list">
                {groupedMenu.map((dayMenu) => (
                  <div key={dayMenu.serveDay} className="menu-day-card">
                    <div
                      className="menu-day-header"
                      onClick={() => toggleDayExpand(dayMenu.serveDay)}
                    >
                      <div className="day-title">
                        {expandedDays.has(dayMenu.serveDay) ? <FaChevronUp /> : <FaChevronDown />}
                        <span className="day-name">{formatDayName(dayMenu.serveDay)}</span>
                        <span className="food-count">
                          {dayMenu.breakfast.length +
                            dayMenu.lunch.length +
                            dayMenu.dinner.length +
                            dayMenu.snack.length +
                            dayMenu.allDay.length}{" "}
                          آیتم
                        </span>
                      </div>
                    </div>
                    {expandedDays.has(dayMenu.serveDay) && (
                      <div className="menu-day-items">
                        {renderMealSection("🍳 صبحانه", dayMenu.breakfast, dayMenu.serveDay)}
                        {renderMealSection("🍝 ناهار", dayMenu.lunch, dayMenu.serveDay)}
                        {renderMealSection("🍽️ شام", dayMenu.dinner, dayMenu.serveDay)}
                        {renderMealSection("🍪 میان‌وعده", dayMenu.snack, dayMenu.serveDay)}
                        {renderMealSection("🌙 همه روز", dayMenu.allDay, dayMenu.serveDay)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="tour-modal-footer">
          <button className="tour-btn-close" onClick={onClose}>
            بستن
          </button>
          <button className="tour-btn-refresh" onClick={fetchData}>
            <FaSync /> بروزرسانی
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="حذف از منوی تور"
        message={`آیا از حذف "${deletingItem?.name}" از منوی تور اطمینان دارید؟`}
        onConfirm={handleRemove}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingItem(null);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TourFoodManager;