import React, { useId, type InputHTMLAttributes } from 'react';
import { FieldMessage } from './FieldMessage';
import { inputBase, inputBorder, labelClass, type LabelVisibility } from './fieldStyles';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: LabelVisibility;
  containerClassName?: string;
}

export function TextField({ label, error, hint, hideLabel = false, containerClassName = '', id, className = '', ...rest }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const msgId = `${fieldId}-msg`;
  return (
    <div className={containerClassName}>
      <label htmlFor={fieldId} className={labelClass(hideLabel)}>
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? msgId : undefined}
        className={`${inputBase} ${inputBorder(Boolean(error))} h-10 ${className}`}
        {...rest} />
      
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>);

}