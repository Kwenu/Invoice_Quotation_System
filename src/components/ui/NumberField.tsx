import React, { useEffect, useId, useState } from 'react';
import { FieldMessage } from './FieldMessage';
import { inputBase, inputBorder, labelClass, type LabelVisibility } from './fieldStyles';

interface NumberFieldProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  hint?: string;
  hideLabel?: LabelVisibility;
  containerClassName?: string;
  suffix?: string;
  disabled?: boolean;
}

const parse = (text: string) => {
  const n = parseFloat(text);
  return Number.isFinite(n) ? n : 0;
};

export function NumberField({
  label,
  value,
  onValueChange,
  min = 0,
  max,
  step = 1,
  error,
  hint,
  hideLabel = false,
  containerClassName = '',
  suffix,
  disabled
}: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(String(value ?? 0));

  useEffect(() => {
    if (parse(text) !== value) setText(String(value ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    let next = Math.max(min, parse(raw));
    if (max !== undefined) next = Math.min(max, next);
    onValueChange(next);
  };

  return (
    <div className={containerClassName}>
      <label htmlFor={id} className={labelClass(hideLabel)}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={text}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setText(String(value ?? 0))}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`${inputBase} ${inputBorder(Boolean(error))} h-10 tabular-nums ${suffix ? 'pr-9' : ''}`} />
        
        {suffix &&
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-ink-muted">{suffix}</span>
        }
      </div>
      <FieldMessage id={`${id}-msg`} error={error} hint={hint} />
    </div>);

}