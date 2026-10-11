import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import { formatMoney, todayIso } from '../../utils/format';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { NumberField } from '../ui/NumberField';
import { TextField } from '../ui/TextField';

interface Props {
  open: boolean;
  memberId: string;
  suggested: number;
  onClose: () => void;
}

export function PayoutModal({ open, memberId, suggested, onClose }: Props) {
  const { recordPayout, settings } = useData();
  const [date, setDate] = useState(todayIso());
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('Bank transfer');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDate(todayIso());
    setAmount(Math.max(0, Math.round(suggested * 100) / 100));
    setMethod('Bank transfer');
    setNote('');
    setError('');
  }, [open, suggested]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return setError('Enter the amount paid.');
    recordPayout({ memberId, date, amount, method: method.trim(), note: note.trim() });
    toast.success(`${formatMoney(amount, settings.currencySymbol)} payout recorded`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Record payout" description="Money you paid to this member.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <NumberField label={`Amount (${settings.currencySymbol})`} value={amount} step={500} onValueChange={setAmount} />
          <TextField label="Method" value={method} onChange={(e) => setMethod(e.target.value)} />
          <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Record payout</Button>
        </div>
      </form>
    </Modal>);

}
