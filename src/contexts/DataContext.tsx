import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Button } from '../components/ui/Button';
import { seedClients } from '../data/seedClients';
import { seedDocuments } from '../data/seedDocuments';
import { hasStoredSettings, supabaseRepository } from '../utils/supabaseRepository';
import type { Client, ClientInput } from '../types/client';
import type { LingoDocument, Payment, StoredStatus } from '../types/document';
import type { AppSettings } from '../types/settings';
import type { Retainer, RetainerCollection, RetainerInput, RetainerStatus } from '../types/retainer';
import type { AssignmentInput, MemberInput, TeamAssignment, TeamMember, TeamPayout } from '../types/team';
import { nextDueAfter } from '../utils/retainers';
import { calculateTotals } from '../utils/calculations';
import { cloneAsDraft, documentTypeLabel, invoiceFromQuotation } from '../utils/documentFactory';
import { formatMoney } from '../utils/format';
import { createId } from '../utils/id';
import { allocateNumber } from '../utils/numbering';
import { createEmptyData, loadPrototypeSync, prototypeRepository, readLocalPrototypeData, resetPrototypeData, type AppData, type DataRepository } from '../utils/repository';
import { statusMeta } from '../utils/status';

export type SaveIntent = 'draft' | 'final' | 'autosave';
export type SyncStatus = 'idle' | 'saving' | 'error';

interface DataContextValue {
  settings: AppSettings;
  clients: Client[];
  documents: LingoDocument[];
  team: TeamMember[];
  assignments: TeamAssignment[];
  payouts: TeamPayout[];
  retainers: Retainer[];
  storageMode: 'supabase' | 'prototype-local';
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncedAt: string | null;
  retrySync: () => void;
  /** One-time upload of records this browser saved before Supabase was connected. Returns counts, or null if there is nothing to import. */
  importLocalData: () => Promise<{clients: number;documents: number;team: number;retainers: number;} | null>;
  saveClient: (input: ClientInput) => Client;
  saveDocument: (doc: LingoDocument, intent: SaveIntent) => LingoDocument;
  recordPayment: (docId: string, payment: Omit<Payment, 'id' | 'recordedAt'>) => void;
  removePayment: (docId: string, paymentId: string) => void;
  setDocumentStatus: (docId: string, status: StoredStatus) => void;
  setArchived: (docId: string, archived: boolean) => void;
  duplicateDocument: (docId: string) => LingoDocument | null;
  convertToInvoice: (quotationId: string) => LingoDocument | null;
  saveMember: (input: MemberInput) => TeamMember;
  deleteMember: (id: string) => void;
  saveAssignment: (input: AssignmentInput) => TeamAssignment;
  removeAssignment: (id: string) => void;
  recordPayout: (payout: Omit<TeamPayout, 'id' | 'recordedAt'>) => void;
  removePayout: (id: string) => void;
  saveRetainer: (input: RetainerInput) => Retainer;
  deleteRetainer: (id: string) => void;
  setRetainerStatus: (id: string, status: RetainerStatus) => void;
  collectRetainer: (id: string, input: Omit<RetainerCollection, 'id' | 'recordedAt' | 'dueDate'>) => void;
  removeCollection: (retainerId: string, collectionId: string) => void;
  updateSettings: (settings: AppSettings) => void;
  resetData: () => void;
  exportData: () => AppData;
}

const DataContext = createContext<DataContextValue | null>(null);
const repository: DataRepository = isSupabaseConfigured ? supabaseRepository : prototypeRepository;
const SAVE_DELAY_MS = repository.mode === 'supabase' ? 600 : 0;

const addMissing = <T extends {id: string;},>(base: T[], extra: T[]) => {
  const have = new Set(base.map((x) => x.id));
  return [...base, ...extra.filter((x) => !have.has(x.id))];
};

const historyEntry = (action: string, detail: string) => ({
  id: createId('hist'),
  at: new Date().toISOString(),
  action,
  detail
});

