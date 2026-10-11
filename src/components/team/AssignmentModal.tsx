import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { ShareMode, TeamAssignment } from '../../types/team';
import { formatMoney } from '../../utils/format';
import { getDocumentSummary } from '../../utils/status';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { NumberField } from '../ui/NumberField';
import { SelectField } from '../ui/SelectField';
import { TextField } from '../ui/TextField';

interface Props {
  open: boolean;
  memberId: string;
  assignment?: TeamAssignment | null;
  onClose: () => void;
}

const MANUAL = 'manual';

export function AssignmentModal({ open, memberId, assignment, onClose }: Props) {
  const { documents, settings, saveAssignment } = useData();
  const currency = settings.currencySymbol;
  const [source, setSource] = useState(MANUAL);
  const [label, setLabel] = useState('');
  const [baseAmount, setBaseAmount] = useState(0);
  const [mode, setMode] = useState<ShareMode>('percent');
  const [value, setValue] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const invoices = useMemo(
    () => documents.
    filter((d) => d.type === 'invoice' && d.status !== 'cancelled').
    map(getDocumentSummary).
    sort((a, b) => b.doc.issueDate.localeCompare(a.doc.issueDate)),
    [documents]
  );

  useEffect(() => {
    if (!open) return;
    setSource(assignment?.documentId ?? MANUAL);
    setLabel(assignment?.label ?? '');
    setBaseAmount(assignment?.baseAmount ?? 0);
    setMode(assignment?.mode ?? 'percent');
    setValue(assignment?.value ?? 0);
    setNote(assignment?.note ?? '');
    setError('');
  }, [open, assignment]);

  const picked = invoices.find((s) => s.doc.id === source);
  const base = picked ? picked.totals.total : baseAmount;
  const amount = mode === 'fixed' ? value : base * value / 100;

  const onSourceChange = (id: string) => {
    setSource(id);
    const s = invoices.find((x) => x.doc.id === id);
    if (s && !label.trim()) setLabel(s.doc.projectName || `${s.doc.number} — ${s.doc.client.name}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return setError('Give the project a name.');
    if (value <= 0) return setError('Enter the member’s portion.');
    if (mode === 'percent' && value > 100) return setError('A percentage cannot be more than 100.');
    saveAssignment({
      id: assignment?.id,
      memberId,
      documentId: picked ? picked.doc.id : null,
      label,
      baseAmount: picked ? 0 : baseAmount,
      mode,
      value,
      note: note.trim()
    });
    toast.success(assignment ? 'Portion updated' : 'Portion added');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={assignment ? 'Edit portion' : 'Add project portion'} description="What this member earns from a project.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <SelectField
          label="Project source"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          options={[
          { value: MANUAL, label: 'Manual / upcoming project (no invoice yet)' },
          ...invoices.map((s) => ({
            value: s.doc.id,
            label: `${s.doc.number} · ${s.doc.client.name || 'No client'} · ${formatMoney(s.totals.total, currency)}`
          }))]
          }
          hint={picked ? 'Percentages follow this invoice total. Payouts unlock as the client pays.' : undefined} />
        
        <TextField label="Project name" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Cloud X website redesign" />
        {!picked && mode === 'percent' &&
        <NumberField label={`Project value (${currency})`} value={baseAmount} step={1000} onValueChange={setBaseAmount} />
        }
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Portion type"
            value={mode}
            onChange={(e) => setMode(e.target.value as ShareMode)}
            options={[
            { value: 'percent', label: 'Percentage of project (%)' },
            { value: 'fixed', label: `Fixed amount (${currency})` }]
            } />
          
          <NumberField label={mode === 'percent' ? 'Percentage' : `Amount (${currency})`} value={value} step={mode === 'percent' ? 1 : 500} suffix={mode === 'percent' ? '%' : undefined} onValueChange={setValue} />
        </div>
        <div className="rounded-xl bg-canvas px-4 py-3 text-sm">
          <div className="flex justify-between"><span className="text-ink-muted">Member earns</span><span className="font-semibold tabular-nums text-ink">{formatMoney(amount, currency)}</span></div>
          {mode === 'percent' && base > 0 &&
          <div className="mt-1 flex justify-between"><span className="text-ink-muted">Company keeps</span><span className="tabular-nums text-ink-soft">{formatMoney(base - amount, currency)}</span></div>
          }
        </div>
        <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{assignment ? 'Save changes' : 'Add portion'}</Button>
        </div>
      </form>
    </Modal>);

}
