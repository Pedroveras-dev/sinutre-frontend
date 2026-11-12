import type { Meal } from '@/types/mealSummary';
import { MealListItem } from './MealListItem';

interface MealsListProps {
  meals: Meal[];
  onDelete?: (meal: Meal) => void;
}

export function MealsList({ meals, onDelete }: MealsListProps) {
  return (
    <section className="flex flex-col gap-3 lg:hidden">
      {meals.map(meal => (
        <MealListItem
          key={meal.id}
          meal={meal}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
