import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { Client, ClientInput } from '../../types/client';
import { isValidEmail } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';

interface ClientFormModalProps {
  open: boolean;
  client?: Client | null;
  onClose: () => void;
  onSaved?: (client: Client) => void;
}

const emptyInput: ClientInput = { name: '', company: '', email: '', phone: '', address: '', notes: '' };

export function ClientFormModal({ open, client, onClose, onSaved }: ClientFormModalProps) {
  const { saveClient } = useData();
  const [values, setValues] = useState<ClientInput>(emptyInput);
  const [errors, setErrors] = useState<{name?: string;email?: string;}>({});

  useEffect(() => {
    if (open) {
      setValues(client ? { ...client } : emptyInput);
      setErrors({});
    }
  }, [open, client]);

  const set = (key: keyof ClientInput, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = 'Client name is required.';
    if (values.email.trim() && !isValidEmail(values.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const saved = saveClient(values);
    toast.success(client ? 'Client updated' : `${saved.name} added to clients`);
    onSaved?.(saved);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Edit client' : 'New client'} description="Saved clients can be reused on any invoice or quotation.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Client name" required value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
          <TextField label="Company / business" value={values.company} onChange={(e) => set('company', e.target.value)} />
          <TextField label="Email" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <TextField label="Phone" type="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <TextAreaField label="Billing address" rows={2} value={values.address} onChange={(e) => set('address', e.target.value)} />
        <TextAreaField label="Notes" rows={2} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{client ? 'Save changes' : 'Add client'}</Button>
        </div>
      </form>
    </Modal>);

}