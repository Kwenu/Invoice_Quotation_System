import React from 'react';

interface SegmentedTabsProps<T extends string> {
  items: {id: T;label: string;count?: number;}[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  variant?: 'underline' | 'pill';
}

export function SegmentedTabs<T extends string>({ items, value, onChange, label, variant = 'underline' }: SegmentedTabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div role="tablist" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-lg bg-canvas p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) =>
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className={`h-8 shrink-0 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors duration-150 ${
          value === item.id ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`
          }>
          
            {item.label}
          </button>
        )}
      </div>);

  }
  return (
    <div role="tablist" aria-label={label} className="-mb-px flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150 ${
            active ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`
            }>
            
            {item.label}
            {item.count !== undefined &&
            <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-ink text-white' : 'bg-canvas text-ink-muted'}`}>
                {item.count}
              </span>
            }
          </button>);

      })}
    </div>);

}