import axios from 'axios';
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

// Extrai a mensagem { error } devolvida pelo backend, com um texto padrão
// para falhas de rede ou respostas inesperadas.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === 'string') return message;
  }
  return fallback;
}
