// ==================== Base Types ====================
export interface BaseFood {
  id: number;
  name: string;
  foodType: "IRANIAN" | "INTERNATIONAL" | "FASTFOOD" | "SEAFOOD" | "VEGETARIAN" | "DESSERT";
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "ALL_DAY";
  description?: string;
}

// ==================== Request Types ====================
export interface AddTourFoodRequest {
  tourId: number;
  baseFoodId: number;
  serveDay: string;
  price: number;
}

export interface UpdateTourFoodRequest {
  serveDay: string;
  price: number;
}

// ==================== Response Types from Backend ====================
export interface TourFoodResponse {
  id: number;
  tourId: number;
  baseFoodId: number;
  foodName: string;
  foodType: BaseFood["foodType"];
  mealType: BaseFood["mealType"];
  serveDay: string;
  price: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface TourDrinkResponse {
  id: number;
  tourId: number;
  baseFoodId: number;
  drinkName: string;
  foodType: BaseFood["foodType"];
  mealType: BaseFood["mealType"];
  serveDay: string;
  price: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface TourDessertResponse {
  id: number;
  tourId: number;
  baseFoodId: number;
  dessertName: string;
  foodType: BaseFood["foodType"];
  mealType: BaseFood["mealType"];
  serveDay: string;
  price: number;
  createdAt: string;
  updatedAt: string | null;
}

// ==================== Combined Menu Response ====================
export interface TourMenuResponse {
  foods: TourFoodResponse[];
  drinks: TourDrinkResponse[];
  desserts: TourDessertResponse[];
}

// ==================== UI Types ====================
export type ItemType = "FOOD" | "DRINK" | "DESSERT";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  type: ItemType;
  mealType: BaseFood["mealType"];
  serveDay: string;
  originalData: TourFoodResponse | TourDrinkResponse | TourDessertResponse;
}

export interface DayMenuItem {
  id: number;
  name: string;
  price: number;
  type: ItemType;
  mealType: BaseFood["mealType"];
}

export interface TourDayMenu {
  dayNumber: number;
  dayName: string;
  breakfast: DayMenuItem[];
  lunch: DayMenuItem[];
  dinner: DayMenuItem[];
  snack: DayMenuItem[];
  allDay: DayMenuItem[];
}

// ==================== Component Props ====================
export interface TourFoodManagerProps {
  tourId: number;
  tourName: string;
  tourDays: number;
  onClose: () => void;
  onRefresh: () => void;
}

export type FoodCategory = "food" | "drink" | "dessert";

// ==================== Helper Types for Form ====================
export interface TourFoodFormData {
  baseFoodId: number;
  serveDay: string;
  price: number;
}

// ==================== Meal Type Mapping ====================
export const MEAL_TYPE_LABELS: Record<BaseFood["mealType"], string> = {
  BREAKFAST: "صبحانه",
  LUNCH: "ناهار",
  DINNER: "شام",
  SNACK: "میان‌وعده",
  ALL_DAY: "همه روز",
};

export const MEAL_TYPE_ICONS: Record<BaseFood["mealType"], string> = {
  BREAKFAST: "🍳",
  LUNCH: "🍝",
  DINNER: "🍽️",
  SNACK: "🍪",
  ALL_DAY: "🌙",
};

export const MEAL_TYPE_ORDER: BaseFood["mealType"][] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
  "ALL_DAY",
];

// ==================== Food Type Mapping ====================
export const FOOD_TYPE_LABELS: Record<BaseFood["foodType"], string> = {
  IRANIAN: "ایرانی",
  INTERNATIONAL: "بین‌المللی",
  FASTFOOD: "فست فود",
  SEAFOOD: "بحر و جوی",
  VEGETARIAN: "گیاهی",
  DESSERT: "دسر",
};

export const FOOD_TYPE_ICONS: Record<BaseFood["foodType"], string> = {
  IRANIAN: "🍛",
  INTERNATIONAL: "🍝",
  FASTFOOD: "🍔",
  SEAFOOD: "🦐",
  VEGETARIAN: "🥗",
  DESSERT: "🍰",
};

// ==================== Category Labels ====================
export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  food: "غذا",
  drink: "نوشیدنی",
  dessert: "دسر",
};

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  food: "🍽️",
  drink: "🥤",
  dessert: "🍰",
};

// ==================== Helper Functions ====================
export const formatPrice = (price: number): string => {
  return price.toLocaleString("fa-IR") + " تومان";
};

export const formatDayName = (serveDay: string): string => {
  const dayNumber = serveDay.replace("day_", "");
  return `روز ${dayNumber} تور`;
};

export const getDayNumber = (serveDay: string): number => {
  return parseInt(serveDay.replace("day_", ""));
};

export const generateServeDays = (tourDays: number): string[] => {
  return Array.from({ length: tourDays }, (_, i) => `day_${i + 1}`);
};