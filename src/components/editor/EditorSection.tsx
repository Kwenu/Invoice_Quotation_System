import React, { type ReactNode } from 'react';

interface EditorSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function EditorSection({ title, description, action, children }: EditorSectionProps) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </section>);

}