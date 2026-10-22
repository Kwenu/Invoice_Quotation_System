import React from 'react';
import type { AppSettings } from '../../types/settings';
import { formatMoney } from '../../utils/format';
import { GroupLogo } from '../ui/GroupLogo';
import { TextField } from '../ui/TextField';
import { SettingsGroup } from './SettingsGroup';

interface PanelProps {
  value: AppSettings;
  onChange: (value: AppSettings) => void;
}

export function CompanySettingsPanel({ value, onChange }: PanelProps) {
  return (
    <>
      <SettingsGroup title="Company" description="Used across the app and as the default company line on documents.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Registered company name" value={value.companyName} onChange={(e) => onChange({ ...value, companyName: e.target.value })} />
          <div>
            <span className="mb-1.5 block text-xs font-medium text-ink-soft">Official logo (Lingo Groups)</span>
            <div className="flex h-10 items-center rounded-lg border border-line bg-canvas px-3">
              <GroupLogo width={40} variant="mark" />
            </div>
          </div>
        </div>
      </SettingsGroup>
      <SettingsGroup title="Currency" description="Sri Lankan Rupee is the default. Multi-currency can be added later.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Currency symbol" value={value.currencySymbol} onChange={(e) => onChange({ ...value, currencySymbol: e.target.value })} hint={`Preview: ${formatMoney(29500, value.currencySymbol)}`} />
          <TextField label="Currency code" value={value.currencyCode} readOnly hint="Fixed to LKR in this release." />
        </div>
      </SettingsGroup>
    </>);

}