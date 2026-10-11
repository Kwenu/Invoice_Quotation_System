export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
export type ButtonSize = 'sm' | 'md';

const base =
'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-soft',
  secondary: 'border border-line bg-white text-ink hover:border-line-strong hover:bg-canvas',
  ghost: 'text-ink-soft hover:bg-canvas hover:text-ink',
  danger: 'border border-danger/30 bg-white text-danger hover:bg-danger-soft',
  brand: 'bg-lingo text-white hover:opacity-90'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm'
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}