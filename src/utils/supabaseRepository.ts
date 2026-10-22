import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Client } from '../types/client';
import type { Adjustments, ClientSnapshot, DisplayOptions, HistoryEntry, LineGroup, LingoDocument, Payment, PaymentDetails, Representative } from '../types/document';
import type { Retainer, RetainerCollection } from '../types/retainer';
import type { AppSettings } from '../types/settings';
import type { TeamAssignment, TeamMember, TeamPayout } from '../types/team';
import { calculateTotals } from './calculations';
import { migrateLegacyDocument } from './legacy';
import { createEmptyData, mergeSettings, type AppData, type DataRepository } from './repository';

/* ───────────────────────── helpers ───────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const PAGE = 1000;
const CHUNK = 200;

/** '' → null for optional date columns. */
const nz = (value: string | null | undefined) => value ? value : null;
const str = (value: unknown) => value == null ? '' : String(value);
const num = (value: unknown) => Number(value ?? 0);
/** Normalises timestamptz values so sorting by string stays consistent. */
const ts = (value: unknown) => value ? new Date(String(value)).toISOString() : new Date().toISOString();

function fail(table: string, error: PostgrestError): never {
  throw new Error(`${table}: ${error.message}`);
}

async function fetchAll(table: string, orderBy: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0;; from += PAGE) {
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true }).range(from, from + PAGE - 1);
    if (error) fail(table, error);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

async function upsert(table: string, rows: Row[], onConflict = 'id', ignoreDuplicates = false) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + CHUNK), { onConflict, ignoreDuplicates });
    if (error) fail(table, error);
  }
}

async function remove(table: string, ids: string[]) {
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { error } = await supabase.from(table).delete().in('id', ids.slice(i, i + CHUNK));
    if (error) fail(table, error);
  }
}

function diff<T extends {id: string;}>(prev: T[], next: T[]) {
  const before = new Map(prev.map((item) => [item.id, JSON.stringify(item)]));
  const nextIds = new Set(next.map((item) => item.id));
  return {
    changed: next.filter((item) => before.get(item.id) !== JSON.stringify(item)),
    removedIds: prev.filter((item) => !nextIds.has(item.id)).map((item) => item.id)
  };
}

/* ───────────────────────── row mappers ───────────────────────── */

const clientToRow = (c: Client): Row => ({
  id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone, address: c.address, notes: c.notes,
  created_at: c.createdAt, updated_at: c.updatedAt
});
const clientFromRow = (r: Row): Client => ({
  id: r.id, name: str(r.name), company: str(r.company), email: str(r.email), phone: str(r.phone), address: str(r.address), notes: str(r.notes),
  createdAt: ts(r.created_at), updatedAt: ts(r.updated_at)
});

function documentToRow(d: LingoDocument, clientIds: Set<string>): Row {
  const totals = calculateTotals(d);
  const clientId = d.client.clientId && clientIds.has(d.client.clientId) ? d.client.clientId : null;
  return {
    id: d.id, type: d.type, division: d.division, template_id: d.templateId, number: d.number, status: d.status,
    issue_date: nz(d.issueDate), due_date: nz(d.dueDate), valid_until: nz(d.validUntil),
    client_id: clientId, client_name: d.client.name, client: d.client,
    project_name: d.projectName, project_description: d.projectDescription,
    groups: d.groups, adjustments: d.adjustments, payment_details: d.paymentDetails, payment_instructions: d.paymentInstructions,
    notes: d.notes, terms: d.terms, representative: d.representative, company_line: d.companyLine, display: d.display,
    source_quotation_id: d.sourceQuotationId ?? null, converted_invoice_id: d.convertedInvoiceId ?? null, archived: d.archived,
    // Readable totals for reports in the Supabase table editor (the app recalculates them from the line items).
    total_amount: totals.total, paid_amount: totals.paid, balance_amount: totals.balance,
    created_at: d.createdAt, updated_at: d.updatedAt
  };
}

function documentFromRow(r: Row, payments: Payment[], history: HistoryEntry[]): LingoDocument {
  return migrateLegacyDocument({
    id: r.id, type: r.type, division: r.division, templateId: r.template_id, number: str(r.number), status: r.status,
    issueDate: str(r.issue_date), dueDate: str(r.due_date), validUntil: str(r.valid_until),
    client: r.client as ClientSnapshot,
    projectName: str(r.project_name), projectDescription: str(r.project_description),
    groups: r.groups as LineGroup[], adjustments: r.adjustments as Adjustments, payments,
    paymentDetails: r.payment_details as PaymentDetails, paymentInstructions: str(r.payment_instructions),
    notes: str(r.notes), terms: str(r.terms), representative: r.representative as Representative, companyLine: str(r.company_line),
    display: r.display as DisplayOptions,
    sourceQuotationId: r.source_quotation_id ?? undefined, convertedInvoiceId: r.converted_invoice_id ?? undefined,
    archived: Boolean(r.archived), createdAt: ts(r.created_at), updatedAt: ts(r.updated_at), history
  });
}

