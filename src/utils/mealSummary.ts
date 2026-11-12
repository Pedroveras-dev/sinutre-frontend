import type { Meal } from '@/types/mealSummary';
import { isSameLocalDay, isSameLocalMonth } from './date';

export interface DayMacros {
  carbs: number;
  proteins: number;
  fats: number;
  calories: number;
}

// Soma os macros apenas das refeições feitas no dia `day` (fuso local).
export function sumMacrosOfDay(meals: Meal[], day: Date): DayMacros {
  return meals
    .filter((meal) => isSameLocalDay(new Date(meal.eatTime), day))
    .reduce<DayMacros>(
      (acc, meal) => {
        acc.carbs += meal.totals.carbs;
        acc.proteins += meal.totals.proteins;
        acc.fats += meal.totals.fats;
        acc.calories += meal.totals.calories;
        return acc;
      },
      { carbs: 0, proteins: 0, fats: 0, calories: 0 },
    );
}

// Contagem de refeições: total, no mês de `today` e no dia de `today`.
export function countMeals(meals: Meal[], today: Date) {
  return {
    total: meals.length,
    thisMonth: meals.filter((meal) =>
      isSameLocalMonth(new Date(meal.eatTime), today),
    ).length,
    today: meals.filter((meal) =>
      isSameLocalDay(new Date(meal.eatTime), today),
    ).length,
  };
}
