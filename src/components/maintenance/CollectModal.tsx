import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { Retainer } from '../../types/retainer';
import { formatDisplayDate, formatMoney, todayIso } from '../../utils/format';
import { nextDueAfter } from '../../utils/retainers';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { NumberField } from '../ui/NumberField';
import { TextField } from '../ui/TextField';

interface Props {
  retainer: Retainer | null;
  onClose: () => void;
}

export function CollectModal({ retainer, onClose }: Props) {
  const { collectRetainer, settings } = useData();
  const [receivedDate, setReceivedDate] = useState(todayIso());
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('Bank transfer');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (retainer) {
      setReceivedDate(todayIso());
      setAmount(retainer.amount);
      setMethod('Bank transfer');
      setNote('');
    }
  }, [retainer]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retainer || amount <= 0) return;
    collectRetainer(retainer.id, { receivedDate, amount, method: method.trim(), note: note.trim() });
    toast.success(`${formatMoney(amount, settings.currencySymbol)} collected from ${retainer.clientName}`);
    onClose();
  };

  return (
    <Modal open={Boolean(retainer)} onClose={onClose} title="Record collection" description={retainer ? `${retainer.title} — ${retainer.clientName}` : undefined}>
      {retainer &&
      <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="rounded-xl bg-canvas px-4 py-3 text-sm text-ink-soft">
            Settles the charge due <span className="font-medium text-ink">{formatDisplayDate(retainer.nextDueDate)}</span>. The next one will be due{' '}
            <span className="font-medium text-ink">{formatDisplayDate(nextDueAfter(retainer, retainer.nextDueDate))}</span>.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Date received" type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
            <NumberField label={`Amount (${settings.currencySymbol})`} value={amount} step={500} onValueChange={setAmount} />
            <TextField label="Method" value={method} onChange={(e) => setMethod(e.target.value)} />
            <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={amount <= 0}>Record collection</Button>
          </div>
        </form>
      }
    </Modal>);

}
