import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
import { FoodFormModal } from '@/components/modal/FoodFormModal';

import { getApiErrorMessage } from '@/lib/api';
import { deleteFood, getFoods } from '@/services/foodService';
import type { Food } from '@/types/food';

type LoadStatus = 'loading' | 'error' | 'ready';

// Qual modal de formulário está aberto: fechado, novo alimento ou edição.
type FormState = { open: false } | { open: true; food: Food | null };

export function DietFoodPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const [form, setForm] = useState<FormState>({ open: false });

  // Alimento aguardando confirmação para ser apagado.
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadFoods = useCallback(async () => {
    try {
      setFoods(await getFoods());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  function closeDeleteDialog() {
    setFoodToDelete(null);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    if (!foodToDelete) return;

    setDeleting(true);
    try {
      await deleteFood(foodToDelete.id);
      await loadFoods();
      closeDeleteDialog();
    } catch (error) {
      // Ex.: 409 — o alimento é usado em refeições (a mensagem vem do backend).
      setDeleteError(
        getApiErrorMessage(
          error,
          'Não foi possível apagar o alimento. Tente novamente.',
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <SimpleHeader title="Dieta" subtitle="Gerencie seus alimentos" />

      {status === 'loading' && (
        <div className="flex items-center gap-3 mt-6 text-base-content/60" role="status">
          <span className="loading loading-spinner loading-md" />
          Carregando alimentos...
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="alert alert-error mt-6">
          <span>Não foi possível carregar seus alimentos.</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setStatus('loading');
              loadFoods();
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {status === 'ready' && foods.length === 0 && (
        <div className="card bg-base-100 shadow-sm mt-6">
          <div className="card-body items-center text-center">
            <p className="font-medium">Você ainda não cadastrou nenhum alimento.</p>
            <p className="text-sm text-base-content/60">
              Cadastre os alimentos que costuma comer para usá-los nas refeições.
            </p>
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => setForm({ open: true, food: null })}
            >
              Cadastrar alimento
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && foods.length > 0 && (
        <ul className="grid gap-4 mt-6 mb-24">
          {foods.map((food) => (
            <li key={food.id} className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="card-title break-words min-w-0">{food.name}</h2>

                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square"
                      aria-label={`Editar ${food.name}`}
                      title="Editar"
                      onClick={() => setForm({ open: true, food })}
                    >
                      <PencilSimple size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-error"
                      aria-label={`Apagar ${food.name}`}
                      title="Apagar"
                      onClick={() => setFoodToDelete(food)}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <span>🔥 {food.caloriesPer100g} kcal</span>
                  <span>🍞 {food.carbsPer100g} g</span>
                  <span>🍗 {food.proteinPer100g} g</span>
                  <span>🥑 {food.fatPer100g} g</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 shadow-lg z-40"
        aria-label="Cadastrar alimento"
        onClick={() => setForm({ open: true, food: null })}
      >
        <Plus size={24} weight="bold" />
      </button>

      <FoodFormModal
        open={form.open}
        food={form.open ? form.food : null}
        onClose={() => setForm({ open: false })}
        onSaved={loadFoods}
      />

      <ConfirmDialog
        open={foodToDelete !== null}
        title="Apagar alimento"
        message={`Apagar "${foodToDelete?.name ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Apagar"
        busy={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