const paymentToRow = (docId: string, p: Payment): Row => ({
  id: p.id, document_id: docId, payment_date: p.date, amount: p.amount, method: p.method, reference: p.reference, note: p.note,
  show_on_document: p.showOnDocument, recorded_at: p.recordedAt
});
const paymentFromRow = (r: Row): Payment => ({
  id: r.id, date: str(r.payment_date), amount: num(r.amount), method: str(r.method), reference: str(r.reference), note: str(r.note),
  showOnDocument: Boolean(r.show_on_document), recordedAt: ts(r.recorded_at)
});

const historyToRow = (docId: string, h: HistoryEntry): Row => ({ id: h.id, document_id: docId, occurred_at: h.at, action: h.action, detail: h.detail });
const historyFromRow = (r: Row): HistoryEntry => ({ id: r.id, at: ts(r.occurred_at), action: str(r.action), detail: str(r.detail) });

const memberToRow = (m: TeamMember): Row => ({
  id: m.id, name: m.name, role: m.role, email: m.email, phone: m.phone, status: m.status, start_date: nz(m.startDate), notes: m.notes,
  created_at: m.createdAt, updated_at: m.updatedAt
});
const memberFromRow = (r: Row): TeamMember => ({
  id: r.id, name: str(r.name), role: str(r.role), email: str(r.email), phone: str(r.phone), status: r.status, startDate: str(r.start_date), notes: str(r.notes),
  createdAt: ts(r.created_at), updatedAt: ts(r.updated_at)
});

const assignmentToRow = (a: TeamAssignment, docIds: Set<string>): Row => ({
  id: a.id, member_id: a.memberId, document_id: a.documentId && docIds.has(a.documentId) ? a.documentId : null,
  label: a.label, base_amount: a.baseAmount, mode: a.mode, value: a.value, note: a.note, created_at: a.createdAt
});
const assignmentFromRow = (r: Row): TeamAssignment => ({
  id: r.id, memberId: r.member_id, documentId: r.document_id ?? null, label: str(r.label), baseAmount: num(r.base_amount),
  mode: r.mode, value: num(r.value), note: str(r.note), createdAt: ts(r.created_at)
});

const payoutToRow = (p: TeamPayout): Row => ({
  id: p.id, member_id: p.memberId, paid_on: p.date, amount: p.amount, method: p.method, note: p.note, recorded_at: p.recordedAt
});
const payoutFromRow = (r: Row): TeamPayout => ({
  id: r.id, memberId: r.member_id, date: str(r.paid_on), amount: num(r.amount), method: str(r.method), note: str(r.note), recordedAt: ts(r.recorded_at)
});

const retainerToRow = (r: Retainer, clientIds: Set<string>): Row => ({
  id: r.id, client_id: r.clientId && clientIds.has(r.clientId) ? r.clientId : null, client_name: r.clientName, title: r.title, category: r.category,
  amount: r.amount, frequency: r.frequency, start_date: nz(r.startDate), next_due_date: r.nextDueDate, remind_days_before: r.remindDaysBefore,
  status: r.status, notes: r.notes, created_at: r.createdAt, updated_at: r.updatedAt
});
const retainerFromRow = (r: Row, collections: RetainerCollection[]): Retainer => ({
  id: r.id, clientId: r.client_id ?? null, clientName: str(r.client_name), title: str(r.title), category: str(r.category),
  amount: num(r.amount), frequency: r.frequency, startDate: str(r.start_date), nextDueDate: str(r.next_due_date),
  remindDaysBefore: num(r.remind_days_before), status: r.status, notes: str(r.notes), collections,
  createdAt: ts(r.created_at), updatedAt: ts(r.updated_at)
});

const collectionToRow = (retainerId: string, c: RetainerCollection): Row => ({
  id: c.id, retainer_id: retainerId, due_date: c.dueDate, amount: c.amount, received_on: c.receivedDate, method: c.method, note: c.note, recorded_at: c.recordedAt
});
const collectionFromRow = (r: Row): RetainerCollection => ({
  id: r.id, dueDate: str(r.due_date), amount: num(r.amount), receivedDate: str(r.received_on), method: str(r.method), note: str(r.note), recordedAt: ts(r.recorded_at)
});

/* ───────────────────────── load ───────────────────────── */

