import { api } from '@/lib/api';

// Resposta de GET/PUT /calorie-goal.
// caloriesGoal = null: o usuário ainda não definiu uma meta.
export interface CalorieGoal {
  caloriesGoal: number | null;
  updatedAt: string | null;
  limits: { min: number; max: number };
}

// O usuário é identificado pelo token (interceptor em lib/api.ts);
// nenhum userId é enviado pelo frontend.
export async function getCalorieGoal() {
  const response = await api.get<CalorieGoal>('/calorie-goal');
  return response.data;
}

export async function updateCalorieGoal(caloriesGoal: number) {
  const response = await api.put<CalorieGoal>('/calorie-goal', {
    caloriesGoal,
  });
  return response.data;
}
