import { describe, expect, it } from 'vitest';
import { foodToFormValues, validateFoodForm } from './food';

const valid = {
  name: 'Arroz',
  caloriesPer100g: '130',
  carbsPer100g: '28',
  proteinPer100g: '2.7',
  fatPer100g: '0,3',
};

describe('validateFoodForm', () => {
  it('aceita valores válidos, com ponto ou vírgula decimal', () => {
    expect(validateFoodForm({ ...valid, name: '  Arroz  ' })).toEqual({
      ok: true,
      value: {
        name: 'Arroz',
        caloriesPer100g: 130,
        carbsPer100g: 28,
        proteinPer100g: 2.7,
        fatPer100g: 0.3,
      },
    });
  });

  it('aceita zero nos macros', () => {
    expect(validateFoodForm({ ...valid, fatPer100g: '0' }).ok).toBe(true);
  });

  it('rejeita nome vazio ou longo demais', () => {
    expect(validateFoodForm({ ...valid, name: '   ' }).ok).toBe(false);
    expect(validateFoodForm({ ...valid, name: 'x'.repeat(101) }).ok).toBe(false);
  });

  it.each(['', 'abc', '-1', '1e3', '1.2.3', '12 g'])(
    'rejeita macro %j',
    (amount) => {
      const result = validateFoodForm({ ...valid, carbsPer100g: amount });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('Carboidratos');
    },
  );
});

describe('foodToFormValues', () => {
  it('preenche o formulário de edição com os dados do alimento', () => {
    expect(
      foodToFormValues({
        id: 7,
        name: 'Feijão',
        caloriesPer100g: 100,
        carbsPer100g: 14,
        proteinPer100g: 5,
        fatPer100g: 0.5,
      }),
    ).toEqual({
      name: 'Feijão',
      caloriesPer100g: '100',
      carbsPer100g: '14',
      proteinPer100g: '5',
      fatPer100g: '0.5',
    });
  });
});
