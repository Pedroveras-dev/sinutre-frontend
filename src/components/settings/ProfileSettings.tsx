import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { getApiErrorMessage } from '@/lib/api';
import { getProfile, updateProfile } from '@/services/profileService';
import type { Profile } from '@/services/profileService';
import { formatDateTime } from '@/utils/date';
import {
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  validateProfileForm,
} from '@/utils/profile';
import type { ProfileFormValues } from '@/utils/profile';

type LoadStatus = 'loading' | 'error' | 'ready';
type Feedback = { type: 'success' | 'error'; message: string };
type FieldErrors = Partial<Record<keyof ProfileFormValues, string>>;

// Mostra decimais com vírgula no campo (72.5 → "72,5").
function toInput(value: number | null) {
  return value === null ? '' : String(value).replace('.', ',');
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

// Cartão de altura e peso (página Configurações). Esses dados alimentam o
// IMC mostrado na página Métricas.
export function ProfileSettings() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [saved, setSaved] = useState<Profile | null>(null);
  const [values, setValues] = useState<ProfileFormValues>({ heightCm: '', weightKg: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const profile = await getProfile();
      setSaved(profile);
      // Sem dados, os campos começam vazios: não sugerimos valores.
      setValues({ heightCm: toInput(profile.heightCm), weightKg: toInput(profile.weightKg) });
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleChange(field: keyof ProfileFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    const validation = validateProfileForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const profile = await updateProfile(validation.value);
      setSaved(profile);
      setValues({ heightCm: toInput(profile.heightCm), weightKg: toInput(profile.weightKg) });
      setFeedback({ type: 'success', message: 'Altura e peso salvos.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível salvar. Verifique sua conexão e tente novamente.',
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  const hasProfile = saved?.heightCm != null && saved?.weightKg != null;

  return (
    <section className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Altura e peso</h2>

        {status === 'loading' && (
          <div className="flex items-center gap-3 py-6 text-base-content/60" role="status">
            <span className="loading loading-spinner loading-md" />
            Carregando seus dados...
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="alert alert-error mt-2">
            <span>Não foi possível carregar sua altura e peso.</span>
            <button type="button" className="btn btn-sm" onClick={load}>
              Tentar novamente
            </button>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <p className="text-sm text-base-content/70" data-testid="current-profile">
              {hasProfile ? (
                <>
                  Atual: <strong>{formatNumber(saved!.heightCm!)} cm</strong> e{' '}
                  <strong>{formatNumber(saved!.weightKg!)} kg</strong>
                  {saved!.updatedAt && <> — atualizado em {formatDateTime(saved!.updatedAt)}</>}
                </>
              ) : (
                <>Você ainda não cadastrou sua altura e peso. Eles são usados para calcular o IMC.</>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MeasureField
                id="profile-height"
                label="Altura (cm)"
                placeholder="Ex.: 175"
                help={`Entre ${HEIGHT_CM_MIN} e ${HEIGHT_CM_MAX} cm`}
                value={values.heightCm}
                error={errors.heightCm}
                disabled={saving}
                onChange={(value) => handleChange('heightCm', value)}
              />
              <MeasureField
                id="profile-weight"
                label="Peso (kg)"
                placeholder="Ex.: 72,5"
                help={`Entre ${WEIGHT_KG_MIN} e ${WEIGHT_KG_MAX} kg`}
                value={values.weightKg}
                error={errors.weightKg}
                disabled={saving}
                onChange={(value) => handleChange('weightKg', value)}
              />
            </div>

            {feedback && (
              <div
                role={feedback.type === 'error' ? 'alert' : 'status'}
                className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}
              >
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="card-actions justify-end">
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving}>
                {saving && <span className="loading loading-spinner loading-sm" />}
                {saving ? 'Salvando...' : hasProfile ? 'Atualizar dados' : 'Salvar dados'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function MeasureField({
  id,
  label,
  placeholder,
  help,
  value,
  error,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  help: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-help ${id}-error`}
        onChange={(e) => onChange(e.target.value)}
      />
      <p id={`${id}-help`} className="text-xs text-base-content/60">
        {help}
      </p>
      <p id={`${id}-error`} role="alert" className="text-sm text-error min-h-5">
        {error}
      </p>
    </div>
  );
}
