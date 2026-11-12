import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import {
  getApiErrorMessage,
  getCalorieGoal,
  updateCalorieGoal,
} from '@/services/calorieGoalService';
import {
  CALORIE_GOAL_MAX,
  CALORIE_GOAL_MIN,
  validateCalorieGoalInput,
} from '@/utils/calorieGoal';
import { formatDateTime } from '@/utils/date';

type LoadStatus = 'loading' | 'error' | 'ready';

type Feedback = { type: 'success' | 'error'; message: string };

export function SettingsPage() {
  const [status, setStatus] = useState<LoadStatus>('loading');

  // Meta salva no servidor (null = ainda não definida).
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Texto digitado no campo. Fica como string para validar exatamente o que
  // o usuário escreveu (um <input type="number"> esconderia entradas inválidas).
  const [input, setInput] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadGoal = useCallback(async () => {
    setStatus('loading');
    try {
      const goal = await getCalorieGoal();
      setSavedGoal(goal.caloriesGoal);
      setUpdatedAt(goal.updatedAt);
      // Sem meta, o campo começa vazio: não sugerimos um valor.
      setInput(goal.caloriesGoal === null ? '' : String(goal.caloriesGoal));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    const validation = validateCalorieGoalInput(input);
    if (!validation.ok) {
      setFieldError(validation.error);
      return;
    }

    setFieldError(null);
    setSaving(true);

    try {
      const goal = await updateCalorieGoal(validation.value);
      setSavedGoal(goal.caloriesGoal);
      setUpdatedAt(goal.updatedAt);
      setInput(String(goal.caloriesGoal));
      setFeedback({
        type: 'success',
        message: `Meta diária salva: ${goal.caloriesGoal} kcal.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível salvar a meta. Verifique sua conexão e tente novamente.',
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <SimpleHeader
        title="Configurações"
        subtitle="Defina sua meta diária de calorias"
      />

      <section className="card bg-base-100 shadow-sm mt-6 max-w-xl">
        <div className="card-body">
          <h2 className="card-title">Meta diária de calorias</h2>

          {status === 'loading' && (
            <div
              className="flex items-center gap-3 py-6 text-base-content/60"
              role="status"
            >
              <span className="loading loading-spinner loading-md" />
              Carregando sua meta...
            </div>
          )}

          {status === 'error' && (
            <div role="alert" className="alert alert-error mt-2">
              <span>Não foi possível carregar sua meta.</span>
              <button type="button" className="btn btn-sm" onClick={loadGoal}>
                Tentar novamente
              </button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <p className="text-sm text-base-content/70" data-testid="current-goal">
                {savedGoal === null ? (
                  <>Você ainda não definiu uma meta diária.</>
                ) : (
                  <>
                    Meta atual: <strong>{savedGoal} kcal</strong>
                    {updatedAt && <> — definida em {formatDateTime(updatedAt)}</>}
                  </>
                )}
              </p>

              <div className="flex flex-col gap-1">
                <label htmlFor="calorie-goal" className="text-sm font-medium">
                  Meta diária (kcal)
                </label>
                <input
                  id="calorie-goal"
                  name="caloriesGoal"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ex.: 2000"
                  className={`input input-bordered w-full ${
                    fieldError ? 'input-error' : ''
                  }`}
                  value={input}
                  disabled={saving}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby="calorie-goal-help calorie-goal-error"
                  onChange={(e) => {
                    setInput(e.target.value);
                    setFieldError(null);
                    setFeedback(null);
                  }}
                />
                <p id="calorie-goal-help" className="text-xs text-base-content/60">
                  Número inteiro entre {CALORIE_GOAL_MIN} e {CALORIE_GOAL_MAX} kcal.
                  A meta é escolhida por você; o SiNutre não calcula nem
                  recomenda valores.
                </p>
                <p
                  id="calorie-goal-error"
                  role="alert"
                  className="text-sm text-error min-h-5"
                >
                  {fieldError}
                </p>
              </div>

              {feedback && (
                <div
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                  className={`alert ${
                    feedback.type === 'error' ? 'alert-error' : 'alert-success'
                  }`}
                >
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={saving}
                >
                  {saving && <span className="loading loading-spinner loading-sm" />}
                  {saving
                    ? 'Salvando...'
                    : savedGoal === null
                      ? 'Definir meta'
                      : 'Atualizar meta'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
