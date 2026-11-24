import { describe, expect, it } from 'vitest';
import { calculateBmi, validateProfileForm } from './profile';

describe('validateProfileForm', () => {
  it('aceita valores válidos, com vírgula ou ponto', () => {
    expect(validateProfileForm({ heightCm: '175', weightKg: '72,5' })).toEqual({
      ok: true,
      value: { heightCm: 175, weightKg: 72.5 },
    });
    expect(validateProfileForm({ heightCm: ' 160.5 ', weightKg: '55' })).toEqual({
      ok: true,
      value: { heightCm: 160.5, weightKg: 55 },
    });
  });

  it('aponta o erro de cada campo separadamente', () => {
    const result = validateProfileForm({ heightCm: '', weightKg: 'abc' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.heightCm).toMatch(/Informe a altura/);
      expect(result.errors.weightKg).toMatch(/apenas números/);
    }
  });

  it('rejeita altura em metros e valores fora dos limites', () => {
    for (const values of [
      { heightCm: '1,75', weightKg: '70' },
      { heightCm: '251', weightKg: '70' },
      { heightCm: '175', weightKg: '19' },
      { heightCm: '175', weightKg: '401' },
      { heightCm: '-170', weightKg: '70' },
    ]) {
      expect(validateProfileForm(values).ok).toBe(false);
    }
  });

  it('aceita os limites exatos', () => {
    expect(validateProfileForm({ heightCm: '50', weightKg: '20' }).ok).toBe(true);
    expect(validateProfileForm({ heightCm: '250', weightKg: '400' }).ok).toBe(true);
  });
});

describe('calculateBmi', () => {
  it('calcula o IMC com 1 casa decimal', () => {
    // 70 / 1,75² = 22,857...
    expect(calculateBmi(175, 70)).toEqual({
      value: 22.9,
      category: 'normal',
      label: 'Peso normal',
    });
  });

  it('classifica cada faixa da OMS', () => {
    expect(calculateBmi(180, 55).category).toBe('abaixo'); // 17,0
    expect(calculateBmi(170, 80).category).toBe('sobrepeso'); // 27,7
    expect(calculateBmi(170, 95).category).toBe('obesidade1'); // 32,9
    expect(calculateBmi(170, 105).category).toBe('obesidade2'); // 36,3
    expect(calculateBmi(160, 110).category).toBe('obesidade3'); // 43,0
  });

  it('nas bordas, usa o valor arredondado que aparece na tela', () => {
    // 18,5 exato → Peso normal
    expect(calculateBmi(100, 18.5)).toMatchObject({ value: 18.5, category: 'normal' });
    // 24,96 é mostrado como 25,0 → Sobrepeso
    expect(calculateBmi(100, 24.96)).toMatchObject({ value: 25, category: 'sobrepeso' });
    // 29,94 é mostrado como 29,9 → Sobrepeso
    expect(calculateBmi(100, 29.94)).toMatchObject({ value: 29.9, category: 'sobrepeso' });
  });
});
