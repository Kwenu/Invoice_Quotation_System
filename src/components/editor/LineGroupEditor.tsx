import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { LineGroup, LineItem } from '../../types/document';
import { groupTotal } from '../../utils/calculations';
import { createItem } from '../../utils/documentFactory';
import { formatMoney } from '../../utils/format';
import { createId } from '../../utils/id';
import { ActionMenu } from '../ui/ActionMenu';
import { Button } from '../ui/Button';
import { NumberField } from '../ui/NumberField';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { TextField } from '../ui/TextField';
import { LineItemRow } from './LineItemRow';

interface LineGroupEditorProps {
  group: LineGroup;
  index: number;
  count: number;
  currency: string;
  onChange: (group: LineGroup) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function LineGroupEditor({ group, index, count, currency, onChange, onRemove, onDuplicate, onMove }: LineGroupEditorProps) {
  const isSection = group.kind === 'section';
  const bundled = isSection && group.pricing === 'bundled';

  const setItems = (items: LineItem[]) => onChange({ ...group, items });
  const updateItem = (id: string, patch: Partial<LineItem>) => setItems(group.items.map((i) => i.id === id ? { ...i, ...patch } : i));
  const duplicateItem = (id: string) => {
    const idx = group.items.findIndex((i) => i.id === id);
    const copy = { ...group.items[idx], id: createId('item') };
    setItems([...group.items.slice(0, idx + 1), copy, ...group.items.slice(idx + 1)]);
  };
  const removeItem = (id: string) => setItems(group.items.filter((i) => i.id !== id));

  const menu =
  <ActionMenu
    label={isSection ? 'Section actions' : 'Group actions'}
    items={[
    { label: 'Move up', icon: ArrowUpIcon, onSelect: () => onMove(-1), disabled: index === 0 },
    { label: 'Move down', icon: ArrowDownIcon, onSelect: () => onMove(1), disabled: index === count - 1 },
    { label: isSection ? 'Duplicate section' : 'Duplicate group', icon: CopyIcon, onSelect: onDuplicate },
    { label: isSection ? 'Remove section' : 'Remove group', icon: Trash2Icon, tone: 'danger', onSelect: onRemove }]
    } />;



  return (
    <div className="rounded-xl border border-line">
      <div className={`flex flex-wrap items-end gap-3 rounded-t-xl border-b border-line bg-canvas/60 px-3 py-3 ${isSection ? '' : 'items-center'}`}>
        {isSection ?
        <>
            <TextField
            label="Section heading"
            containerClassName="min-w-[200px] flex-1"
            value={group.title}
            placeholder="e.g. For Servers with maintenance cost"
            onChange={(e) => onChange({ ...group, title: e.target.value })} />
          
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Pricing</span>
              <SegmentedTabs
              variant="pill"
              label="Section pricing"
              value={group.pricing}
              onChange={(pricing) => onChange({ ...group, pricing })}
              items={[
              { id: 'itemized', label: 'Price per line' },
              { id: 'bundled', label: 'One price' }]
              } />
            
            </div>
          </> :

        <p className="flex-1 text-xs font-medium text-ink-soft">Line items</p>
        }
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-ink-muted">{formatMoney(groupTotal(group), currency)}</span>
          {menu}
        </div>
      </div>

      <div className="space-y-2 p-3">
        {bundled &&
        <div className="grid gap-3 pb-2 sm:grid-cols-2">
            <NumberField label={`Section price (${currency})`} value={group.bundlePrice} step={100} onValueChange={(v) => onChange({ ...group, bundlePrice: v })} />
            <TextField
            label="Label when price is 0"
            placeholder="e.g. FOC"
            value={group.bundleLabel}
            onChange={(e) => onChange({ ...group, bundleLabel: e.target.value })}
            hint="Shown beside the brace instead of Rs. 0.00" />
          
          </div>
        }

        {group.items.map((item) =>
        <LineItemRow
          key={item.id}
          item={item}
          bundled={bundled}
          currency={currency}
          canRemove={group.items.length > 1 || isSection}
          onChange={(patch) => updateItem(item.id, patch)}
          onDuplicate={() => duplicateItem(item.id)}
          onRemove={() => removeItem(item.id)} />

        )}

        <Button variant="ghost" size="sm" icon={PlusIcon} onClick={() => setItems([...group.items, createItem()])}>
          {isSection ? 'Add sub-item' : 'Add line'}
        </Button>
      </div>
    </div>);

}