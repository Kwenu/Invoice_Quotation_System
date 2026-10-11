import React from 'react';
import { divisions } from '../../data/divisions';
import { statusFilterOptions } from '../../data/documentTabs';
import type { DocumentFilters } from '../../utils/filters';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/SelectField';
import { TextField } from '../ui/TextField';

interface DashboardFilterBarProps {
  filters: DocumentFilters;
  onChange: (filters: DocumentFilters) => void;
  onReset: () => void;
  showReset: boolean;
}

export function DashboardFilterBar({ filters, onChange, onReset, showReset }: DashboardFilterBarProps) {
  const set = <K extends keyof DocumentFilters,>(key: K, value: DocumentFilters[K]) => onChange({ ...filters, [key]: value });
  return (
    <div className="grid grid-cols-2 items-end gap-3 md:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
      <SelectField
        label="Division"
        value={filters.division}
        onChange={(e) => set('division', e.target.value as DocumentFilters['division'])}
        options={[{ value: 'all', label: 'All divisions' }, ...divisions.map((d) => ({ value: d.id, label: d.shortName }))]} />
      
      <SelectField
        label="Document type"
        value={filters.type}
        onChange={(e) => set('type', e.target.value as DocumentFilters['type'])}
        options={[
        { value: 'all', label: 'All types' },
        { value: 'invoice', label: 'Invoices' },
        { value: 'quotation', label: 'Quotations' }]
        } />
      
      <SelectField
        label="Status"
        value={filters.status}
        onChange={(e) => set('status', e.target.value as DocumentFilters['status'])}
        options={statusFilterOptions} />
      
      <TextField label="From" type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
      <TextField label="To" type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
      <div className="col-span-2 md:col-span-1">
        <Button variant="ghost" onClick={onReset} disabled={!showReset} className="w-full md:w-auto">
          Reset
        </Button>
      </div>
    </div>);

}