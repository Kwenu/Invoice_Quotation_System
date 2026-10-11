import React from 'react';
import type { LingoDocument } from '../../types/document';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import { ToggleField } from '../ui/ToggleField';
import { EditorSection } from './EditorSection';

interface NotesSectionProps {
  doc: LingoDocument;
  update: (patch: Partial<LingoDocument>) => void;
}

export function NotesSection({ doc, update }: NotesSectionProps) {
  const isQuote = doc.type === 'quotation';
  return (
    <EditorSection title={isQuote ? 'Notes, pricing & signature' : 'Notes, terms & signature'}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaField label="Notes" containerClassName="sm:col-span-2" rows={2} value={doc.notes} onChange={(e) => update({ notes: e.target.value })} />
        <TextAreaField
          label={isQuote ? 'Pricing conditions' : 'Terms and conditions'}
          containerClassName="sm:col-span-2"
          rows={3}
          value={doc.terms}
          onChange={(e) => update({ terms: e.target.value })} />
        
        <TextField
          label="Authorised representative"
          value={doc.representative.name}
          onChange={(e) => update({ representative: { ...doc.representative, name: e.target.value } })} />
        
        <TextField
          label="Designation"
          value={doc.representative.designation}
          onChange={(e) => update({ representative: { ...doc.representative, designation: e.target.value } })} />
        
        <TextField label="Company line" containerClassName="sm:col-span-2" value={doc.companyLine} onChange={(e) => update({ companyLine: e.target.value })} />
      </div>
      {isQuote &&
      <div className="mt-5 space-y-4 border-t border-line pt-5">
          <ToggleField
          label="Show totals on quotation"
          description="Turn off when items are alternatives (e.g. annual vs monthly) that shouldn't be summed."
          checked={doc.display.showTotals}
          onChange={(v) => update({ display: { ...doc.display, showTotals: v } })} />
        
          <ToggleField
          label="Print project title & description"
          checked={doc.display.showProjectDetails}
          onChange={(v) => update({ display: { ...doc.display, showProjectDetails: v } })} />
        
        </div>
      }
    </EditorSection>);

}