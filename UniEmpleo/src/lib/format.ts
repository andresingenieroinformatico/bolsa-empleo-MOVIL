/**
 * Small presentation helpers shared across screens.
 */

/** Returns up to two initials from a person or company name. */
export function getInitials(name?: string | null): string {
  if (!name) return '?';

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !/^(de|del|la|las|los|y|e)$/i.test(part));

  if (parts.length === 0) {
    return name.trim().slice(0, 2).toUpperCase();
  }

  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? '';

  return `${first}${second}`.toUpperCase();
}

/** "Hace 3 días" style relative date in Spanish. */
export function formatRelativeDate(value?: string | Date | null): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} días`;

  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Medium date, e.g. "12 nov 2026". */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '—';

  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** 1 -> "1 vacante", 2 -> "2 vacantes". */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
