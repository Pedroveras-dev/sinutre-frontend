// Regras da meta diária de calorias no frontend.
//
// Os limites são de sanidade da entrada (barram erros de digitação), não uma
// recomendação nutricional. Eles espelham src/constants/calorieGoal.ts do
// backend — a validação do backend é a que vale; esta existe para dar
// resposta imediata ao usuário sem precisar de uma requisição.
export const CALORIE_GOAL_MIN = 500;
export const CALORIE_GOAL_MAX = 10000;

export type CalorieGoalValidation =
  | { ok: true; value: number }
  | { ok: false; error: string };

// Valida o texto digitado no formulário.
// Aceita somente dígitos (inteiro positivo) dentro dos limites.
export function validateCalorieGoalInput(raw: string): CalorieGoalValidation {
  const text = raw.trim();

  if (text === '') {
    return { ok: false, error: 'Informe a meta diária em kcal.' };
  }

  // Só dígitos: rejeita sinal, vírgula, ponto, "e" (1e3) e letras.
  if (!/^\d+$/.test(text)) {
    return {
      ok: false,
      error: 'Use apenas números inteiros, sem ponto ou vírgula (ex.: 2000).',
    };
  }

  const value = Number(text);

  if (value < CALORIE_GOAL_MIN || value > CALORIE_GOAL_MAX) {
    return {
      ok: false,
      error: `A meta deve estar entre ${CALORIE_GOAL_MIN} e ${CALORIE_GOAL_MAX} kcal.`,
    };
  }

  return { ok: true, value };
}

export interface CalorieProgress {
  consumed: number; // kcal consumidas, arredondadas
  percent: number; // 0–100, para a barra de progresso
  status: 'under' | 'reached' | 'over';
  difference: number; // quanto falta (under) ou quanto passou (over)
}

// Compara o consumo do dia com a meta.
export function getCalorieProgress(
  consumedCalories: number,
  goal: number,
): CalorieProgress {
  const consumed = Math.round(consumedCalories);
  const percent = Math.min(100, Math.round((consumed / goal) * 100));

  if (consumed > goal) {
    return { consumed, percent, status: 'over', difference: consumed - goal };
  }

  if (consumed === goal) {
    return { consumed, percent, status: 'reached', difference: 0 };
  }

  return { consumed, percent, status: 'under', difference: goal - consumed };
}
