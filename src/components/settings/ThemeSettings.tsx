import { useState } from 'react';
import { Check } from '@phosphor-icons/react';

import { THEMES, applyTheme, getStoredTheme } from '@/utils/theme';
import type { ThemeId } from '@/utils/theme';

// Cartão "Aparência": troca as cores da interface. A troca é imediata e
// fica salva neste navegador.
export function ThemeSettings() {
  const [current, setCurrent] = useState<ThemeId>(getStoredTheme);

  function choose(theme: ThemeId) {
    applyTheme(theme);
    setCurrent(theme);
  }

  return (
    <section className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Aparência</h2>
        <p className="text-sm text-base-content/70">
          Escolha as cores da interface. A escolha fica salva neste navegador.
        </p>

        <div
          role="radiogroup"
          aria-label="Tema de cores"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
        >
          {THEMES.map((theme) => {
            const selected = theme.id === current;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(theme.id)}
                className={`rounded-box border-2 p-3 text-left transition-colors ${
                  selected ? 'border-primary' : 'border-base-300 hover:border-base-content/30'
                }`}
              >
                {/* Amostra pintada com as cores do próprio tema. */}
                <div
                  data-theme={theme.id}
                  className="rounded-field bg-base-200 p-2 flex items-center gap-1.5"
                  aria-hidden="true"
                >
                  <span className="h-5 w-5 rounded-full bg-primary" />
                  <span className="h-5 w-5 rounded-full bg-secondary" />
                  <span className="h-5 w-5 rounded-full bg-accent" />
                  <span className="h-3 grow rounded bg-base-100" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium">{theme.label}</span>
                  {selected && <Check size={18} weight="bold" className="text-primary" />}
                </div>
                <span className="text-xs text-base-content/60">{theme.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
