import { defaultSettings } from '../data/defaultSettings';
import { seedClients } from '../data/seedClients';
import { seedDocuments } from '../data/seedDocuments';
import type { Client } from '../types/client';
import type { LingoDocument } from '../types/document';
import type { Retainer } from '../types/retainer';
import type { TeamAssignment, TeamMember, TeamPayout } from '../types/team';
import type { AppSettings } from '../types/settings';

export interface AppData {
  version: 1;
  clients: Client[];
  documents: LingoDocument[];
  settings: AppSettings;
  team: TeamMember[];
  assignments: TeamAssignment[];
  payouts: TeamPayout[];
  retainers: Retainer[];
}

/**
 * Persistence boundary for the whole app.
 *
 * PROTOTYPE: `prototypeRepository` keeps data in this browser's localStorage — temporary, per-device,
 * and NOT a secure store for financial records.
 *
 * PRODUCTION: implement this interface with Supabase (schema in data/supabaseSchema.ts):
 *  - load/save map to the clients, documents, payments, document_history and app_settings tables
 *  - document numbers come from the `allocate_document_number` Postgres function (row-locked, duplicate-safe)
 *  - row level security restricts all access to authenticated administrators
 *  - only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are exposed to the frontend; never a service-role key
 */
export interface DataRepository {
  load(): AppData;
  save(data: AppData): void;
  reset(): AppData;
}

const STORAGE_KEY = 'lingo-billing:prototype-data:v1';
const RECOVERY_PREFIX = 'lingo-billing:editor-recovery:';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function createSeedData(): AppData {
  return {
    version: 1,
    clients: clone(seedClients),
    documents: clone(seedDocuments),
    settings: clone(defaultSettings),
    team: [],
    assignments: [],
    payouts: [],
    retainers: []
  };
}

function mergeSettings(stored: Partial<AppSettings> | undefined): AppSettings {
  const base = clone(defaultSettings);
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    divisions: { ...base.divisions, ...stored.divisions },
    templates: { ...base.templates, ...stored.templates },
    numbering: { ...base.numbering, ...stored.numbering }
  };
}

export const prototypeRepository: DataRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createSeedData();
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.version !== 1) return createSeedData();
      return {
        ...parsed,
        settings: mergeSettings(parsed.settings),
        // Older backups were saved before these sections existed.
        team: parsed.team ?? [],
        assignments: parsed.assignments ?? [],
        payouts: parsed.payouts ?? [],
        retainers: parsed.retainers ?? []
      };
    } catch {
      return createSeedData();
    }
  },
  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Prototype storage is full or unavailable', error);
    }
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return createSeedData();
  }
};

export interface RecoverySnapshot {
  savedAt: string;
  doc: LingoDocument;
}

export function saveRecovery(key: string, doc: LingoDocument) {
  try {
    const snapshot: RecoverySnapshot = { savedAt: new Date().toISOString(), doc };
    localStorage.setItem(RECOVERY_PREFIX + key, JSON.stringify(snapshot));
  } catch {

    /* recovery is best-effort */}
}

export function loadRecovery(key: string): RecoverySnapshot | null {
  try {
    const raw = localStorage.getItem(RECOVERY_PREFIX + key);
    return raw ? JSON.parse(raw) as RecoverySnapshot : null;
  } catch {
    return null;
  }
}

export function clearRecovery(key: string) {
  localStorage.removeItem(RECOVERY_PREFIX + key);
}