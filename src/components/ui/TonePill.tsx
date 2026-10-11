import React from 'react';
import type { StatusTone } from '../../utils/status';

const toneClasses: Record<StatusTone, string> = {
  neutral: 'bg-canvas text-ink-soft ring-line-strong',
  info: 'bg-info-soft text-info ring-info/20',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning-soft text-warning ring-warning/20',
  danger: 'bg-danger-soft text-danger ring-danger/20',
  brand: 'bg-brand-tint text-brand-violet ring-brand-violet/20'
};

export function TonePill({ tone, children }: {tone: StatusTone;children: React.ReactNode;}) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>);

}
