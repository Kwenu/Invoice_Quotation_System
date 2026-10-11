import React, { useId } from 'react';

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${checked ? 'bg-ink' : 'bg-line-strong'}`}>
        
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
        
      </button>
    </div>);

}