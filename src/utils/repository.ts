import { defaultSettings } from '../data/defaultSettings';
import { seedClients } from '../data/seedClients';
import { seedDocuments } from '../data/seedDocuments';
import type { Client } from '../types/client';
import type { LingoDocument } from '../types/document';
import { migrateLegacyDocument, stripLegacySettings } from './legacy';
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
 * Persistence boundary for the whole app. Two implementations:
 *  - supabaseRepository (utils/supabaseRepository.ts) — used when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.
 *  - prototypeRepository (below) — browser localStorage only; used when Supabase is not configured.
 *
 * `save` receives the last state known to be persisted and the new state, so a remote store only writes what changed.
 */
export interface DataRepository {
  mode: 'supabase' | 'prototype-local';
  load(): Promise<AppData>;
  save(prev: AppData, next: AppData): Promise<void>;
}

const STORAGE_KEY = 'lingo-billing:prototype-data:v1';
const RECOVERY_PREFIX = 'lingo-billing:editor-recovery:';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** A blank workspace: default settings, no sample records. Used for a fresh Supabase database. */
export function createEmptyData(): AppData {
  return { version: 1, clients: [], documents: [], settings: clone(defaultSettings), team: [], assignments: [], payouts: [], retainers: [] };
}

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

export function mergeSettings(stored: Partial<AppSettings> | undefined): AppSettings {
  const base = clone(defaultSettings);
  if (!stored) return base;
  return stripLegacySettings({
    ...base,
    ...stored,
    divisions: { ...base.divisions, ...stored.divisions },
    templates: { ...base.templates, ...stored.templates },
    numbering: { ...base.numbering, ...stored.numbering }
  });
}

function readStored(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== 1) return null;
    return {
      ...parsed,
      settings: mergeSettings(parsed.settings),
      documents: (parsed.documents ?? []).map(migrateLegacyDocument),
      // Older backups were saved before these sections existed.
      team: parsed.team ?? [],
      assignments: parsed.assignments ?? [],
      payouts: parsed.payouts ?? [],
      retainers: parsed.retainers ?? []
    };
  } catch {
    return null;
  }
}

/** Data this browser saved while running in prototype mode, or null if nothing was ever saved. Used for the one-time upload to Supabase. */
export const readLocalPrototypeData = readStored;

/** Synchronous load, so prototype mode renders on the first frame exactly like before. */
export const loadPrototypeSync = (): AppData => readStored() ?? createSeedData();

export const prototypeRepository: DataRepository = {
  mode: 'prototype-local',
  async load() {
    return loadPrototypeSync();
  },
  async save(_prev, next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Prototype storage is full or unavailable', error);
    }
  }
};

export function resetPrototypeData(): AppData {
  localStorage.removeItem(STORAGE_KEY);
  return createSeedData();
}

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