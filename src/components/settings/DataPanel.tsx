import React, { useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, DownloadIcon, RotateCcwIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { supabaseSchemaSql } from '../../data/supabaseSchema';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SettingsGroup } from './SettingsGroup';

export function DataPanel() {
  const { documents, clients, team, retainers, resetData, exportData } = useData();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingo-billing-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SettingsGroup title="Storage" description="This prototype keeps records in your browser. They are not shared between devices and are not a secure financial record.">
        <div className="rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-ink-soft">
          <p className="font-medium text-warning">Temporary prototype persistence</p>
          <p className="mt-1">
            {documents.length} documents, {clients.length} clients, {team.length} team members and {retainers.length} maintenance plans stored locally. Export a backup before clearing browser data.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" icon={DownloadIcon} onClick={handleExport}>Export backup (JSON)</Button>
          <Button variant="danger" icon={RotateCcwIcon} onClick={() => setConfirmReset(true)}>Reset to sample data</Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Supabase integration" description="Run this schema, then implement the repository in utils/repository.ts. Deploy to Vercel with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY only.">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            icon={CopyIcon}
            className="absolute right-3 top-3"
            onClick={() => navigator.clipboard.writeText(supabaseSchemaSql).then(() => toast.success('Schema copied'), () => toast.error('Copy failed'))}>
            
            Copy SQL
          </Button>
          <pre className="max-h-96 overflow-auto rounded-xl bg-ink p-4 pt-14 text-xs leading-relaxed text-white/85">
            <code>{supabaseSchemaSql}</code>
          </pre>
        </div>
      </SettingsGroup>

      <ConfirmDialog
        open={confirmReset}
        title="Reset prototype data?"
        description="All documents, clients and settings in this browser will be replaced with the three sample documents. This can't be undone."
        confirmLabel="Reset data"
        tone="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetData();
          setConfirmReset(false);
          toast.success('Prototype data reset');
        }} />
      
    </>);

}