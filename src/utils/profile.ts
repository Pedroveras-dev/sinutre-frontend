// Altura, peso e IMC no frontend.
//
// Os limites espelham src/constants/profile.ts do backend (que é quem vale);
// aqui servem para avisar o usuário antes de enviar.
export const HEIGHT_CM_MIN = 50;
export const HEIGHT_CM_MAX = 250;
export const WEIGHT_KG_MIN = 20;
export const WEIGHT_KG_MAX = 400;

export interface ProfileFormValues {
  heightCm: string;
  weightKg: string;
}

export type ProfileValidation =
  | { ok: true; value: { heightCm: number; weightKg: number } }
  | { ok: false; errors: Partial<Record<keyof ProfileFormValues, string>> };

// Aceita "72", "72.5" e "72,5". Devolve null se não for um número positivo.
function parseDecimal(raw: string): number | null {
  const text = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

function checkField(
  raw: string,
  label: string,
  unit: string,
  example: string,
  min: number,
  max: number,
): { value: number } | { error: string } {
  if (raw.trim() === '') return { error: `Informe ${label} em ${unit}.` };

  const value = parseDecimal(raw);
  if (value === null) {
    return { error: `Use apenas números (ex.: ${example}).` };
  }
  if (value < min || value > max) {
    return { error: `Valor entre ${min} e ${max} ${unit}.` };
  }
  return { value };
}

// Valida o formulário de altura e peso; as mesmas regras são conferidas de
// novo no backend.
export function validateProfileForm(values: ProfileFormValues): ProfileValidation {
  const height = checkField(
    values.heightCm, 'a altura', 'cm', '175', HEIGHT_CM_MIN, HEIGHT_CM_MAX,
  );
  const weight = checkField(
    values.weightKg, 'o peso', 'kg', '72,5', WEIGHT_KG_MIN, WEIGHT_KG_MAX,
  );

  if ('error' in height || 'error' in weight) {
    return {
      ok: false,
      errors: {
        ...('error' in height ? { heightCm: height.error } : {}),
        ...('error' in weight ? { weightKg: weight.error } : {}),
      },
    };
  }

  return { ok: true, value: { heightCm: height.value, weightKg: weight.value } };
}

export type BmiCategory =
  | 'abaixo'
  | 'normal'
  | 'sobrepeso'
  | 'obesidade1'
  | 'obesidade2'
  | 'obesidade3';

export interface BmiResult {
  value: number; // IMC com 1 casa decimal
  category: BmiCategory;
  label: string; // faixa por extenso
}

// Faixas de IMC para adultos usadas pela OMS.
export const BMI_RANGES: readonly {
  category: BmiCategory;
  label: string;
  min: number; // inclusive
  max: number | null; // exclusivo; null = sem limite
}[] = [
  { category: 'abaixo', label: 'Abaixo do peso', min: 0, max: 18.5 },
  { category: 'normal', label: 'Peso normal', min: 18.5, max: 25 },
  { category: 'sobrepeso', label: 'Sobrepeso', min: 25, max: 30 },
  { category: 'obesidade1', label: 'Obesidade grau I', min: 30, max: 35 },
  { category: 'obesidade2', label: 'Obesidade grau II', min: 35, max: 40 },
  { category: 'obesidade3', label: 'Obesidade grau III', min: 40, max: null },
];

// IMC = peso (kg) / altura (m)². A faixa é decidida pelo valor já
// arredondado, para que o número mostrado e a faixa nunca se contradigam
// (ex.: 24,96 aparece como 25,0 e cai em "Sobrepeso").
export function calculateBmi(heightCm: number, weightKg: number): BmiResult {
  const heightM = heightCm / 100;
  const value = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  const range =
    BMI_RANGES.find((r) => value >= r.min && (r.max === null || value < r.max)) ??
    BMI_RANGES[BMI_RANGES.length - 1];

  return { value, category: range.category, label: range.label };
}
