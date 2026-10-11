import React from 'react';
import { RotateCcwIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { LingoDocument, PaymentDetails } from '../../types/document';
import { Button } from '../ui/Button';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import { EditorSection } from './EditorSection';

interface PaymentDetailsSectionProps {
  doc: LingoDocument;
  update: (patch: Partial<LingoDocument>) => void;
}

export function PaymentDetailsSection({ doc, update }: PaymentDetailsSectionProps) {
  const { settings } = useData();
  const p = doc.paymentDetails;
  const set = (key: keyof PaymentDetails, value: string) => update({ paymentDetails: { ...p, [key]: value } });

  return (
    <EditorSection
      title="Payment details"
      description="Pre-filled from division settings."
      action={
      <Button
        variant="ghost"
        size="sm"
        icon={RotateCcwIcon}
        onClick={() =>
        update({
          paymentDetails: { ...settings.divisions[doc.division].paymentDetails },
          paymentInstructions: settings.templates[doc.templateId].paymentInstructions
        })
        }>
        
          Reset to defaults
        </Button>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Payment method" placeholder="e.g. Bank transfer" value={p.method} onChange={(e) => set('method', e.target.value)} />
        <TextField label="Account holder" value={p.accountHolder} onChange={(e) => set('accountHolder', e.target.value)} />
        <TextField label="Bank name" value={p.bankName} onChange={(e) => set('bankName', e.target.value)} />
        <TextField label="Account number" value={p.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} />
        <TextField label="Branch" value={p.branch} onChange={(e) => set('branch', e.target.value)} />
        <TextField label="Payment reference" placeholder="Optional" value={p.reference} onChange={(e) => set('reference', e.target.value)} />
        <TextAreaField
          label="Payment instructions"
          containerClassName="sm:col-span-2"
          rows={2}
          placeholder="Optional — printed under the bank details"
          value={doc.paymentInstructions}
          onChange={(e) => update({ paymentInstructions: e.target.value })} />
        
      </div>
    </EditorSection>);

}