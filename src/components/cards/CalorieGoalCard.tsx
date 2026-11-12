import { Link } from 'react-router-dom';
import { getCalorieProgress } from '@/utils/calorieGoal';

// Estado da meta vinda do backend.
// goal = null com status 'ready' significa "usuário ainda não definiu meta".
export type CalorieGoalState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; goal: number | null };

interface CalorieGoalCardProps {
  consumedCalories: number; // kcal consumidas hoje
  goalState: CalorieGoalState;
  onRetry: () => void;
}

export function CalorieGoalCard({
  consumedCalories,
  goalState,
  onRetry,
}: CalorieGoalCardProps) {
  const consumed = Math.round(consumedCalories);

  return (
    <article className="card bg-base-100 shadow-sm" aria-labelledby="calorie-goal-title">
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="calorie-goal-title"
            className="card-title text-base-content/80 text-sm"
          >
            Meta diária de calorias
          </h2>

          {goalState.status === 'ready' && goalState.goal !== null && (
            <Link to="/settings" className="btn btn-ghost btn-sm">
              Editar meta
            </Link>
          )}
        </div>

        {goalState.status === 'loading' && (
          <div className="flex items-center gap-3 text-base-content/60" role="status">
            <span className="loading loading-spinner loading-sm" />
            Carregando sua meta...
          </div>
        )}

        {goalState.status === 'error' && (
          <div role="alert" className="alert alert-error">
            <span>
              Não foi possível carregar sua meta. Consumido hoje: {consumed} kcal.
            </span>
            <button type="button" className="btn btn-sm" onClick={onRetry}>
              Tentar novamente
            </button>
          </div>
        )}

        {goalState.status === 'ready' && goalState.goal === null && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium">Você ainda não definiu uma meta diária.</p>
              <p className="text-sm text-base-content/60">
                Consumido hoje: {consumed} kcal. Defina uma meta para acompanhar
                seu progresso.
              </p>
            </div>
            <Link to="/settings" className="btn btn-primary w-full sm:w-auto">
              Definir meta
            </Link>
          </div>
        )}

        {goalState.status === 'ready' && goalState.goal !== null && (
          <GoalProgress consumedCalories={consumedCalories} goal={goalState.goal} />
        )}
      </div>
    </article>
  );
}

function GoalProgress({
  consumedCalories,
  goal,
}: {
  consumedCalories: number;
  goal: number;
}) {
  const progress = getCalorieProgress(consumedCalories, goal);
  const isOver = progress.status === 'over';

  return (
    <>
      <p className="text-2xl lg:text-3xl font-black">
        {progress.consumed}
        <span className="text-base lg:text-lg font-normal text-base-content/60">
          {' '}
          / {goal} kcal
        </span>
      </p>

      <progress
        className={`progress w-full ${isOver ? 'progress-error' : 'progress-primary'}`}
        value={progress.percent}
        max={100}
        aria-label="Progresso da meta diária de calorias"
      />

      <p
        className={`text-sm font-medium ${isOver ? 'text-error' : 'text-base-content/70'}`}
        data-testid="calorie-goal-message"
      >
        {progress.status === 'under' &&
          `Faltam ${progress.difference} kcal para atingir sua meta de hoje (${progress.percent}%).`}
        {progress.status === 'reached' && 'Você atingiu exatamente a sua meta de hoje.'}
        {progress.status === 'over' &&
          `Você ultrapassou a meta de hoje em ${progress.difference} kcal.`}
      </p>
    </>
  );
}
