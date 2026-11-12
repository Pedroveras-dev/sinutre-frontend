import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CaloriesBarChart } from '@/components/charts/CaloriesBarChart';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { api } from '@/lib/api';
import { getCalorieGoal } from '@/services/calorieGoalService';
import type { Meal } from '@/types/mealSummary';
import { buildDailySeries, summarizeSeries } from '@/utils/progress';

const DAYS = 7;

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; meals: Meal[]; goal: number | null };

// Página Progresso: calorias dos últimos 7 dias comparadas com a meta.
// Usa as rotas que já existem (GET /meals e GET /calorie-goal); o agrupamento
// por dia é feito aqui, no fuso do navegador.
export function ProgressPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [mealsResponse, goal] = await Promise.all([
        api.get<Meal[]>('/meals'),
        getCalorieGoal(),
      ]);
      setState({
        status: 'ready',
        meals: mealsResponse.data,
        goal: goal.caloriesGoal,
      });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = useMemo(() => new Date(), []);

  const series = useMemo(
    () => (state.status === 'ready' ? buildDailySeries(state.meals, today, DAYS) : []),
    [state, today],
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <SimpleHeader
        title="Progresso"
        subtitle={`Suas calorias nos últimos ${DAYS} dias`}
      />

      {state.status === 'loading' && (
        <div className="flex items-center gap-3 mt-6 text-base-content/60" role="status">
          <span className="loading loading-spinner loading-md" />
          Carregando seu progresso...
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="alert alert-error mt-6">
          <span>Não foi possível carregar seu progresso.</span>
          <button type="button" className="btn btn-sm" onClick={load}>
            Tentar novamente
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <ProgressContent series={series} goal={state.goal} today={today} />
      )}
    </div>
  );
}

function ProgressContent({
  series,
  goal,
  today,
}: {
  series: ReturnType<typeof buildDailySeries>;
  goal: number | null;
  today: Date;
}) {
  const summary = summarizeSeries(series, goal);

  return (
    <div className="flex flex-col gap-6 mt-6 mb-8">
      <section className="stats stats-vertical lg:stats-horizontal shadow-sm w-full bg-base-100">
        <div className="stat text-center">
          <div className="stat-value text-2xl lg:text-4xl">
            {summary.averageCalories ?? '–'}
            {summary.averageCalories !== null && (
              <span className="text-sm lg:text-xl font-normal text-base-content/60">
                {' '}
                kcal
              </span>
            )}
          </div>
          <div className="stat-title font-semibold mt-1">Média diária</div>
          <div className="stat-desc">nos dias com refeição registrada</div>
        </div>

        <div className="stat text-center">
          <div className="stat-value text-2xl lg:text-4xl">
            {summary.daysWithinGoal ?? '–'}
            {summary.daysWithinGoal !== null && (
              <span className="text-sm lg:text-xl font-normal text-base-content/60">
                {' '}
                / {summary.daysWithMeals}
              </span>
            )}
          </div>
          <div className="stat-title font-semibold mt-1">Dias dentro da meta</div>
          <div className="stat-desc">
            {goal === null ? 'defina uma meta para acompanhar' : 'entre os dias com registro'}
          </div>
        </div>

        <div className="stat text-center">
          <div className="stat-value text-2xl lg:text-4xl">{summary.totalMeals}</div>
          <div className="stat-title font-semibold mt-1">Refeições</div>
          <div className="stat-desc">nos últimos {series.length} dias</div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base-content/80 text-sm">
            Calorias por dia
          </h2>

          {summary.totalMeals === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-8">
              <p className="font-medium">
                Nenhuma refeição registrada nos últimos {series.length} dias.
              </p>
              <p className="text-sm text-base-content/60">
                Registre suas refeições para ver a evolução aqui.
              </p>
              <Link to="/" className="btn btn-primary mt-2">
                Registrar refeição
              </Link>
            </div>
          ) : (
            <CaloriesBarChart series={series} goal={goal} today={today} />
          )}

          {goal === null && (
            <p className="text-sm text-base-content/70">
              Você ainda não definiu uma meta diária.{' '}
              <Link to="/settings" className="link link-primary">
                Defina sua meta
              </Link>{' '}
              para compará-la com o consumo de cada dia.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
