// Temas de cor da interface (definidos em src/styles/theme.css).
//
// A escolha fica no navegador (localStorage): é uma preferência visual do
// aparelho, não um dado do usuário que precise ir para o banco. O script em
// index.html aplica o tema salvo antes da primeira pintura, para a tela não
// piscar com as cores padrão.
export const THEMES = [
  { id: 'sinutre', label: 'Claro', description: 'Verde, fundo claro' },
  { id: 'sinutre-escuro', label: 'Escuro', description: 'Verde, fundo escuro' },
  { id: 'sinutre-oceano', label: 'Oceano', description: 'Azul, fundo claro' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'sinutre';
export const THEME_STORAGE_KEY = 'sinutre.theme';

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Navegação privada ou armazenamento bloqueado: usa o padrão.
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sem armazenamento, o tema vale só até recarregar a página.
  }
}
