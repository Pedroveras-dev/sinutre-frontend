import type { Food } from '@/types/food';

export const FOOD_NAME_MAX_LENGTH = 100;

// Valores do formulário de alimento, como texto (o que o usuário digitou).
export interface FoodFormValues {
  name: string;
  caloriesPer100g: string;
  carbsPer100g: string;
  proteinPer100g: string;
  fatPer100g: string;
}

export const EMPTY_FOOD_FORM: FoodFormValues = {
  name: '',
  caloriesPer100g: '',
  carbsPer100g: '',
  proteinPer100g: '',
  fatPer100g: '',
};

export function foodToFormValues(food: Food): FoodFormValues {
  return {
    name: food.name,
    caloriesPer100g: String(food.caloriesPer100g),
    carbsPer100g: String(food.carbsPer100g),
    proteinPer100g: String(food.proteinPer100g),
    fatPer100g: String(food.fatPer100g),
  };
}

export type FoodFormValidation =
  | { ok: true; value: Omit<Food, 'id'> }
  | { ok: false; error: string };

// Aceita "12", "12.5" e "12,5" (vírgula decimal). Devolve null se inválido.
function parseAmount(raw: string): number | null {
  const text = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

const AMOUNT_FIELDS = [
  ['caloriesPer100g', 'Calorias'],
  ['carbsPer100g', 'Carboidratos'],
  ['proteinPer100g', 'Proteínas'],
  ['fatPer100g', 'Gorduras'],
] as const;

// Valida o formulário de alimento (cadastro e edição).
// As mesmas regras são conferidas de novo no backend.
export function validateFoodForm(values: FoodFormValues): FoodFormValidation {
  const name = values.name.trim();

  if (name === '') {
    return { ok: false, error: 'Informe o nome do alimento.' };
  }

  if (name.length > FOOD_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `O nome pode ter até ${FOOD_NAME_MAX_LENGTH} caracteres.`,
    };
  }

  const amounts = {} as Record<(typeof AMOUNT_FIELDS)[number][0], number>;

  for (const [field, label] of AMOUNT_FIELDS) {
    const amount = parseAmount(values[field]);
    if (amount === null) {
      return {
        ok: false,
        error: `${label} por 100 g: informe um número maior ou igual a zero.`,
      };
    }
    amounts[field] = amount;
  }

  return { ok: true, value: { name, ...amounts } };
}
