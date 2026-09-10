// ========== Food Types ==========
export type FoodType = "IRANIAN" | "INTERNATIONAL" | "FASTFOOD" | "SEAFOOD" | "VEGETARIAN" | "DESSERT";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "ALL_DAY";

export interface Ingredient {
  id?: number;
  ingredientName: string;
  amount: string;
}

export interface BaseFood {
  id: number;
  name: string;
  foodType: FoodType;
  mealType: MealType;
  ingredients: Ingredient[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodRequest {
  name: string;
  foodType: FoodType;
  mealType: MealType;
  ingredients: Ingredient[];
}

export interface FoodApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}
