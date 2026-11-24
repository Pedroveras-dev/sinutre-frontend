import { Link } from 'react-router-dom';

import { BMI_RANGES, calculateBmi } from '@/utils/profile';
import type { BmiCategory } from '@/utils/profile';

// Cor de cada faixa: normal em verde, limítrofes em amarelo, obesidade em
// vermelho. Usa as cores do tema, então acompanha a troca de aparência.
const CATEGORY_STYLE: Record<BmiCategory, { badge: string; bar: string }> = {
  abaixo: { badge: 'badge-warning', bar: 'bg-warning' },
  normal: { badge: 'badge-success', bar: 'bg-success' },
  sobrepeso: { badge: 'badge-warning', bar: 'bg-warning' },
  obesidade1: { badge: 'badge-error', bar: 'bg-error' },
  obesidade2: { badge: 'badge-error', bar: 'bg-error' },
  obesidade3: { badge: 'badge-error', bar: 'bg-error' },
};

function formatBmi(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function rangeText(min: number, max: number | null) {
  if (min === 0) return `menor que ${formatBmi(max!)}`;
  if (max === null) return `${formatBmi(min)} ou mais`;
  return `${formatBmi(min)} a ${formatBmi(max - 0.1)}`;
}

interface BmiCardProps {
  heightCm: number | null;
  weightKg: number | null;
}

// IMC (índice de massa corporal) a partir da altura e do peso cadastrados.
export function BmiCard({ heightCm, weightKg }: BmiCardProps) {
  if (heightCm === null || weightKg === null) {
    return (
      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base-content/80 text-sm">IMC</h2>
          <p className="font-medium">Cadastre sua altura e peso para ver o IMC.</p>
          <div>
            <Link to="/settings" className="btn btn-primary btn-sm mt-1">
              Ir para Configurações
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const bmi = calculateBmi(heightCm, weightKg);
  const currentRange = BMI_RANGES.find((range) => range.category === bmi.category)!;

  return (
    <section className="card bg-base-100 shadow-sm" data-testid="bmi-card">
      <div className="card-body gap-3">
        <h2 className="card-title text-base-content/80 text-sm">IMC</h2>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl font-bold">{formatBmi(bmi.value)}</span>
          <span className={`badge badge-lg ${CATEGORY_STYLE[bmi.category].badge}`}>
            {bmi.label}
          </span>
        </div>
        <p className="text-sm text-base-content/60">
          {heightCm.toLocaleString('pt-BR')} cm e {weightKg.toLocaleString('pt-BR')} kg ·{' '}
          <Link to="/settings" className="link">
            alterar
          </Link>
        </p>

        {/* Escala com as faixas; a faixa atual fica destacada. */}
        <ol className="grid grid-cols-6 gap-1 mt-1" aria-label="Faixas de IMC">
          {BMI_RANGES.map((range) => {
            const active = range.category === bmi.category;
            return (
              <li key={range.category} className="flex flex-col gap-1 min-w-0">
                <span
                  className={`h-2 rounded-full ${
                    active ? CATEGORY_STYLE[range.category].bar : 'bg-base-300'
                  }`}
                />
                {/* No celular os nomes não cabem lado a lado: ficam só as
                    barras, e a faixa atual é escrita logo abaixo. */}
                <span
                  className={`hidden sm:block text-xs leading-tight ${
                    active ? 'font-semibold' : 'text-base-content/50'
                  }`}
                  aria-current={active ? 'true' : undefined}
                >
                  {range.label}
                  <span className="block font-normal text-base-content/50">
                    {rangeText(range.min, range.max)}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="sm:hidden text-sm">
          Sua faixa: <strong>{bmi.label}</strong> ({rangeText(currentRange.min, currentRange.max)})
        </p>

        <p className="text-xs text-base-content/60">
          Faixas da OMS para adultos. O IMC é uma estimativa e não substitui a
          avaliação de um profissional de saúde.
        </p>
      </div>
    </section>
  );
}
