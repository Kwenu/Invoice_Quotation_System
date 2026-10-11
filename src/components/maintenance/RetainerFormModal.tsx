import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { Retainer, RetainerInput } from '../../types/retainer';
import { todayIso } from '../../utils/format';
import { categoryOptions, frequencyLabel } from '../../utils/retainers';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { NumberField } from '../ui/NumberField';
import { SelectField } from '../ui/SelectField';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';

const blank = (): RetainerInput => ({
  clientId: null,
  clientName: '',
  title: '',
  category: categoryOptions[0],
  amount: 0,
  frequency: 'monthly',
  startDate: todayIso(),
  nextDueDate: todayIso(),
  remindDaysBefore: 7,
  status: 'active',
  notes: ''
});

interface Props {
  open: boolean;
  retainer?: Retainer | null;
  onClose: () => void;
}

export function RetainerFormModal({ open, retainer, onClose }: Props) {
  const { clients, settings, saveRetainer } = useData();
  const [values, setValues] = useState<RetainerInput>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(retainer ? { ...retainer } : blank());
      setErrors({});
    }
  }, [open, retainer]);

  const set = <K extends keyof RetainerInput,>(key: K, value: RetainerInput[K]) => setValues((v) => ({ ...v, [key]: value }));

  const pickClient = (clientId: string) => {
    const c = clients.find((x) => x.id === clientId);
    setValues((v) => ({ ...v, clientId: c ? c.id : null, clientName: c ? c.name : v.clientName }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.clientId && !values.clientName.trim()) next.client = 'Choose a client or type a name.';
    if (!values.title.trim()) next.title = 'Give this plan a title.';
    if (values.amount <= 0) next.amount = 'Enter the charge amount.';
    if (!values.nextDueDate) next.nextDueDate = 'Pick the next due date.';
    setErrors(next);
    if (Object.keys(next).length) return;
    // For a brand-new plan the first due date is also the billing-day anchor.
    saveRetainer(retainer ? values : { ...values, startDate: values.nextDueDate });
    toast.success(retainer ? 'Maintenance plan updated' : 'Maintenance plan added');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" title={retainer ? 'Edit maintenance plan' : 'New maintenance plan'} description="A recurring charge for a client’s ongoing project.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Client"
            value={values.clientId ?? ''}
            onChange={(e) => pickClient(e.target.value)}
            error={errors.client}
            options={[{ value: '', label: clients.length ? 'Select a saved client…' : 'No saved clients yet' }, ...clients.map((c) => ({ value: c.id, label: c.company ? `${c.name} — ${c.company}` : c.name }))]} />
          
          {!values.clientId &&
          <TextField label="…or client name" value={values.clientName} onChange={(e) => set('clientName', e.target.value)} placeholder="Not in the list yet" />
          }
          <TextField label="Plan title" value={values.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="e.g. Website maintenance" containerClassName={values.clientId ? '' : 'sm:col-span-2'} />
          <SelectField label="Project type" value={values.category} onChange={(e) => set('category', e.target.value)} options={categoryOptions.map((c) => ({ value: c, label: c }))} />
          <NumberField label={`Charge (${settings.currencySymbol})`} value={values.amount} step={500} error={errors.amount} onValueChange={(v) => set('amount', v)} />
          <SelectField
            label="Billing cycle"
            value={values.frequency}
            onChange={(e) => set('frequency', e.target.value as RetainerInput['frequency'])}
            options={Object.entries(frequencyLabel).map(([value, label]) => ({ value, label }))} />
          
          <TextField label={retainer ? 'Next due date' : 'First due date'} type="date" value={values.nextDueDate} onChange={(e) => set('nextDueDate', e.target.value)} error={errors.nextDueDate} />
          <NumberField label="Remind me (days before)" value={values.remindDaysBefore} min={0} max={60} step={1} onValueChange={(v) => set('remindDaysBefore', Math.round(v))} />
          <SelectField
            label="Status"
            value={values.status}
            onChange={(e) => set('status', e.target.value as RetainerInput['status'])}
            options={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'ended', label: 'Ended' }]} />
          
        </div>
        <TextAreaField label="Notes" rows={2} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{retainer ? 'Save changes' : 'Add plan'}</Button>
        </div>
      </form>
    </Modal>);

}
