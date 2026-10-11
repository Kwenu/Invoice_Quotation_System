import React from 'react';
import { CopyIcon, Trash2Icon } from 'lucide-react';
import type { LineItem } from '../../types/document';
import { lineTotal } from '../../utils/calculations';
import { formatMoney } from '../../utils/format';
import { IconButton } from '../ui/IconButton';
import { NumberField } from '../ui/NumberField';
import { TextField } from '../ui/TextField';

interface LineItemRowProps {
  item: LineItem;
  bundled: boolean;
  currency: string;
  canRemove: boolean;
  onChange: (patch: Partial<LineItem>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}


export function LineItemRow({ item, bundled, currency, canRemove, onChange, onDuplicate, onRemove }: LineItemRowProps) {
  const actions =
  <div className="flex h-10 items-center justify-end gap-0.5">
      <IconButton icon={CopyIcon} label="Duplicate line" onClick={onDuplicate} />
      <IconButton icon={Trash2Icon} label="Remove line" tone="danger" onClick={onRemove} disabled={!canRemove} />
    </div>;


  if (bundled) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_76px] items-start gap-2">
        <TextField label="Sub-item" hideLabel value={item.description} placeholder="e.g. UI Design" onChange={(e) => onChange({ description: e.target.value })} />
        {actions}
      </div>);

  }

  return (
    <div className="space-y-2 rounded-lg border border-line p-3">
      <TextField
        label="Description"
        value={item.description}
        placeholder="Describe the service or item"
        onChange={(e) => onChange({ description: e.target.value })} />

      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[84px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto]">
        <NumberField label="Qty" value={item.quantity} min={0} step={1} onValueChange={(v) => onChange({ quantity: v })} />
        <NumberField label="Unit price" value={item.unitPrice} min={0} step={100} onValueChange={(v) => onChange({ unitPrice: v })} />
        <NumberField label="Discount" value={item.discount} min={0} step={100} onValueChange={(v) => onChange({ discount: v })} />
        <div className="min-w-0">
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">Line total</span>
          <div className="flex h-10 items-center justify-end overflow-hidden whitespace-nowrap rounded-lg bg-canvas px-3 text-sm font-medium tabular-nums text-ink">
            {formatMoney(lineTotal(item), currency)}
          </div>
        </div>
        <div className="col-span-2 flex justify-end sm:col-span-1">{actions}</div>
      </div>
    </div>);

}
