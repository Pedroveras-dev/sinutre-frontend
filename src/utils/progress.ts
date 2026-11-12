import type { Meal } from '@/types/mealSummary';
import { isSameLocalDay } from './date';

// Calorias de um dia do calendário (fuso do navegador).
export interface DayCalories {
  date: Date; // meia-noite local do dia
  calories: number;
  mealsCount: number;
}

// Monta a série dos últimos `days` dias, do mais antigo até `today`
// (inclusive). Dias sem refeição entram com zero, para o gráfico não pular
// datas.
export function buildDailySeries(
  meals: Meal[],
  today: Date,
  days = 7,
): DayCalories[] {
  const series: DayCalories[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    // O construtor local trata sozinho a virada de mês e de ano.
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset,
    );

    const mealsOfDay = meals.filter((meal) =>
      isSameLocalDay(new Date(meal.eatTime), date),
    );

    series.push({
      date,
      calories: mealsOfDay.reduce((sum, meal) => sum + meal.totals.calories, 0),
      mealsCount: mealsOfDay.length,
    });
  }

  return series;
}

export interface SeriesSummary {
  totalMeals: number;
  daysWithMeals: number;
  // Média de calorias considerando só os dias com alguma refeição registrada
  // (dias vazios puxariam a média para baixo sem significar "comeu pouco").
  // null quando não há nenhum registro no período.
  averageCalories: number | null;
  // Dias com registro em que o consumo ficou em até 100% da meta.
  // null quando o usuário não tem meta definida.
  daysWithinGoal: number | null;
}

export function summarizeSeries(
  series: DayCalories[],
  goal: number | null,
): SeriesSummary {
  const recorded = series.filter((day) => day.mealsCount > 0);
  const totalCalories = recorded.reduce((sum, day) => sum + day.calories, 0);

  return {
    totalMeals: recorded.reduce((sum, day) => sum + day.mealsCount, 0),
    daysWithMeals: recorded.length,
    averageCalories:
      recorded.length === 0 ? null : Math.round(totalCalories / recorded.length),
    daysWithinGoal:
      goal === null
        ? null
        : recorded.filter((day) => Math.round(day.calories) <= goal).length,
  };
}
