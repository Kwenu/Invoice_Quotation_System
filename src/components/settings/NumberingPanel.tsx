import React from 'react';
import { useData } from '../../contexts/DataContext';
import { templateAssignments } from '../../data/divisions';
import type { TemplateId } from '../../types/document';
import type { AppSettings, NumberingConfig, YearFormat } from '../../types/settings';
import { allocateNumber, formatDocumentNumber } from '../../utils/numbering';
import { todayIso } from '../../utils/format';
import { NumberField } from '../ui/NumberField';
import { SelectField } from '../ui/SelectField';
import { TextField } from '../ui/TextField';
import { SettingsGroup } from './SettingsGroup';

interface PanelProps {
  value: AppSettings;
  onChange: (value: AppSettings) => void;
}

export function NumberingPanel({ value, onChange }: PanelProps) {
  const { documents } = useData();
  const taken = new Set(documents.map((d) => d.number));
  const set = (id: TemplateId, patch: Partial<NumberingConfig>) =>
  onChange({ ...value, numbering: { ...value.numbering, [id]: { ...value.numbering[id], ...patch } } });

  return (
    <>
      {templateAssignments.map((t) => {
        const cfg = value.numbering[t.templateId];
        const preview = formatDocumentNumber(cfg, cfg.nextNumber, todayIso());
        const actual = allocateNumber(cfg, taken, todayIso()).number;
        return (
          <SettingsGroup key={t.templateId} title={t.label} description="Each sequence is independent. Existing numbers never change.">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <TextField label="Prefix" value={cfg.prefix} onChange={(e) => set(t.templateId, { prefix: e.target.value.toUpperCase() })} />
              <TextField label="Separator" maxLength={2} value={cfg.separator} onChange={(e) => set(t.templateId, { separator: e.target.value })} />
              <SelectField
                label="Year"
                value={cfg.yearFormat}
                onChange={(e) => set(t.templateId, { yearFormat: e.target.value as YearFormat })}
                options={[
                { value: 'YYYY', label: '2026' },
                { value: 'YY', label: '26' },
                { value: 'none', label: 'No year' }]
                } />
              
              <NumberField label="Digits" value={cfg.padding} min={1} max={8} onValueChange={(v) => set(t.templateId, { padding: Math.round(v) || 1 })} />
              <NumberField label="Next number" value={cfg.nextNumber} min={1} onValueChange={(v) => set(t.templateId, { nextNumber: Math.max(1, Math.round(v)) })} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-canvas px-4 py-3 text-sm">
              <span className="text-ink-muted">Next document</span>
              <span className="font-mono font-medium text-ink">{actual}</span>
              {actual !== preview && <span className="text-xs text-warning">{preview} is already used, so it will be skipped.</span>}
            </div>
          </SettingsGroup>);

      })}
    </>);

}