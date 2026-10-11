import React, { ButtonHTMLAttributes } from "react";
import { BoxIcon } from "lucide-react";
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: BoxIcon;
  label: string;
  tone?: 'default' | 'danger';
}
export function IconButton({
  icon: Icon,
  label,
  tone = 'default',
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  const toneClass = tone === 'danger' ? 'text-ink-muted hover:bg-danger-soft hover:text-danger' : 'text-ink-muted hover:bg-canvas hover:text-ink';
  return <button type={type} aria-label={label} title={label} className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-40 ${toneClass} ${className}`} {...rest}>
      <Icon className="h-4 w-4" aria-hidden />
    </button>;
}