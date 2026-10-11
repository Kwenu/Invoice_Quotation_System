import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SaveIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CompanySettingsPanel } from '../components/settings/CompanySettingsPanel';
import { DataPanel } from '../components/settings/DataPanel';
import { DivisionSettingsPanel } from '../components/settings/DivisionSettingsPanel';
import { NumberingPanel } from '../components/settings/NumberingPanel';
import { TemplateDefaultsPanel } from '../components/settings/TemplateDefaultsPanel';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { settingsTabs } from '../data/documentTabs';
import type { AppSettings } from '../types/settings';

export function Settings() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState<AppSettings>(settings);
  const [tab, setTab] = useState('company');
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  useEffect(() => {
    if (!dirty) setForm(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSave = () => {
    const badPrefix = Object.values(form.numbering).some((n) => !n.prefix.trim());
    if (badPrefix) return toast.error('Every numbering sequence needs a prefix.');
    updateSettings(form);
    toast.success('Settings saved');
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Settings"
        description="Company details, payment information, document wording and numbering."
        actions={
        <>
            {dirty && <Button variant="ghost" onClick={() => setForm(settings)}>Discard</Button>}
            <Button icon={SaveIcon} onClick={handleSave} disabled={!dirty}>Save settings</Button>
          </>
        } />
      
      <div className="mt-6 rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-3 sm:px-4">
          <SegmentedTabs label="Settings sections" items={settingsTabs} value={tab} onChange={setTab} />
        </div>
        <div className="p-5 sm:p-6">
          {tab === 'company' && <CompanySettingsPanel value={form} onChange={setForm} />}
          {tab === 'divisions' && <DivisionSettingsPanel value={form} onChange={setForm} />}
          {tab === 'templates' && <TemplateDefaultsPanel value={form} onChange={setForm} />}
          {tab === 'numbering' && <NumberingPanel value={form} onChange={setForm} />}
          {tab === 'data' && <DataPanel />}
        </div>
      </div>
      {dirty &&
      <p className="mt-3 text-sm text-warning" role="status">
          You have unsaved settings changes.
        </p>
      }
    </div>);

}