export async function loadFromSupabase(): Promise<AppData> {
  const [settingsRes, clients, documents, payments, history, members, assignments, payouts, retainers, collections] = await Promise.all([
  supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
  fetchAll('clients', 'created_at'),
  fetchAll('documents', 'created_at'),
  fetchAll('payments', 'recorded_at'),
  fetchAll('document_history', 'occurred_at'),
  fetchAll('team_members', 'created_at'),
  fetchAll('team_assignments', 'created_at'),
  fetchAll('team_payouts', 'recorded_at'),
  fetchAll('retainers', 'created_at'),
  fetchAll('retainer_collections', 'recorded_at')]
  );
  if (settingsRes.error) fail('app_settings', settingsRes.error);

  const group = <T,>(rows: Row[], key: string, map: (r: Row) => T) => {
    const out = new Map<string, T[]>();
    for (const r of rows) {
      const list = out.get(r[key]) ?? [];
      list.push(map(r));
      out.set(r[key], list);
    }
    return out;
  };
  const paymentsByDoc = group(payments, 'document_id', paymentFromRow);
  const historyByDoc = group(history, 'document_id', historyFromRow);
  const collectionsByRetainer = group(collections, 'retainer_id', collectionFromRow);

  // Newest first, like the in-app lists expect.
  const newestFirst = <T extends {createdAt: string;},>(items: T[]) => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    version: 1,
    settings: mergeSettings(settingsRes.data?.data as Partial<AppSettings> | undefined),
    clients: newestFirst(clients.map(clientFromRow)),
    documents: newestFirst(documents.map((r) => documentFromRow(r, paymentsByDoc.get(r.id) ?? [], historyByDoc.get(r.id) ?? []))),
    team: newestFirst(members.map(memberFromRow)),
    assignments: newestFirst(assignments.map(assignmentFromRow)),
    payouts: [...payouts.map(payoutFromRow)].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    retainers: newestFirst(retainers.map((r) => retainerFromRow(r, (collectionsByRetainer.get(r.id) ?? []).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)))))
  };
}

export async function hasStoredSettings(): Promise<boolean> {
  const { data, error } = await supabase.from('app_settings').select('id').eq('id', 1).maybeSingle();
  if (error) fail('app_settings', error);
  return Boolean(data);
}

/* ───────────────────────── save (diff-based) ───────────────────────── */

/**
 * Writes only what changed between `prev` (last state known to be in the database) and `next`.
 * Every write is an idempotent upsert/delete, so a retry after a failure is always safe.
 */
export async function saveToSupabase(prev: AppData, next: AppData): Promise<void> {
  const clientIds = new Set(next.clients.map((c) => c.id));
  const docIds = new Set(next.documents.map((d) => d.id));

  // 1 · settings (one row)
  if (JSON.stringify(prev.settings) !== JSON.stringify(next.settings)) {
    await upsert('app_settings', [{ id: 1, data: next.settings, updated_at: new Date().toISOString() }]);
  }

  // 2 · clients
  const clients = diff(prev.clients, next.clients);
  await upsert('clients', clients.changed.map(clientToRow));

  // 3 · documents, then their payments and history
  const docs = diff(prev.documents, next.documents);
  await upsert('documents', docs.changed.map((d) => documentToRow(d, clientIds)));
  const prevDocs = new Map(prev.documents.map((d) => [d.id, d]));
  const payRows: Row[] = [];
  const histRows: Row[] = [];
  const removedPayments: string[] = [];
  for (const d of docs.changed) {
    const before = prevDocs.get(d.id);
    const p = diff(before?.payments ?? [], d.payments);
    payRows.push(...p.changed.map((x) => paymentToRow(d.id, x)));
    removedPayments.push(...p.removedIds);
    const knownHistory = new Set((before?.history ?? []).map((h) => h.id));
    histRows.push(...d.history.filter((h) => !knownHistory.has(h.id)).map((h) => historyToRow(d.id, h)));
  }
  await upsert('payments', payRows);
  await remove('payments', removedPayments);
  // History is append-only: duplicates are ignored, never updated.
  await upsert('document_history', histRows, 'id', true);

  // 4 · team
  const members = diff(prev.team, next.team);
  await upsert('team_members', members.changed.map(memberToRow));
  const assignments = diff(prev.assignments, next.assignments);
  await upsert('team_assignments', assignments.changed.map((a) => assignmentToRow(a, docIds)));
  const payouts = diff(prev.payouts, next.payouts);
  await upsert('team_payouts', payouts.changed.map(payoutToRow));
  await remove('team_assignments', assignments.removedIds);
  await remove('team_payouts', payouts.removedIds);
  await remove('team_members', members.removedIds);

  // 5 · maintenance plans and their collections
  const retainers = diff(prev.retainers, next.retainers);
  await upsert('retainers', retainers.changed.map((r) => retainerToRow(r, clientIds)));
  const prevRetainers = new Map(prev.retainers.map((r) => [r.id, r]));
  const colRows: Row[] = [];
  const removedCols: string[] = [];
  for (const r of retainers.changed) {
    const c = diff(prevRetainers.get(r.id)?.collections ?? [], r.collections);
    colRows.push(...c.changed.map((x) => collectionToRow(r.id, x)));
    removedCols.push(...c.removedIds);
  }
  await upsert('retainer_collections', colRows);
  await remove('retainer_collections', removedCols);
  await remove('retainers', retainers.removedIds);

  // 6 · deleted documents (their payments and history are removed by the database; linked rows were already updated above)
  await remove('documents', docs.removedIds);

  // 7 · removed clients last (documents keep their own snapshot of the client)
  await remove('clients', clients.removedIds);
}

/** Same shape as an empty database — the starting point when importing local data. */
export const emptyRemoteState = (settings: AppSettings): AppData => ({ ...createEmptyData(), settings });

export const supabaseRepository: DataRepository = {
  mode: 'supabase',
  load: loadFromSupabase,
  save: saveToSupabase
};
