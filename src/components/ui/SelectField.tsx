import React, { useId, type SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { FieldMessage } from './FieldMessage';
import { inputBase, inputBorder, labelClass, type LabelVisibility } from './fieldStyles';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: {value: string;label: string;disabled?: boolean;}[];
  error?: string;
  hint?: string;
  hideLabel?: LabelVisibility;
  containerClassName?: string;
}

export function SelectField({ label, options, error, hint, hideLabel = false, containerClassName = '', id, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={containerClassName}>
      <label htmlFor={fieldId} className={labelClass(hideLabel)}>
        {label}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={`${inputBase} ${inputBorder(Boolean(error))} h-10 appearance-none pr-9`}
          {...rest}>
          
          {options.map((o) =>
          <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          )}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      </div>
      <FieldMessage id={`${fieldId}-msg`} error={error} hint={hint} />
    </div>);

}