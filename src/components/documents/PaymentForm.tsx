import React, { useState } from 'react';
import type { Payment } from '../../types/document';
import { formatMoney, todayIso } from '../../utils/format';
import { Button } from '../ui/Button';
import { NumberField } from '../ui/NumberField';
import { TextField } from '../ui/TextField';
import { ToggleField } from '../ui/ToggleField';

export type PaymentValues = Omit<Payment, 'id' | 'recordedAt'>;

interface PaymentFormProps {
  balance: number;
  currency: string;
  defaultShowOnDocument?: boolean;
  submitLabel: string;
  onSubmit: (values: PaymentValues) => void;
  onCancel: () => void;
}

export function PaymentForm({ balance, currency, defaultShowOnDocument = false, submitLabel, onSubmit, onCancel }: PaymentFormProps) {
  const [values, setValues] = useState<PaymentValues>({
    date: todayIso(),
    amount: balance,
    method: '',
    reference: '',
    note: '',
    showOnDocument: defaultShowOnDocument
  });
  const [error, setError] = useState<string | undefined>();

  const set = <K extends keyof PaymentValues,>(key: K, value: PaymentValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (values.amount <= 0) return setError('Enter an amount greater than zero.');
    if (values.amount > balance + 0.001) return setError(`Amount cannot exceed the outstanding ${formatMoney(balance, currency)}.`);
    if (!values.date) return setError('Choose the payment date.');
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label={`Amount (${currency})`} value={values.amount} onValueChange={(v) => set('amount', v)} step={100} error={error} />
        <TextField label="Payment date" type="date" value={values.date} onChange={(e) => set('date', e.target.value)} />
        <TextField label="Method" placeholder="e.g. Bank transfer" value={values.method} onChange={(e) => set('method', e.target.value)} />
        <TextField label="Reference" placeholder="Optional" value={values.reference} onChange={(e) => set('reference', e.target.value)} />
      </div>
      <TextField label="Note" placeholder="Optional" value={values.note} onChange={(e) => set('note', e.target.value)} />
      <ToggleField
        label="Show on invoice as advance"
        description="Prints this payment in the totals and reduces the printed Total Due."
        checked={values.showOnDocument}
        onChange={(v) => set('showOnDocument', v)} />
      
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>);

}