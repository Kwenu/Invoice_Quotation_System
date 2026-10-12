import type { DocumentStatus, LingoDocument } from '../types/document';
import { calculateTotals, type DocumentTotals } from './calculations';
import { todayIso } from './format';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

export const statusMeta: Record<DocumentStatus, {label: string;tone: StatusTone;}> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'info' },
  'partially-paid': { label: 'Partially paid', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  accepted: { label: 'Accepted', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  expired: { label: 'Expired', tone: 'warning' },
  converted: { label: 'Converted', tone: 'brand' }
};

export interface DocumentSummary {
  doc: LingoDocument;
  totals: DocumentTotals;
  status: DocumentStatus;
}

/** Payment-driven status. A document is never "paid" because a PDF was generated — only by recorded payments. */
export function getEffectiveStatus(
doc: LingoDocument,
totals: DocumentTotals = calculateTotals(doc),
today: string = todayIso())
: DocumentStatus {
  if (doc.type === 'quotation') {
    if (doc.status === 'sent' && doc.validUntil && doc.validUntil < today) return 'expired';
    return doc.status as DocumentStatus;
  }
  if (doc.status === 'draft' || doc.status === 'cancelled') return doc.status;
  if (totals.total > 0 && totals.balance <= 0) return 'paid';
  if (doc.dueDate && doc.dueDate < today) return 'overdue';
  if (totals.paid > 0) return 'partially-paid';
  return 'sent';
}

export function getDocumentSummary(doc: LingoDocument): DocumentSummary {
  const totals = calculateTotals(doc);
  return { doc, totals, status: getEffectiveStatus(doc, totals) };
}

export function getEditLock(doc: LingoDocument): string | null {
  if (doc.archived) return 'Archived documents are read-only. Restore it to make changes.';
  if (doc.status === 'cancelled') return 'Cancelled documents cannot be edited. Reinstate it first, or delete it and create a new one.';
  if (doc.status === 'converted') return 'This quotation has already been converted to an invoice.';
  if (doc.status === 'accepted' || doc.status === 'rejected')
  return `This quotation was ${doc.status}. Duplicate it to prepare a revised version.`;
  return null;
}

export function isOutstanding(status: DocumentStatus): boolean {
  return status === 'sent' || status === 'partially-paid' || status === 'overdue';
}