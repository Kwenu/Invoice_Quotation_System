import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { MemberInput, TeamMember } from '../../types/team';
import { isValidEmail } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SelectField } from '../ui/SelectField';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';

const empty: MemberInput = { name: '', role: '', email: '', phone: '', status: 'active', startDate: '', notes: '' };

interface Props {
  open: boolean;
  member?: TeamMember | null;
  onClose: () => void;
  onSaved?: (member: TeamMember) => void;
}

export function MemberFormModal({ open, member, onClose, onSaved }: Props) {
  const { saveMember } = useData();
  const [values, setValues] = useState<MemberInput>(empty);
  const [errors, setErrors] = useState<{name?: string;email?: string;}>({});

  useEffect(() => {
    if (open) {
      setValues(member ? { ...member } : empty);
      setErrors({});
    }
  }, [open, member]);

  const set = <K extends keyof MemberInput,>(key: K, value: MemberInput[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = 'Name is required.';
    if (values.email.trim() && !isValidEmail(values.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const saved = saveMember(values);
    toast.success(member ? 'Team member updated' : `${saved.name} added to the team`);
    onSaved?.(saved);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={member ? 'Edit team member' : 'Add team member'} description="Hired people and planned hires can both be tracked here.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" required value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
          <TextField label="Role" placeholder="e.g. Frontend developer" value={values.role} onChange={(e) => set('role', e.target.value)} />
          <TextField label="Email" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <TextField label="Phone" type="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
          <SelectField
            label="Status"
            value={values.status}
            onChange={(e) => set('status', e.target.value as MemberInput['status'])}
            options={[
            { value: 'active', label: 'Active — currently working' },
            { value: 'planned', label: 'Planned hire — upcoming' },
            { value: 'former', label: 'Former member' }]
            } />
          
          <TextField
            label={values.status === 'planned' ? 'Expected start date' : 'Joined on'}
            type="date"
            value={values.startDate}
            onChange={(e) => set('startDate', e.target.value)} />
          
        </div>
        <TextAreaField label="Notes" rows={2} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{member ? 'Save changes' : 'Add member'}</Button>
        </div>
      </form>
    </Modal>);

}
