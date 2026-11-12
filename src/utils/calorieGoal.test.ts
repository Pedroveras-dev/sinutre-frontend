import { describe, expect, it } from 'vitest';
import { getCalorieProgress, validateCalorieGoalInput } from './calorieGoal';

describe('validateCalorieGoalInput', () => {
  it('aceita inteiros dentro dos limites', () => {
    expect(validateCalorieGoalInput('2000')).toEqual({ ok: true, value: 2000 });
    expect(validateCalorieGoalInput(' 500 ')).toEqual({ ok: true, value: 500 });
    expect(validateCalorieGoalInput('10000')).toEqual({ ok: true, value: 10000 });
  });

  it.each(['', '   ', 'abc', '-2000', '+2000', '1800.5', '1800,5', '2.000', '1e3', '0', '499', '10001'])(
    'rejeita %j',
    (input) => {
      expect(validateCalorieGoalInput(input).ok).toBe(false);
    },
  );
});

describe('getCalorieProgress', () => {
  it('abaixo da meta: informa quanto falta', () => {
    expect(getCalorieProgress(1250.4, 2000)).toEqual({
      consumed: 1250,
      percent: 63,
      status: 'under',
      difference: 750,
    });
  });

  it('sem consumo: falta a meta inteira', () => {
    expect(getCalorieProgress(0, 2000)).toMatchObject({
      percent: 0,
      status: 'under',
      difference: 2000,
    });
  });

  it('meta atingida exatamente', () => {
    expect(getCalorieProgress(2000, 2000)).toMatchObject({
      percent: 100,
      status: 'reached',
      difference: 0,
    });
  });

  it('acima da meta: informa o excesso e limita a barra em 100%', () => {
    expect(getCalorieProgress(2600, 2000)).toEqual({
      consumed: 2600,
      percent: 100,
      status: 'over',
      difference: 600,
    });
  });
});
