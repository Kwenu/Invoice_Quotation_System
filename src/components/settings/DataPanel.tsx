import React, { useState } from 'react';
import { toast } from 'sonner';
import { CloudUploadIcon, CopyIcon, DownloadIcon, RotateCcwIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { supabaseSchemaSql } from '../../data/supabaseSchema';
import { readLocalPrototypeData } from '../../utils/repository';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SettingsGroup } from './SettingsGroup';

export function DataPanel() {
  const { documents, clients, team, retainers, storageMode, syncStatus, lastSyncedAt, resetData, exportData, importLocalData } = useData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const cloud = storageMode === 'supabase';
  const localAvailable = cloud && readLocalPrototypeData() !== null;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingo-billing-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setConfirmImport(false);
    setImporting(true);
    try {
      const counts = await importLocalData();
      toast.success(counts ?
      `Uploaded ${counts.documents} documents, ${counts.clients} clients, ${counts.team} team members and ${counts.retainers} maintenance plans` :
      'No browser data found to upload');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <SettingsGroup
        title="Storage"
        description={cloud ?
        'Everything — clients, documents, payments, maintenance, team and these settings — is stored in your Supabase database and shared across devices.' :
        'Supabase is not connected, so records are kept in this browser only. They are not shared between devices and are not a secure financial record.'}>
        
        {cloud ?
        <div className="rounded-xl border border-success/25 bg-success-soft px-4 py-3 text-sm text-ink-soft">
            <p className="font-medium text-success">Connected to Supabase</p>
            <p className="mt-1">
              {documents.length} documents, {clients.length} clients, {team.length} team members and {retainers.length} maintenance plans.{' '}
              {syncStatus === 'saving' ? 'Saving…' : syncStatus === 'error' ? 'Some changes are waiting to save.' : lastSyncedAt ? 'All changes saved.' : 'Up to date.'}
            </p>
          </div> :
        <div className="rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-ink-soft">
            <p className="font-medium text-warning">Temporary prototype persistence</p>
            <p className="mt-1">
              {documents.length} documents, {clients.length} clients, {team.length} team members and {retainers.length} maintenance plans stored locally. Add{' '}
              <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> and restart to use the database.
            </p>
          </div>
        }
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" icon={DownloadIcon} onClick={handleExport}>Export backup (JSON)</Button>
          {localAvailable &&
          <Button variant="secondary" icon={CloudUploadIcon} loading={importing} onClick={() => setConfirmImport(true)}>Upload data saved in this browser</Button>
          }
          {!cloud && <Button variant="danger" icon={RotateCcwIcon} onClick={() => setConfirmReset(true)}>Reset to sample data</Button>}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Database schema" description="Run this once in Supabase → SQL Editor (the same SQL is in supabase/schema.sql). See SUPABASE_SETUP.md for the full steps.">
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
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetData();
          setConfirmReset(false);
          toast.success('Prototype data reset');
        }} />
      
      <ConfirmDialog
        open={confirmImport}
        title="Upload browser data to Supabase?"
        description="Documents, clients, team members, payouts and maintenance plans saved in this browser are copied into your database (the built-in sample records are skipped). Anything already in the database is kept. Your saved settings are only used if the database has none yet."
        confirmLabel="Upload"
        cancelLabel="Cancel"
        onCancel={() => setConfirmImport(false)}
        onConfirm={() => void handleImport()} />
      
    </>);

}
