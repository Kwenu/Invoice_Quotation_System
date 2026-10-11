import React, { type ReactNode } from 'react';

interface SettingsGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  return (
    <section className="grid gap-4 border-b border-line py-6 first:pt-0 last:border-b-0 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>);

}