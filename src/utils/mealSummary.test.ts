import { describe, expect, it } from 'vitest';
import type { Meal } from '@/types/mealSummary';
import { isSameLocalDay, localDateTimeToISO } from './date';
import { countMeals, sumMacrosOfDay } from './mealSummary';

// As datas são criadas com o construtor local (ano, mês-1, dia, hora) e
// convertidas para ISO, como o backend devolve. Assim o teste passa em
// qualquer fuso horário.
function meal(id: number, eatTime: Date, calories: number): Meal {
  return {
    id,
    name: `refeição ${id}`,
    type: 'lunch',
    createdAt: eatTime.toISOString(),
    eatTime: eatTime.toISOString(),
    totals: { grams: 100, calories, carbs: 10, proteins: 5, fats: 2 },
    items: [],
  };
}

const today = new Date(2026, 10, 11, 15, 0); // quarta, 11/11/2026

describe('isSameLocalDay', () => {
  it('considera o mesmo dia do início ao fim', () => {
    expect(isSameLocalDay(new Date(2026, 10, 11, 0, 0), today)).toBe(true);
    expect(isSameLocalDay(new Date(2026, 10, 11, 23, 59), today)).toBe(true);
  });

  it('não confunde com o mesmo dia da semana de outra semana', () => {
    // 04/11/2026 e 18/11/2026 também são quartas-feiras (bug do getDay()).
    expect(isSameLocalDay(new Date(2026, 10, 4, 12, 0), today)).toBe(false);
    expect(isSameLocalDay(new Date(2026, 10, 18, 12, 0), today)).toBe(false);
  });

  it('diferencia ontem, amanhã, outro mês e outro ano', () => {
    expect(isSameLocalDay(new Date(2026, 10, 10, 23, 59), today)).toBe(false);
    expect(isSameLocalDay(new Date(2026, 10, 12, 0, 0), today)).toBe(false);
    expect(isSameLocalDay(new Date(2026, 9, 11, 12, 0), today)).toBe(false);
    expect(isSameLocalDay(new Date(2025, 10, 11, 12, 0), today)).toBe(false);
  });
});

describe('sumMacrosOfDay', () => {
  const meals = [
    meal(1, new Date(2026, 10, 11, 8, 0), 300),
    meal(2, new Date(2026, 10, 11, 23, 30), 700),
    meal(3, new Date(2026, 10, 4, 12, 0), 5000), // quarta passada
    meal(4, new Date(2026, 10, 10, 20, 0), 900), // ontem
    meal(5, new Date(2026, 10, 12, 0, 5), 400), // amanhã
  ];

  it('soma só as refeições do dia, sem misturar outros dias', () => {
    expect(sumMacrosOfDay(meals, today)).toEqual({
      calories: 1000,
      carbs: 20,
      proteins: 10,
      fats: 4,
    });
  });

  it('devolve zeros quando não há refeições no dia', () => {
    expect(sumMacrosOfDay(meals, new Date(2026, 0, 1)).calories).toBe(0);
    expect(sumMacrosOfDay([], today).calories).toBe(0);
  });
});

describe('countMeals', () => {
  it('conta total, mês e dia', () => {
    const meals = [
      meal(1, new Date(2026, 10, 11, 8, 0), 300),
      meal(2, new Date(2026, 10, 4, 12, 0), 500),
      meal(3, new Date(2026, 9, 11, 12, 0), 500),
    ];
    expect(countMeals(meals, today)).toEqual({ total: 3, thisMonth: 2, today: 1 });
  });
});

describe('localDateTimeToISO', () => {
  it('converte o valor do datetime-local preservando o instante local', () => {
    const iso = localDateTimeToISO('2026-11-11T12:30');
    expect(iso).not.toBeNull();
    const date = new Date(iso!);
    expect(date.getHours()).toBe(12);
    expect(date.getMinutes()).toBe(30);
    expect(date.getDate()).toBe(11);
  });

  it('devolve null para vazio ou inválido', () => {
    expect(localDateTimeToISO('')).toBeNull();
    expect(localDateTimeToISO('abc')).toBeNull();
  });
});
