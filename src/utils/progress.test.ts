import { describe, expect, it } from 'vitest';
import type { Meal } from '@/types/mealSummary';
import { buildDailySeries, summarizeSeries } from './progress';

function meal(id: number, eatTime: Date, calories: number): Meal {
  return {
    id,
    name: `refeição ${id}`,
    type: 'lunch',
    createdAt: eatTime.toISOString(),
    eatTime: eatTime.toISOString(),
    totals: { grams: 100, calories, carbs: 0, proteins: 0, fats: 0 },
    items: [],
  };
}

const today = new Date(2026, 10, 12, 14, 0); // 12/11/2026

const meals = [
  meal(1, new Date(2026, 10, 12, 8, 0), 700),
  meal(2, new Date(2026, 10, 12, 20, 0), 800),
  meal(3, new Date(2026, 10, 11, 12, 0), 2600),
  meal(4, new Date(2026, 10, 6, 0, 0), 500), // primeiro dia da janela
  meal(5, new Date(2026, 10, 5, 23, 59), 9000), // um dia antes da janela
  meal(6, new Date(2026, 10, 13, 0, 5), 9000), // amanhã
];

describe('buildDailySeries', () => {
  it('devolve 7 dias em ordem, terminando hoje, incluindo dias vazios', () => {
    const series = buildDailySeries(meals, today);

    expect(series).toHaveLength(7);
    expect(series.map((d) => d.date.getDate())).toEqual([6, 7, 8, 9, 10, 11, 12]);
    expect(series.map((d) => d.calories)).toEqual([500, 0, 0, 0, 0, 2600, 1500]);
    expect(series.map((d) => d.mealsCount)).toEqual([1, 0, 0, 0, 0, 1, 2]);
  });

  it('ignora refeições fora da janela (antes dela e no futuro)', () => {
    const total = buildDailySeries(meals, today).reduce((s, d) => s + d.calories, 0);
    expect(total).toBe(4600);
  });

  it('atravessa a virada de mês e de ano', () => {
    const series = buildDailySeries([], new Date(2027, 0, 2, 10, 0));
    expect(series.map((d) => `${d.date.getDate()}/${d.date.getMonth() + 1}`)).toEqual([
      '27/12', '28/12', '29/12', '30/12', '31/12', '1/1', '2/1',
    ]);
  });
});

describe('summarizeSeries', () => {
  const series = buildDailySeries(meals, today);

  it('calcula média só dos dias com registro e os dias dentro da meta', () => {
    expect(summarizeSeries(series, 2000)).toEqual({
      totalMeals: 4,
      daysWithMeals: 3,
      averageCalories: 1533, // (500 + 2600 + 1500) / 3
      daysWithinGoal: 2, // 500 e 1500; 2600 passou
    });
  });

  it('conta como dentro da meta o dia que bate exatamente nela', () => {
    expect(summarizeSeries(series, 1500).daysWithinGoal).toBe(2);
  });

  it('sem meta: daysWithinGoal é null', () => {
    expect(summarizeSeries(series, null).daysWithinGoal).toBeNull();
  });

  it('sem refeições no período: média null e zeros', () => {
    expect(summarizeSeries(buildDailySeries([], today), 2000)).toEqual({
      totalMeals: 0,
      daysWithMeals: 0,
      averageCalories: null,
      daysWithinGoal: 0,
    });
  });
});
