import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../forms/FormField';

import { FoodItem } from '@/types/meal';
import { Food } from '@/types/food';
import { searchFoods } from '@/services/foodService';

interface MealItemFormProps {
  onAdd: (item: FoodItem) => void;
  // Ids dos alimentos que já estão na refeição (não podem repetir).
  addedFoodIds: number[];
}


export function MealItemForm({ onAdd, addedFoodIds }: MealItemFormProps) {
  const [query, setQuery] = useState('');

  const [foods, setFoods] = useState<Food[]>([]);

  const [selectedFood, setSelectedFood] =
    useState<Food | null>(null);

  const [grams, setGrams] = useState('');

  // 'idle' = sem busca; 'searching' = aguardando; 'done' = busca concluída.
  const [searchStatus, setSearchStatus] =
    useState<'idle' | 'searching' | 'done'>('idle');

  // Motivo pelo qual o item não pôde ser adicionado (antes falhava em silêncio).
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!selectedFood) {
      setError(
        query.trim() === ''
          ? 'Digite o nome de um alimento e escolha-o na lista.'
          : 'Escolha um alimento da lista de sugestões. Se ele não aparecer, cadastre-o antes na página Dieta.',
      );
      return;
    }

    // A mesma refeição não pode ter o mesmo alimento duas vezes
    // (chave composta mealId + foodId no banco).
    if (addedFoodIds.includes(selectedFood.id)) {
      setError(
        `"${selectedFood.name}" já está nesta refeição. Remova o item para mudar a quantidade.`,
      );
      return;
    }

    const gramsValue = Number(grams);

    if (!Number.isFinite(gramsValue) || gramsValue <= 0) {
      setError('Informe a quantidade em gramas (maior que zero).');
      return;
    }

    setError(null);

    onAdd({
        id: Date.now(),

        foodId: selectedFood.id,

        name: selectedFood.name,

        grams: gramsValue,

        calories:
          (selectedFood.caloriesPer100g *
            gramsValue) /
          100,

        carbs:
          (selectedFood.carbsPer100g *
            gramsValue) /
          100,

        protein:
          (selectedFood.proteinPer100g *
            gramsValue) /
          100,

        fat:
          (selectedFood.fatPer100g *
            gramsValue) /
          100,
      });

      setSelectedFood(null);
      setQuery('');
      setGrams('');
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      setFoods([]);
      setSearchStatus('idle');
      return;
    }

    setSearchStatus('searching');

    const timeout = setTimeout(async () => {
      try {
        const result = await searchFoods(query.trim());
        setFoods(result);
      } catch {
        setFoods([]);
      } finally {
        setSearchStatus('done');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const noResults =
    !selectedFood && searchStatus === 'done' && foods.length === 0;

  return (
    <div className="grid gap-4 items-end lg:[grid-template-columns:1fr_150px_120px]">
      <div className="relative">
        
        <FormField
          label="Alimento"
          htmlFor="item-name"
        >
          <input
            id="item-name"
            type="text"
            value={
              selectedFood?.name ?? query
            }
            placeholder="Digite um alimento"
            className="input input-bordered w-full"
            onChange={(e) => {
              setSelectedFood(null);
              setQuery(e.target.value);
              setError(null);
            }}
          />
        </FormField>

        {!selectedFood &&
          foods.length > 0 && (
            <ul className="absolute z-50 bg-base-100 border rounded-box shadow w-full mt-1 max-h-60 overflow-auto">

              {foods.map((food) => (
                <li
                  key={food.id}
                  className="px-4 py-2 hover:bg-base-200 cursor-pointer"
                  onClick={() => {
                    setSelectedFood(food);
                    setQuery(food.name);
                    setFoods([]);
                  }}
                >
                  {food.name}
                </li>
              ))}
            </ul>
          )}
      </div>

      <FormField
        label="Gramas"
        htmlFor="item-grams"
      >
        <input
          id="item-grams"
          type="number"
          className="input input-bordered w-full"
          value={grams}
          onChange={(e) => {
            setGrams(e.target.value);
            setError(null);
          }}
        />
      </FormField>

      <button type="button" className="btn btn-primary btn-outline h-12"  onClick={handleAdd}>
        Adicionar
      </button>

      {(noResults || error) && (
        <div className="lg:col-span-3 text-sm" aria-live="polite">
          {noResults && (
            <p className="text-base-content/70">
              Nenhum alimento encontrado para "{query.trim()}".{' '}
              <Link to="/foods" className="link link-primary">
                Cadastre-o na página Dieta
              </Link>{' '}
              e volte para adicionar a refeição.
            </p>
          )}
          {error && (
            <p role="alert" className="text-error">
              {error}
            </p>
          )}
        </div>
      )}

    </div>
  );
}