export function DataProvider({ children }: {children: ReactNode;}) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(() => isSupabaseConfigured ? createEmptyData() : loadPrototypeSync());
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>(isSupabaseConfigured ? 'idle' : 'ready');
  const [loadError, setLoadError] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Latest committed state, read synchronously so back-to-back saves never reuse a number.
  const dataRef = useRef(data);
  // Last state known to be stored. Each save sends the difference between this and dataRef, so a failed
  // save is simply retried with everything that is still missing.
  const syncedRef = useRef(data);
  const flushing = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    setSyncStatus('saving');
    try {
      while (syncedRef.current !== dataRef.current) {
        const target = dataRef.current;
        await repository.save(syncedRef.current, target);
        syncedRef.current = target;
      }
      setSyncError(null);
      setSyncStatus('idle');
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reach the database.';
      setSyncError(message);
      setSyncStatus('error');
      toast.error('Changes are not saved yet', { description: `${message} — they will be retried automatically.`, id: 'sync-error' });
    } finally {
      flushing.current = false;
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    window.clearTimeout(timer.current);
    if (SAVE_DELAY_MS === 0) void flush();else
    timer.current = window.setTimeout(() => void flush(), SAVE_DELAY_MS);
  }, [flush]);

  const commit = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
    scheduleFlush();
  }, [scheduleFlush]);

  // Supabase mode: load everything after sign-in, clear it on sign-out.
  const userKey = user?.email ?? null;
  const loadAll = useCallback(async () => {
    setLoadState('loading');
    try {
      const loaded = await repository.load();
      dataRef.current = loaded;
      syncedRef.current = loaded;
      setData(loaded);
      setLoadState('ready');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load your data.');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (userKey) {
      void loadAll();
    } else {
      const empty = createEmptyData();
      dataRef.current = empty;
      syncedRef.current = empty;
      setData(empty);
      setLoadState('idle');
      setSyncStatus('idle');
      setSyncError(null);
    }
  }, [userKey, loadAll]);

  // Retry when the connection comes back; warn before closing the tab with unsaved changes.
  useEffect(() => {
    const onOnline = () => {if (syncedRef.current !== dataRef.current) void flush();};
    const onUnload = (e: BeforeUnloadEvent) => {
      if (repository.mode === 'supabase' && syncedRef.current !== dataRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [flush]);

  const retrySync = useCallback(() => void flush(), [flush]);

  const importLocalData = useCallback(async () => {
    const local = readLocalPrototypeData();
    if (!local) return null;
    const seededClients = new Set(seedClients.map((c) => c.id));
    const seededDocs = new Set(seedDocuments.map((d) => d.id));
    const current = dataRef.current;
    const keepRemoteSettings = await hasStoredSettings();
    const merged: AppData = {
      version: 1,
      settings: keepRemoteSettings ? current.settings : local.settings,
      clients: addMissing(current.clients, local.clients.filter((c) => !seededClients.has(c.id))),
      documents: addMissing(current.documents, local.documents.filter((d) => !seededDocs.has(d.id))),
      team: addMissing(current.team, local.team),
      assignments: addMissing(current.assignments, local.assignments),
      payouts: addMissing(current.payouts, local.payouts),
      retainers: addMissing(current.retainers, local.retainers)
    };
    const counts = {
      clients: merged.clients.length - current.clients.length,
      documents: merged.documents.length - current.documents.length,
      team: merged.team.length - current.team.length,
      retainers: merged.retainers.length - current.retainers.length
    };
    commit(merged);
    return counts;
  }, [commit]);

  const saveClient = useCallback(
    (input: ClientInput): Client => {
      const current = dataRef.current;
      const now = new Date().toISOString();
      const existing = input.id ? current.clients.find((c) => c.id === input.id) : undefined;
      const client: Client = {
        id: existing?.id ?? createId('cli'),
        name: input.name.trim(),
        company: input.company.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        notes: input.notes.trim(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      };
      commit({
        ...current,
        clients: existing ? current.clients.map((c) => c.id === client.id ? client : c) : [client, ...current.clients]
      });
      return client;
    },
    [commit]
  );

  const saveDocument = useCallback(
    (input: LingoDocument, intent: SaveIntent): LingoDocument => {
      const current = dataRef.current;
      const now = new Date().toISOString();
      const existing = current.documents.find((d) => d.id === input.id);
      let clients = current.clients;
      let settings = current.settings;

      // Link (or create) a client record so documents show up in client history.
      const client = { ...input.client };
      // Only on an explicit final save — autosaves must not create half-typed client records.
      if (intent === 'final' && !client.clientId && client.name.trim()) {
        const match = clients.find((c) => c.name.trim().toLowerCase() === client.name.trim().toLowerCase());
        if (match) client.clientId = match.id;else
        {
          const created: Client = {
            id: createId('cli'),
            name: client.name.trim(),
            company: client.company,
            email: client.email,
            phone: client.phone,
            address: client.address,
            notes: '',
            createdAt: now,
            updatedAt: now
          };
          clients = [created, ...clients];
          client.clientId = created.id;
        }
      }

      // Numbers are assigned once and never overwritten.
      let number = existing?.number || input.number;
      if (!number) {
        const config = settings.numbering[input.templateId];
        const taken = new Set(current.documents.map((d) => d.number));
        const allocation = allocateNumber(config, taken, input.issueDate);
        number = allocation.number;
        settings = {
          ...settings,
          numbering: { ...settings.numbering, [input.templateId]: { ...config, nextNumber: allocation.nextNumber } }
        };
      }

      const history = [...(existing?.history ?? [])];
      if (!existing) {
        history.push(historyEntry('Created', `${documentTypeLabel(input.type)} ${number} created`));
      } else if (intent !== 'autosave' && existing.status !== 'draft') {
        const before = calculateTotals(existing).total;
        const after = calculateTotals(input).total;
        history.push(
          historyEntry(
            'Edited after issue',
            before !== after ?
            `Total changed from ${formatMoney(before, settings.currencySymbol)} to ${formatMoney(after, settings.currencySymbol)}` :
            'Document details updated'
          )
        );
      }

      const saved: LingoDocument = {
        ...input,
        client,
        number,
        history,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      };
      const documents = existing ?
      current.documents.map((d) => d.id === saved.id ? saved : d) :
      [saved, ...current.documents];
      commit({ ...current, clients, settings, documents });
      return saved;
    },
    [commit]
  );

  const mutateDocument = useCallback(
    (id: string, change: (doc: LingoDocument) => LingoDocument, action: string, detail: string) => {
      const current = dataRef.current;
      const target = current.documents.find((d) => d.id === id);
      if (!target) return;
      const next = { ...change(target), updatedAt: new Date().toISOString() };
      next.history = [...target.history, historyEntry(action, detail)];
      commit({ ...current, documents: current.documents.map((d) => d.id === id ? next : d) });
    },
    [commit]
  );

  const recordPayment = useCallback(
    (docId: string, payment: Omit<Payment, 'id' | 'recordedAt'>) => {
      const symbol = dataRef.current.settings.currencySymbol;
      mutateDocument(
        docId,
        (d) => ({ ...d, payments: [...d.payments, { ...payment, id: createId('pay'), recordedAt: new Date().toISOString() }] }),
        'Payment recorded',
        `${formatMoney(payment.amount, symbol)} received${payment.method ? ` via ${payment.method}` : ''}`
      );
    },
    [mutateDocument]
  );

  const removePayment = useCallback(
    (docId: string, paymentId: string) => {
      const doc = dataRef.current.documents.find((d) => d.id === docId);
      const payment = doc?.payments.find((p) => p.id === paymentId);
      if (!payment) return;
      mutateDocument(
        docId,
        (d) => ({ ...d, payments: d.payments.filter((p) => p.id !== paymentId) }),
        'Payment voided',
        `${formatMoney(payment.amount, dataRef.current.settings.currencySymbol)} payment from ${payment.date} removed`
      );
    },
    [mutateDocument]
  );

  const setDocumentStatus = useCallback(
    (docId: string, status: StoredStatus) => {
      mutateDocument(docId, (d) => ({ ...d, status }), 'Status changed', `Marked as ${statusMeta[status].label.toLowerCase()}`);
    },
    [mutateDocument]
  );

  const setArchived = useCallback(
    (docId: string, archived: boolean) => {
      mutateDocument(docId, (d) => ({ ...d, archived }), archived ? 'Archived' : 'Restored', archived ? 'Moved to archive' : 'Restored from archive');
    },
    [mutateDocument]
  );

  const duplicateDocument = useCallback(
    (docId: string) => {
      const source = dataRef.current.documents.find((d) => d.id === docId);
      if (!source) return null;
      const saved = saveDocument(cloneAsDraft(source, dataRef.current.settings), 'draft');
      mutateDocument(saved.id, (d) => d, 'Duplicated', `Copied from ${source.number}`);
      return saved;
    },
    [saveDocument, mutateDocument]
  );

  const convertToInvoice = useCallback(
    (quotationId: string) => {
      const quotation = dataRef.current.documents.find((d) => d.id === quotationId);
      if (!quotation || quotation.type !== 'quotation' || quotation.status !== 'accepted') return null;
      const invoice = saveDocument(invoiceFromQuotation(quotation, dataRef.current.settings), 'draft');
      mutateDocument(invoice.id, (d) => d, 'Converted', `Created from quotation ${quotation.number}`);
      mutateDocument(
        quotation.id,
        (d) => ({ ...d, status: 'converted', convertedInvoiceId: invoice.id }),
        'Converted to invoice',
        `Invoice ${invoice.number} created`
      );
      return invoice;
    },
    [saveDocument, mutateDocument]
  );


  const saveMember = useCallback(
    (input: MemberInput): TeamMember => {
      const current = dataRef.current;
      const now = new Date().toISOString();
      const existing = input.id ? current.team.find((m) => m.id === input.id) : undefined;
      const member: TeamMember = {
        id: existing?.id ?? createId('mem'),
        name: input.name.trim(),
        role: input.role.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        status: input.status,
        startDate: input.startDate,
        notes: input.notes.trim(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      };
      commit({ ...current, team: existing ? current.team.map((m) => m.id === member.id ? member : m) : [member, ...current.team] });
      return member;
    },
    [commit]
  );

  const deleteMember = useCallback(
    (id: string) => {
      const c = dataRef.current;
      commit({
        ...c,
        team: c.team.filter((m) => m.id !== id),
        assignments: c.assignments.filter((a) => a.memberId !== id),
        payouts: c.payouts.filter((p) => p.memberId !== id)
      });
    },
    [commit]
  );

  const saveAssignment = useCallback(
    (input: AssignmentInput): TeamAssignment => {
      const c = dataRef.current;
      const existing = input.id ? c.assignments.find((a) => a.id === input.id) : undefined;
      const assignment: TeamAssignment = {
        ...input,
        id: existing?.id ?? createId('asg'),
        label: input.label.trim(),
        createdAt: existing?.createdAt ?? new Date().toISOString()
      };
      commit({ ...c, assignments: existing ? c.assignments.map((a) => a.id === assignment.id ? assignment : a) : [assignment, ...c.assignments] });
      return assignment;
    },
    [commit]
  );

  const removeAssignment = useCallback(
    (id: string) => commit({ ...dataRef.current, assignments: dataRef.current.assignments.filter((a) => a.id !== id) }),
    [commit]
  );

  const recordPayout = useCallback(
    (payout: Omit<TeamPayout, 'id' | 'recordedAt'>) => {
      const c = dataRef.current;
      commit({ ...c, payouts: [{ ...payout, id: createId('out'), recordedAt: new Date().toISOString() }, ...c.payouts] });
    },
    [commit]
  );

  const removePayout = useCallback(
    (id: string) => commit({ ...dataRef.current, payouts: dataRef.current.payouts.filter((p) => p.id !== id) }),
    [commit]
  );

  const saveRetainer = useCallback(
    (input: RetainerInput): Retainer => {
      const c = dataRef.current;
      const now = new Date().toISOString();
      const existing = input.id ? c.retainers.find((r) => r.id === input.id) : undefined;
      const linked = input.clientId ? c.clients.find((cl) => cl.id === input.clientId) : undefined;
      const retainer: Retainer = {
        ...input,
        id: existing?.id ?? createId('ret'),
        clientName: (linked?.name ?? input.clientName).trim(),
        title: input.title.trim(),
        collections: existing?.collections ?? [],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      };
      commit({ ...c, retainers: existing ? c.retainers.map((r) => r.id === retainer.id ? retainer : r) : [retainer, ...c.retainers] });
      return retainer;
    },
    [commit]
  );

  const deleteRetainer = useCallback(
    (id: string) => commit({ ...dataRef.current, retainers: dataRef.current.retainers.filter((r) => r.id !== id) }),
    [commit]
  );

  const patchRetainer = useCallback(
    (id: string, change: (r: Retainer) => Retainer) => {
      const c = dataRef.current;
      commit({
        ...c,
        retainers: c.retainers.map((r) => r.id === id ? { ...change(r), updatedAt: new Date().toISOString() } : r)
      });
    },
    [commit]
  );

  const setRetainerStatus = useCallback(
    (id: string, status: RetainerStatus) => patchRetainer(id, (r) => ({ ...r, status })),
    [patchRetainer]
  );

  /** Records the money received for the current due date, then moves the next due date forward. */
  const collectRetainer = useCallback(
    (id: string, input: Omit<RetainerCollection, 'id' | 'recordedAt' | 'dueDate'>) => {
      patchRetainer(id, (r) => ({
        ...r,
        collections: [{ ...input, id: createId('col'), dueDate: r.nextDueDate, recordedAt: new Date().toISOString() }, ...r.collections],
        nextDueDate: nextDueAfter(r, r.nextDueDate)
      }));
    },
    [patchRetainer]
  );

  const removeCollection = useCallback(
    (retainerId: string, collectionId: string) => {
      patchRetainer(retainerId, (r) => {
        const target = r.collections.find((c) => c.id === collectionId);
        if (!target) return r;
        const latest = r.collections.reduce((max, c) => c.dueDate > max ? c.dueDate : max, '');
        return {
          ...r,
          collections: r.collections.filter((c) => c.id !== collectionId),
          // Undoing the most recent collection makes that period due again.
          nextDueDate: target.dueDate === latest ? target.dueDate : r.nextDueDate
        };
      });
    },
    [patchRetainer]
  );

  const updateSettings = useCallback(
    (settings: AppSettings) => commit({ ...dataRef.current, settings }),
    [commit]
  );

  // Reset only exists for the browser-only prototype; a real database is never wiped from the UI.
  const resetData = useCallback(() => {
    if (repository.mode === 'prototype-local') commit(resetPrototypeData());
  }, [commit]);
  const exportData = useCallback(() => dataRef.current, []);

  const value = useMemo<DataContextValue>(
    () => ({
      settings: data.settings,
      clients: data.clients,
      documents: data.documents,
      team: data.team,
      assignments: data.assignments,
      payouts: data.payouts,
      retainers: data.retainers,
      storageMode: repository.mode,
      syncStatus,
      syncError,
      lastSyncedAt,
      retrySync,
      importLocalData,
      saveClient,
      saveDocument,
      recordPayment,
      removePayment,
      setDocumentStatus,
      setArchived,
      duplicateDocument,
      convertToInvoice,
      saveMember,
      deleteMember,
      saveAssignment,
      removeAssignment,
      recordPayout,
      removePayout,
      saveRetainer,
      deleteRetainer,
      setRetainerStatus,
      collectRetainer,
      removeCollection,
      updateSettings,
      resetData,
      exportData
    }),
    [data, saveClient, saveDocument, recordPayment, removePayment, setDocumentStatus, setArchived, duplicateDocument, convertToInvoice, saveMember, deleteMember, saveAssignment, removeAssignment, recordPayout, removePayout, saveRetainer, deleteRetainer, setRetainerStatus, collectRetainer, removeCollection, updateSettings, resetData, exportData, syncStatus, syncError, lastSyncedAt, retrySync, importLocalData]
  );

  if (isSupabaseConfigured && user && loadState !== 'ready') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        {loadState === 'error' ?
        <>
            <p className="text-base font-semibold text-ink">Couldn’t load your data</p>
            <p className="max-w-md text-sm text-ink-muted">{loadError}</p>
            <p className="max-w-md text-xs text-ink-muted">Check your internet connection, and that the database tables from supabase/schema.sql exist.</p>
            <Button onClick={() => void loadAll()}>Try again</Button>
          </> :

        <>
            <Loader2Icon className="h-6 w-6 animate-spin text-ink-muted" aria-hidden />
            <p className="text-sm text-ink-muted">Loading your workspace…</p>
          </>
        }
      </div>);

  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}