export function formatDate(
  date: string,
) {
  return new Date(date)
    .toLocaleDateString('pt-BR');
}

export function formatDateTime(
  date: string,
) {
  return new Date(date)
    .toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',

      hour: '2-digit',
      minute: '2-digit',
    });
}

// ---------------------------------------------------------------------------
// Convenção de datas do SiNutre
//
// - O backend guarda e devolve instantes em UTC (ISO 8601, ex.: "...T15:30:00.000Z").
// - "Hoje" é sempre o dia do calendário no fuso do NAVEGADOR do usuário.
//   Por isso as comparações abaixo usam os getters locais de Date.
// ---------------------------------------------------------------------------

// Verdadeiro quando as duas datas caem no mesmo dia do calendário local.
// Atenção: getDate() é o dia do mês (1–31). getDay() é o dia da SEMANA (0–6)
// e não serve para isso — duas quartas-feiras diferentes dariam "mesmo dia".
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameLocalMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

// Converte o valor de um <input type="datetime-local"> ("2026-11-11T12:30",
// sem fuso) para ISO em UTC. O navegador interpreta o valor no fuso do
// usuário; enviando ISO, o backend não depende do fuso do servidor.
// Devolve null se o valor estiver vazio ou for inválido.
export function localDateTimeToISO(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
