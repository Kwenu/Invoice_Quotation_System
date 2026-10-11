import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { LingoDocument } from '../../types/document';
import type { DocumentTotals } from '../../utils/calculations';
import { formatDisplayDate, formatMoney } from '../../utils/format';
import { createId } from '../../utils/id';
import { PaymentForm } from '../documents/PaymentForm';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextField } from '../ui/TextField';
import { EditorSection } from './EditorSection';

interface PaymentsSectionProps {
  doc: LingoDocument;
  update: (patch: Partial<LingoDocument>) => void;
  totals: DocumentTotals;
  currency: string;
  error?: string;
}

export function PaymentsSection({ doc, update, totals, currency, error }: PaymentsSectionProps) {
  const [adding, setAdding] = useState(false);
  return (
    <EditorSection
      title="Advance & payments"
      description="Payments are recorded separately from the invoice total. Status updates from these — never from generating a PDF."
      action={
      !adding && totals.balance > 0 ?
      <Button variant="secondary" size="sm" icon={PlusIcon} onClick={() => setAdding(true)}>
            Add payment
          </Button> :
      undefined
      }>
      
      {doc.payments.length === 0 && !adding && <p className="text-sm text-ink-muted">No payments recorded yet.</p>}
      {doc.payments.length > 0 &&
      <ul className="divide-y divide-line rounded-xl border border-line">
          {doc.payments.map((p) =>
        <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(p.amount, currency)}</p>
                <p className="truncate text-xs text-ink-muted">
                  {formatDisplayDate(p.date)}
                  {p.method && ` · ${p.method}`}
                  {p.note && ` · ${p.note}`}
                  {p.showOnDocument && ' · printed as advance'}
                </p>
              </div>
              <IconButton
            icon={Trash2Icon}
            label="Remove payment"
            tone="danger"
            onClick={() => update({ payments: doc.payments.filter((x) => x.id !== p.id) })} />
          
            </li>
        )}
        </ul>
      }
      {doc.payments.some((p) => p.showOnDocument) &&
      <TextField
        label="Printed label for advance payments"
        containerClassName="mt-4 max-w-xs"
        value={doc.display.advanceLabel}
        onChange={(e) => update({ display: { ...doc.display, advanceLabel: e.target.value } })} />

      }
      {adding &&
      <div className="mt-3 rounded-xl border border-line p-4">
          <PaymentForm
          balance={totals.balance}
          currency={currency}
          defaultShowOnDocument
          submitLabel="Add payment"
          onCancel={() => setAdding(false)}
          onSubmit={(values) => {
            update({ payments: [...doc.payments, { ...values, id: createId('pay'), recordedAt: new Date().toISOString() }] });
            setAdding(false);
          }} />
        
        </div>
      }
      {error && <p role="alert" className="mt-3 text-xs text-danger">{error}</p>}
    </EditorSection>);

}