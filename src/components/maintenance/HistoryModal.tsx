import React from 'react';
import { toast } from 'sonner';
import { Trash2Icon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { formatDisplayDate, formatMoney } from '../../utils/format';
import { EmptyState } from '../ui/EmptyState';
import { IconButton } from '../ui/IconButton';
import { Modal } from '../ui/Modal';
import { BanknoteIcon } from 'lucide-react';

export function HistoryModal({ retainerId, onClose }: {retainerId: string | null;onClose: () => void;}) {
  const { retainers, settings, removeCollection } = useData();
  const retainer = retainers.find((r) => r.id === retainerId) ?? null;
  const total = retainer?.collections.reduce((s, c) => s + c.amount, 0) ?? 0;

  return (
    <Modal open={Boolean(retainer)} onClose={onClose} title="Collection history" description={retainer ? `${retainer.title} — ${retainer.clientName}` : undefined}>
      {retainer && (
      retainer.collections.length === 0 ?
      <EmptyState icon={BanknoteIcon} title="Nothing collected yet" description="Use “Collect” when the client pays a maintenance charge." /> :
      <>
          <p className="mb-3 text-sm text-ink-soft">Total collected: <span className="font-semibold text-ink">{formatMoney(total, settings.currencySymbol)}</span></p>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {retainer.collections.map((c) =>
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(c.amount, settings.currencySymbol)}</p>
                  <p className="truncate text-xs text-ink-muted">
                    For {formatDisplayDate(c.dueDate)} · received {formatDisplayDate(c.receivedDate)}{c.method ? ` · ${c.method}` : ''}{c.note ? ` · ${c.note}` : ''}
                  </p>
                </div>
                <IconButton icon={Trash2Icon} label="Remove collection" tone="danger" onClick={() => {removeCollection(retainer.id, c.id);toast.success('Collection removed');}} />
              </li>
          )}
          </ul>
        </>)
      }
    </Modal>);

}
