import { useState } from 'react';
import type { FormEvent } from 'react';

import { getApiErrorMessage } from '@/lib/api';
import { createFood, updateFood } from '@/services/foodService';
import type { Food } from '@/types/food';
import {
  EMPTY_FOOD_FORM,
  FOOD_NAME_MAX_LENGTH,
  foodToFormValues,
  validateFoodForm,
  type FoodFormValues,
} from '@/utils/food';

interface FoodFormModalProps {
  open: boolean;
  food: Food | null; // null = cadastrar um alimento novo; senão, editar este
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

// Modal de cadastro e edição de alimento. O conteúdo fica em outro componente
// para ser desmontado ao fechar: cada abertura começa com o formulário limpo
// (ou preenchido com o alimento escolhido).
export function FoodFormModal(props: FoodFormModalProps) {
  if (!props.open) {
    return null;
  }

  return <FoodFormModalContent {...props} />;
}

const AMOUNT_FIELDS = [
  ['caloriesPer100g', 'Calorias (kcal)'],
  ['carbsPer100g', 'Carboidratos (g)'],
  ['proteinPer100g', 'Proteínas (g)'],
  ['fatPer100g', 'Gorduras (g)'],
] as const;

function FoodFormModalContent({ food, onClose, onSaved }: FoodFormModalProps) {
  const isEditing = food !== null;

  const [values, setValues] = useState<FoodFormValues>(
    food ? foodToFormValues(food) : EMPTY_FOOD_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof FoodFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validation = validateFoodForm(values);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      if (food) {
        await updateFood(food.id, validation.value);
      } else {
        await createFood(validation.value);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Não foi possível salvar o alimento. Tente novamente.',
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-form-title"
    >
      <form className="modal-box" onSubmit={handleSubmit} noValidate>
        <h3 id="food-form-title" className="font-bold text-lg">
          {isEditing ? 'Editar alimento' : 'Novo alimento'}
        </h3>

        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="food-name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="food-name"
              className="input input-bordered w-full"
              placeholder="Ex.: Arroz branco cozido"
              maxLength={FOOD_NAME_MAX_LENGTH}
              value={values.name}
              disabled={saving}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>

          <p className="text-xs text-base-content/60">
            Valores para cada 100 g do alimento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AMOUNT_FIELDS.map(([field, label]) => (
              <div key={field} className="flex flex-col gap-1">
                <label htmlFor={`food-${field}`} className="text-sm font-medium">
                  {label}
                </label>
                <input
                  id={`food-${field}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  className="input input-bordered w-full"
                  placeholder="0"
                  value={values[field]}
                  disabled={saving}
                  onChange={(e) => setField(field, e.target.value)}
                />
              </div>
            ))}
          </div>

          {isEditing && (
            <p className="text-xs text-base-content/60">
              As refeições já registradas mantêm os valores da época em que
              foram criadas; a alteração vale para as próximas.
            </p>
          )}

          {error && (
            <div role="alert" className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <span className="loading loading-spinner loading-sm" />}
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
