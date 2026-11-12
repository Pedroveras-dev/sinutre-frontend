import { Trash } from '@phosphor-icons/react';
import { MEAL_CATEGORY_BY_ID } from '@/constants/mealCategories';
import type { Meal } from '@/types/mealSummary';
import { formatDate } from '@/utils/date';

interface MealsTableRowProps {
  meal: Meal;
  onDelete?: (meal: Meal) => void;
}

export function MealsTableRow({ meal, onDelete }: MealsTableRowProps) {
  const category = MEAL_CATEGORY_BY_ID[meal.type];

  return (
    <tr className="hover">
      <td className="text-center font-bold text-base-content/60">{meal.id}</td>
      <td className="font-medium">{meal.name}</td>
      <td className="font-medium">{formatDate(meal.eatTime)}</td>
      <td className="font-semibold">{category.label}</td>
      <td>
        <span className="badge badge-primary badge-outline">
          {Math.round(meal.totals.calories)} kcal
        </span>
      </td>
      <td className="text-center">
        <button
          type="button"
          onClick={() => onDelete?.(meal)}
          className="btn btn-sm btn-ghost btn-square text-error"
          aria-label={`Apagar refeição ${meal.name ?? ''}`}
          title="Apagar refeição"
        >
          <Trash size={18} />
        </button>
      </td>
    </tr>
  );
}
