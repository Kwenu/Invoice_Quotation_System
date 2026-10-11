import React, { useId, type TextareaHTMLAttributes } from 'react';
import { FieldMessage } from './FieldMessage';
import { inputBase, inputBorder, labelClass, type LabelVisibility } from './fieldStyles';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: LabelVisibility;
  containerClassName?: string;
}

export function TextAreaField({ label, error, hint, hideLabel = false, containerClassName = '', id, rows = 3, ...rest }: TextAreaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={containerClassName}>
      <label htmlFor={fieldId} className={labelClass(hideLabel)}>
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
        className={`${inputBase} ${inputBorder(Boolean(error))} resize-y py-2 leading-relaxed`}
        {...rest} />
      
      <FieldMessage id={`${fieldId}-msg`} error={error} hint={hint} />
    </div>);

}