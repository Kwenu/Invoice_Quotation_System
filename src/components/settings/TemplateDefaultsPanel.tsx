import React from 'react';
import { templateAssignments } from '../../data/divisions';
import type { TemplateId } from '../../types/document';
import type { AppSettings, TemplateDefaults } from '../../types/settings';
import { NumberField } from '../ui/NumberField';
import { TextAreaField } from '../ui/TextAreaField';
import { SettingsGroup } from './SettingsGroup';

interface PanelProps {
  value: AppSettings;
  onChange: (value: AppSettings) => void;
}

export function TemplateDefaultsPanel({ value, onChange }: PanelProps) {
  const set = (id: TemplateId, patch: Partial<TemplateDefaults>) =>
  onChange({ ...value, templates: { ...value.templates, [id]: { ...value.templates[id], ...patch } } });

  return (
    <>
      {templateAssignments.map((t) => {
        const d = value.templates[t.templateId];
        const isQuote = t.type === 'quotation';
        return (
          <SettingsGroup key={t.templateId} title={t.label} description={`Default wording for new documents.`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextAreaField label="Notes" containerClassName="sm:col-span-2" rows={2} value={d.notes} onChange={(e) => set(t.templateId, { notes: e.target.value })} />
              <TextAreaField
                label={isQuote ? 'Pricing conditions' : 'Terms and conditions'}
                containerClassName="sm:col-span-2"
                rows={3}
                value={d.terms}
                onChange={(e) => set(t.templateId, { terms: e.target.value })} />
              
              {!isQuote &&
              <TextAreaField
                label="Payment instructions"
                containerClassName="sm:col-span-2"
                rows={2}
                placeholder="Optional"
                value={d.paymentInstructions}
                onChange={(e) => set(t.templateId, { paymentInstructions: e.target.value })} />

              }
              {isQuote ?
              <NumberField label="Valid for (days)" value={d.validDays} onValueChange={(v) => set(t.templateId, { validDays: Math.round(v) })} /> :

              <NumberField label="Payment due after (days)" value={d.dueDays} onValueChange={(v) => set(t.templateId, { dueDays: Math.round(v) })} />
              }
            </div>
          </SettingsGroup>);

      })}
    </>);

}