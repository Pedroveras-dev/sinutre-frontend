import { api } from '@/lib/api';

export async function createMeal(
  meal: {
    type: string;
    eatTime: string;
    description?: string;

    items: {
      foodId: number;
      grams: number;
    }[];
  },
) {
  return api.post('/meals', meal);
}

// Apaga a refeição e os itens dela.
export async function deleteMeal(id: number) {
  await api.delete(`/meals/${id}`);
}
