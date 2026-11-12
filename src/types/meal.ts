export type MealCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface FoodItem {
  id: number;
  foodId: number;

  name: string;
  grams: number;

  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export type MealState = {
  description: string;
  type: string;
  eatTime: string;
}

export interface Meal {
  id: number;
  date: string;
  category: MealCategory;
  calories: number;
  items?: FoodItem[];
}

export interface MacroSummary {
  carbs: number;
  proteins: number;
  fats: number;
  calories: number;
  // null: o usuário ainda não definiu uma meta diária.
  caloriesGoal: number | null;
}

export interface MealsSummary {
  total: number;
  thisMonth: number;
  today: number;
}
