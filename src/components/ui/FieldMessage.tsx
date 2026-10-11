import React from 'react';

interface FieldMessageProps {
  id: string;
  error?: string;
  hint?: string;
}

export function FieldMessage({ id, error, hint }: FieldMessageProps) {
  if (!error && !hint) return null;
  return (
    <p id={id} className={`mt-1 text-xs ${error ? 'text-danger' : 'text-ink-muted'}`}>
      {error ?? hint}
    </p>);

}