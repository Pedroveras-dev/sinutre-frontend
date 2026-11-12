import { useState, useEffect, useMemo, useCallback } from 'react';
import { AddMealCard } from '@/components/cards/AddMealCard';
import { TotalMealsCard } from '@/components/cards/TotalMealsCard';
import {
  CalorieGoalCard,
  type CalorieGoalState,
} from '@/components/cards/CalorieGoalCard';
import { getCalorieGoal } from '@/services/calorieGoalService';
import { Header } from '@/components/layout/Header';
import { MacroStatsBar } from '@/components/macros/MacroStatsBar';
import { MealFab } from '@/components/meals/MealFab';
import { MealsList } from '@/components/meals/MealsList';
import { MealsTable } from '@/components/meals/MealsTable';
import { AddMealModal } from '@/components/modal/AddMealModal';
import { useAuth } from '@/context/AuthContext';
import { Meal } from '@/types/mealSummary';
import { api } from '@/lib/api';

import {
  //MACRO_SUMMARY,
  //MEALS_SUMMARY,
  // RECENT_MEALS,
  // SAMPLE_MEAL_ITEMS,
} from '@/data/mockData';
import { useMealModal } from '@/hooks/useMealModal';
import { countMeals, sumMacrosOfDay } from '@/utils/mealSummary';

interface DashboardPageProps {
  drawerId: string;
}

//const MODAL_MACROS = {
//  carbs: 0,
//  proteins: 0,
//  fats: 0,
//  calories: 0,
//};

export function DashboardPage({ drawerId }: DashboardPageProps) {
  const { user } = useAuth();
  const modal = useMealModal();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMeals() {
    try {
      const response = await api.get('/meals');
      setMeals(response.data);
    } finally {
      setLoading(false);
    }
  }

  // Meta diária do usuário, carregada do backend (antes era um valor fixo).
  // Fica separada das refeições: se a meta falhar, o resto do dashboard
  // continua funcionando e o card oferece "Tentar novamente".
  const [goalState, setGoalState] = useState<CalorieGoalState>({
    status: 'loading',
  });

  const loadGoal = useCallback(async () => {
    setGoalState({ status: 'loading' });
    try {
      const goal = await getCalorieGoal();
      setGoalState({ status: 'ready', goal: goal.caloriesGoal });
    } catch {
      setGoalState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    loadMeals();
    loadGoal();
  }, [loadGoal]);

  // "Hoje" é o dia do calendário no fuso do navegador (ver utils/date.ts).
  const mealsSummary = useMemo(() => countMeals(meals, new Date()), [meals]);

  const macroSummary = useMemo(
    () => ({
      ...sumMacrosOfDay(meals, new Date()),
      caloriesGoal: goalState.status === 'ready' ? goalState.goal : null,
    }),
    [meals, goalState],
  );

  // Só depois de todos os hooks: hooks não podem ficar após um return.
  if (!user) {
    return <></>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="text-gray-500">Carregando...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8">
        <Header
          drawerId={drawerId}
          userName={user.name}
          avatarUrl={user.avatarUrl}
        />

        <MacroStatsBar summary={macroSummary} />

        <CalorieGoalCard
          consumedCalories={macroSummary.calories}
          goalState={goalState}
          onRetry={loadGoal}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-stretch">
          <TotalMealsCard summary={mealsSummary} />
          <AddMealCard onSelectCategory={modal.openWith} />
        </div>

        <MealsTable meals={meals} />
        <MealsList meals={meals} />
      </div>

      <MealFab onSelectCategory={modal.openWith} />

      <AddMealModal
        open={modal.open}
        typeMeal={modal.selectedCategory}
        onClose={modal.close}
        onSave={modal.close}
        onMealCreated={loadMeals}
      />
    </>
  );
}
