import React from 'react';
import type { LingoDocument } from '../../types/document';
import type { ValidationErrors } from '../../utils/validation';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import { EditorSection } from './EditorSection';

interface DetailsSectionProps {
  doc: LingoDocument;
  update: (patch: Partial<LingoDocument>) => void;
  errors: ValidationErrors;
  provisionalNumber: string;
}

export function DetailsSection({ doc, update, errors, provisionalNumber }: DetailsSectionProps) {
  const isInvoice = doc.type === 'invoice';
  return (
    <EditorSection title="Document details">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={isInvoice ? 'Invoice number' : 'Quotation number'}
          value={doc.number || provisionalNumber}
          readOnly
          hint={doc.number ? 'Locked — numbers never change once assigned.' : 'Reserved automatically when you first save.'} />
        
        <TextField
          label={isInvoice ? 'Invoice date' : 'Quotation date'}
          type="date"
          value={doc.issueDate}
          onChange={(e) => update({ issueDate: e.target.value })}
          error={errors.issueDate} />
        
        {isInvoice ?
        <TextField label="Payment due date" type="date" value={doc.dueDate} onChange={(e) => update({ dueDate: e.target.value })} error={errors.dueDate} /> :

        <TextField label="Valid until" type="date" value={doc.validUntil} onChange={(e) => update({ validUntil: e.target.value })} error={errors.validUntil} />
        }
        <TextField
          label={isInvoice ? 'Project name / reference' : 'Project title'}
          placeholder={isInvoice ? 'Used for search — not printed' : 'e.g. Web application redesign'}
          value={doc.projectName}
          onChange={(e) => update({ projectName: e.target.value })} />
        
        {!isInvoice &&
        <TextAreaField
          label="Project description"
          containerClassName="sm:col-span-2"
          rows={2}
          value={doc.projectDescription}
          onChange={(e) => update({ projectDescription: e.target.value })} />

        }
      </div>
    </EditorSection>);

}