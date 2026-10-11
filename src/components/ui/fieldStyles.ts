export const inputBase =
'w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-ink-faint transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:bg-canvas disabled:text-ink-muted read-only:bg-canvas read-only:text-ink-soft';

export function inputBorder(hasError: boolean): string {
  return hasError ? 'border-danger focus:border-danger' : 'border-line focus:border-brand-blue';
}

export type LabelVisibility = boolean | 'md';

export function labelClass(hide: LabelVisibility): string {
  if (hide === true) return 'sr-only';
  const visible = 'mb-1.5 block text-xs font-medium text-ink-soft';
  return hide === 'md' ? `${visible} md:sr-only` : visible;
}