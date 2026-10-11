import React, { useState } from 'react';
import { UserPlusIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { ClientSnapshot, LingoDocument } from '../../types/document';
import { emptyClientSnapshot, snapshotFromClient } from '../../utils/documentFactory';
import type { ValidationErrors } from '../../utils/validation';
import { ClientFormModal } from '../clients/ClientFormModal';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/SelectField';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import { EditorSection } from './EditorSection';

interface ClientSectionProps {
  doc: LingoDocument;
  update: (patch: Partial<LingoDocument>) => void;
  errors: ValidationErrors;
}

export function ClientSection({ doc, update, errors }: ClientSectionProps) {
  const { clients } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const setField = (key: keyof ClientSnapshot, value: string) => update({ client: { ...doc.client, [key]: value } });

  const options = [
  { value: '', label: clients.length ? 'Choose a saved client…' : 'No saved clients yet' },
  ...[...clients].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.id, label: c.company && c.company !== c.name ? `${c.name} — ${c.company}` : c.name }))];


  return (
    <EditorSection
      title="Client"
      description="Pick a saved client to fill these in. Edits here only change this document."
      action={
      <Button variant="secondary" size="sm" icon={UserPlusIcon} onClick={() => setModalOpen(true)}>
          New client
        </Button>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Saved client"
          containerClassName="sm:col-span-2"
          options={options}
          value={doc.client.clientId ?? ''}
          onChange={(e) => {
            const client = clients.find((c) => c.id === e.target.value);
            update({ client: client ? snapshotFromClient(client) : emptyClientSnapshot() });
          }} />
        
        <TextField label="Client name" required value={doc.client.name} onChange={(e) => setField('name', e.target.value)} error={errors.clientName} />
        <TextField label="Company / business name" value={doc.client.company} onChange={(e) => setField('company', e.target.value)} />
        <TextField label="Email" type="email" value={doc.client.email} onChange={(e) => setField('email', e.target.value)} error={errors.clientEmail} />
        <TextField label="Phone" type="tel" value={doc.client.phone} onChange={(e) => setField('phone', e.target.value)} />
        <TextAreaField label="Address" containerClassName="sm:col-span-2" rows={2} value={doc.client.address} onChange={(e) => setField('address', e.target.value)} />
      </div>
      <ClientFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={(c) => update({ client: snapshotFromClient(c) })} />
    </EditorSection>);

}