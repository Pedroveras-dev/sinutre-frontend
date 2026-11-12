import { useState, useMemo } from 'react';
import type { FoodItem } from '@/types/meal';
import { MealItemForm } from './MealItemForm';
import { MealItemsTable } from './MealItemsTable';
import { MealMacrosSummary } from './MealMacrosSummary';
import { MealMetadataForm } from './MealMetadataForm';
import { MealCategory } from '@/types/meal';
import { MEAL_CATEGORY_BY_ID } from '@/constants/mealCategories';
import { createMeal } from '@/services/mealService';

import { MealState } from '@/types/meal';
import { localDateTimeToISO } from '@/utils/date';

interface AddMealModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  typeMeal: MealCategory | null;
  onMealCreated: () => Promise<void>;
}


// O modal só existe enquanto há uma categoria escolhida. Separar em dois
// componentes mantém os hooks fora de um `if` (regra dos hooks) e faz o
// formulário começar limpo a cada abertura, já que o conteúdo é desmontado.
export function AddMealModal(props: AddMealModalProps) {
  if (!props.typeMeal) {
    return null;
  }

  return <AddMealModalContent {...props} typeMeal={props.typeMeal} />;
}

function AddMealModalContent({
  open,
  typeMeal,
  onClose,
  onMealCreated,
}: AddMealModalProps & { typeMeal: MealCategory }) {
  const category = MEAL_CATEGORY_BY_ID[typeMeal];

  const [meal, setMeal] = useState<MealState>({
    description: '',
    type: category.id,
    eatTime: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<FoodItem[]>([]);

  function handleAddItem(
    item: FoodItem,
  ) {
    setItems((current) => [
      ...current,
      item,
    ]);
  }

  function handleRemoveItem(
    item: FoodItem,
  ) {
    setItems((current) =>
      current.filter(
        (x) => x.id !== item.id,
      ),
    );
  }

  async function handleSaveMeal() {
    // O datetime-local não tem fuso; convertemos para ISO (UTC) no navegador
    // para o backend gravar o instante correto em qualquer servidor.
    const eatTime = localDateTimeToISO(meal.eatTime);

    if (!eatTime) {
      setError('Informe a data e o horário da refeição.');
      return;
    }

    if (items.length === 0) {
      setError('Adicione ao menos um alimento à refeição.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createMeal({
        ...meal,
        eatTime,
        items: items.map((item) => ({
          foodId: item.foodId,
          grams: item.grams,
        })),
      });

      await onMealCreated();

      onClose();
    } catch {
      setError('Não foi possível salvar a refeição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const macros = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.carbs += item.carbs;
          acc.proteins += item.protein;
          acc.fats += item.fat;
          acc.calories += item.calories;

          return acc;
        },
        {
          carbs: 0,
          proteins: 0,
          fats: 0,
          calories: 0,
          caloriesGoal: 0,
        },
      ),
    [items],
  );


  return (
    <div className={`modal ${open ? 'modal-open' : ''}`} role="dialog">
      <div className="modal-box max-w-6xl">
        <h2 className="text-3xl font-semibold mb-6">Adicionar Refeição</h2>
        
        <MealMacrosSummary macros={macros} />
        <MealMetadataForm meal={meal} setMeal={setMeal} />

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Itens da Refeição</h3>
          <MealItemForm onAdd={handleAddItem} />
        </div>

        <MealItemsTable items={items} onRemove={handleRemoveItem} />

        {error && (
          <div role="alert" className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveMeal}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar refeição'}
          </button>
        </div>
      </div>
    </div>
  );
}
