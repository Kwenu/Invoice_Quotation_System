import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { Adjustments, LingoDocument } from '../../types/document';
import type { DocumentTotals } from '../../utils/calculations';
import { formatMoney } from '../../utils/format';
import { createId } from '../../utils/id';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { NumberField } from '../ui/NumberField';
import { SelectField } from '../ui/SelectField';
import { TextField } from '../ui/TextField';
import { EditorSection } from './EditorSection';

interface TotalsSectionProps {
  doc: LingoDocument;
  update: (patch: Partial<LingoDocument>) => void;
  totals: DocumentTotals;
  currency: string;
  error?: string;
}

export function TotalsSection({ doc, update, totals, currency, error }: TotalsSectionProps) {
  const adj = doc.adjustments;
  const setAdj = (patch: Partial<Adjustments>) => update({ adjustments: { ...adj, ...patch } });
  const isInvoice = doc.type === 'invoice';

  const summary: {label: string;value: string;strong?: boolean;}[] = [
  { label: 'Subtotal', value: formatMoney(totals.subtotal, currency) }];

  if (totals.discount) summary.push({ label: 'Discount', value: `− ${formatMoney(totals.discount, currency)}` });
  if (totals.tax) summary.push({ label: adj.taxLabel || 'Tax', value: formatMoney(totals.tax, currency) });
  if (totals.charges) summary.push({ label: 'Additional charges', value: formatMoney(totals.charges, currency) });
  summary.push({ label: isInvoice ? 'Invoice total' : 'Quotation total', value: formatMoney(totals.total, currency), strong: true });
  if (isInvoice && totals.paid) summary.push({ label: 'Payments received', value: `− ${formatMoney(totals.paid, currency)}` });

  return (
    <EditorSection title="Totals & adjustments" description="Optional — leave at zero and nothing extra prints on the document.">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Discount type"
              value={adj.discountType}
              onChange={(e) => setAdj({ discountType: e.target.value as Adjustments['discountType'] })}
              options={[
              { value: 'amount', label: `Amount (${currency})` },
              { value: 'percent', label: 'Percentage (%)' }]
              } />
            
            <NumberField
              label="Discount"
              value={adj.discountValue}
              max={adj.discountType === 'percent' ? 100 : undefined}
              suffix={adj.discountType === 'percent' ? '%' : undefined}
              onValueChange={(v) => setAdj({ discountValue: v })} />
            
            <TextField label="Tax label" value={adj.taxLabel} placeholder="e.g. VAT" onChange={(e) => setAdj({ taxLabel: e.target.value })} />
            <NumberField label="Tax rate" value={adj.taxRate} max={100} step={0.5} suffix="%" onValueChange={(v) => setAdj({ taxRate: v })} />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-ink-soft">Additional charges</p>
            <div className="space-y-2">
              {adj.charges.map((charge) =>
              <div key={charge.id} className="grid grid-cols-[minmax(0,1fr)_120px_36px] items-start gap-2">
                  <TextField
                  label="Charge label"
                  hideLabel
                  placeholder="e.g. Delivery"
                  value={charge.label}
                  onChange={(e) => setAdj({ charges: adj.charges.map((c) => c.id === charge.id ? { ...c, label: e.target.value } : c) })} />
                
                  <NumberField
                  label="Charge amount"
                  hideLabel
                  value={charge.amount}
                  step={100}
                  onValueChange={(v) => setAdj({ charges: adj.charges.map((c) => c.id === charge.id ? { ...c, amount: v } : c) })} />
                
                  <IconButton icon={Trash2Icon} label="Remove charge" tone="danger" onClick={() => setAdj({ charges: adj.charges.filter((c) => c.id !== charge.id) })} />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={PlusIcon}
              className="mt-1"
              onClick={() => setAdj({ charges: [...adj.charges, { id: createId('chg'), label: '', amount: 0 }] })}>
              
              Add charge
            </Button>
          </div>
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <dl className="h-fit rounded-xl bg-canvas p-4 text-sm">
          {summary.map((row) =>
          <div key={row.label} className={`flex items-baseline justify-between gap-3 py-1.5 ${row.strong ? 'mt-1 border-t border-line-strong pt-2.5' : ''}`}>
              <dt className={row.strong ? 'font-medium text-ink' : 'text-ink-muted'}>{row.label}</dt>
              <dd className={`tabular-nums ${row.strong ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{row.value}</dd>
            </div>
          )}
          {isInvoice &&
          <div className="mt-2 flex items-baseline justify-between gap-3 rounded-lg bg-ink px-3 py-2.5 text-white">
              <dt className="text-sm font-medium">Balance due</dt>
              <dd className="text-base font-semibold tabular-nums">{formatMoney(totals.balance, currency)}</dd>
            </div>
          }
        </dl>
      </div>
    </EditorSection>);

}