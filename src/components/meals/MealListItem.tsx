import { Trash } from '@phosphor-icons/react';
import { MEAL_CATEGORY_BY_ID } from '@/constants/mealCategories';
import type { Meal } from '@/types/mealSummary';
import { formatDate } from '@/utils/date';

interface MealListItemProps {
  meal: Meal;
  onDelete?: (meal: Meal) => void;
}

export function MealListItem({ meal, onDelete }: MealListItemProps) {
  const category = MEAL_CATEGORY_BY_ID[meal.type];
  const Icon = category.Icon;

  return (
    <article className="card card-side bg-base-100 shadow-sm">
      <div className="card-body p-4 flex-row items-center gap-4">
        <div className="bg-primary/10 text-primary rounded-full p-2">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{category.label}</p>
          <p className="font-semibold text-sm">{meal.name}</p>
          <p className="text-xs text-base-content/50">{formatDate(meal.eatTime)}</p>
        </div>
        <span className="badge badge-primary badge-outline badge-sm">
          {Math.round(meal.totals.calories)} kcal
        </span>
        <button
          type="button"
          onClick={() => onDelete?.(meal)}
          className="btn btn-ghost btn-sm btn-square text-error"
          aria-label={`Apagar refeição ${meal.name ?? ''}`}
          title="Apagar refeição"
        >
          <Trash size={18} />
        </button>
      </div>
    </article>
  );
}
