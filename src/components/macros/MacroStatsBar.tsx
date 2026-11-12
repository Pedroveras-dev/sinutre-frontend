import type { MacroSummary } from '@/types/meal';
import { MacroStat } from './MacroStat';

interface MacroStatsBarProps {
  summary: MacroSummary;
}

// Uma casa decimal evita exibir resíduos de ponto flutuante (ex.: 5.4000001).
function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function MacroStatsBar({ summary }: MacroStatsBarProps) {
  const calories = Math.round(summary.calories);
  const goal = summary.caloriesGoal;

  return (
    <section className="stats stats-vertical lg:stats-horizontal shadow-sm w-full bg-base-100">
      <MacroStat label="Carboidratos" value={round1(summary.carbs)} unit="g" />
      <MacroStat label="Proteínas" value={round1(summary.proteins)} unit="g" />
      <MacroStat label="Gordura" value={round1(summary.fats)} unit="g" />
      {goal === null ? (
        // Sem meta definida: mostra só o consumo, sem inventar um alvo.
        <MacroStat
          label="Calorias hoje"
          value={calories}
          unit="kcal"
          variant="highlight"
        />
      ) : (
        <MacroStat
          label="Calorias / Meta Diária"
          value={calories}
          unit="kcal"
          variant={calories > goal ? 'danger' : 'highlight'}
          goal={goal}
          hint="kcal"
        />
      )}
    </section>
  );
}
