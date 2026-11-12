import { useState } from 'react';
import type { DayCalories } from '@/utils/progress';
import { isSameLocalDay } from '@/utils/date';

interface CaloriesBarChartProps {
  series: DayCalories[]; // do dia mais antigo para o mais recente
  goal: number | null; // meta diária em kcal; null = sem meta
  today: Date;
}

// Faixa reservada à direita do gráfico para o rótulo da linha da meta.
const GUTTER = 'pr-[4.5rem]';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function dayMonth(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}`;
}

// Texto de um dia: "11/11: 2100 kcal em 2 refeições (acima da meta em 110 kcal)".
function describeDay(day: DayCalories, goal: number | null) {
  const calories = Math.round(day.calories);

  if (day.mealsCount === 0) {
    return `${dayMonth(day.date)}: sem refeições registradas`;
  }

  const base = `${dayMonth(day.date)}: ${calories} kcal em ${mealsLabel(day.mealsCount)}`;

  if (goal === null) return base;

  return calories > goal
    ? `${base} (acima da meta em ${calories - goal} kcal)`
    : `${base} (dentro da meta)`;
}

function mealsLabel(count: number) {
  return count === 1 ? '1 refeição' : `${count} refeições`;
}

// Gráfico de barras das calorias por dia, com a linha da meta.
// Feito só com HTML e CSS (sem biblioteca de gráficos): cada barra é uma
// <div> cuja altura é uma porcentagem da escala.
export function CaloriesBarChart({ series, goal, today }: CaloriesBarChartProps) {
  // Dia em destaque: o que está sob o mouse, com foco do teclado ou tocado.
  // Começa em hoje (último da série). O detalhe aparece numa linha abaixo do
  // gráfico em vez de um balão flutuante, que estourava a largura no celular.
  const [activeIndex, setActiveIndex] = useState(series.length - 1);
  const activeDay = series[Math.min(activeIndex, series.length - 1)];

  const highest = Math.max(...series.map((day) => day.calories), goal ?? 0);
  // Folga de 15% acima do maior valor, para o rótulo caber sobre a barra.
  const scaleMax = highest > 0 ? highest * 1.15 : 1;
  const percent = (value: number) => (value / scaleMax) * 100;

  return (
    <div
      className="flex flex-col gap-2 w-full"
      role="group"
      aria-label="Gráfico de calorias por dia"
    >
      <div className={`relative flex items-end gap-2 h-56 border-b border-base-300 ${GUTTER}`}>
        {goal !== null && (
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-base-content/40 pointer-events-none"
            style={{ bottom: `${percent(goal)}%` }}
          >
            <span className="absolute right-0 bottom-0.5 w-16 text-right text-[11px] sm:text-xs leading-tight text-base-content/70">
              Meta
              <br />
              {goal} kcal
            </span>
          </div>
        )}

        {series.map((day, index) => {
          const calories = Math.round(day.calories);
          const isOver = goal !== null && calories > goal;
          const description = describeDay(day, goal);
          const isActive = day === activeDay;

          return (
            <div
              key={day.date.getTime()}
              className="flex-1 h-full min-w-0 flex flex-col justify-end items-center gap-1"
            >
              {/* O valor fica em cor de texto; a cor da barra é só reforço. */}
              <span className="relative z-10 bg-base-100 px-0.5 rounded-sm text-[11px] sm:text-xs text-base-content/70 tabular-nums whitespace-nowrap">
                {day.mealsCount === 0 ? '–' : `${isOver ? '▲ ' : ''}${calories}`}
              </span>

              <button
                type="button"
                aria-label={description}
                aria-pressed={isActive}
                className={`relative z-10 w-full max-w-16 rounded-t cursor-pointer ${
                  // Dia sem registro fica cinza: verde significaria "dentro da meta".
                  day.mealsCount === 0
                    ? 'bg-base-300'
                    : isOver
                      ? 'bg-error'
                      : 'bg-primary'
                } ${isActive ? '' : 'opacity-60'} hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-content`}
                style={{
                  height: `${percent(day.calories)}%`,
                  // Dia sem registro: um toco de 4px mantém a barra clicável.
                  minHeight: 4,
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              />
            </div>
          );
        })}
      </div>

      {/* Eixo X: dia da semana e data */}
      <div className={`flex gap-2 ${GUTTER}`}>
        {series.map((day) => {
          const isToday = isSameLocalDay(day.date, today);
          return (
            <div
              key={day.date.getTime()}
              className={`flex-1 min-w-0 text-center text-[11px] sm:text-xs leading-tight ${
                isToday ? 'font-bold text-base-content' : 'text-base-content/60'
              }`}
            >
              <div>{isToday ? 'hoje' : WEEKDAYS[day.date.getDay()]}</div>
              <div>{dayMonth(day.date)}</div>
            </div>
          );
        })}
      </div>

      {/* Detalhe do dia em destaque (passe o mouse, use Tab ou toque numa barra). */}
      <p className="text-sm min-h-5" aria-live="polite">
        <span className="font-semibold">
          {isSameLocalDay(activeDay.date, today)
            ? 'Hoje'
            : WEEKDAYS[activeDay.date.getDay()]}
          , {describeDay(activeDay, goal)}
        </span>
      </p>

      {goal !== null && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-primary" aria-hidden />
            Dentro da meta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-error" aria-hidden />
            ▲ Acima da meta
          </span>
        </div>
      )}

      {/* Mesmos dados em tabela, para leitores de tela e para conferência. */}
      <details className="text-sm">
        <summary className="cursor-pointer text-base-content/70">
          Ver os números em tabela
        </summary>
        <div className="overflow-x-auto mt-2">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Dia</th>
                <th className="text-right">Calorias (kcal)</th>
                <th className="text-right">Refeições</th>
                {goal !== null && <th>Situação</th>}
              </tr>
            </thead>
            <tbody>
              {series.map((day) => {
                const calories = Math.round(day.calories);
                return (
                  <tr key={day.date.getTime()}>
                    <td>
                      {WEEKDAYS[day.date.getDay()]} {dayMonth(day.date)}
                    </td>
                    <td className="text-right tabular-nums">{calories}</td>
                    <td className="text-right tabular-nums">{day.mealsCount}</td>
                    {goal !== null && (
                      <td>
                        {day.mealsCount === 0
                          ? 'Sem registro'
                          : calories > goal
                            ? `Acima da meta (+${calories - goal})`
                            : 'Dentro da meta'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
