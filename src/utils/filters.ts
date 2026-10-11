import type { DivisionId, DocumentStatus, DocumentType, LingoDocument } from '../types/document';
import { isOutstanding, type DocumentSummary } from './status';

export type DocumentTab = 'all' | 'invoices' | 'quotations' | 'drafts' | 'sent' | 'paid' | 'outstanding' | 'archived';

export interface DocumentFilters {
  query: string;
  division: DivisionId | 'all';
  type: DocumentType | 'all';
  status: DocumentStatus | 'all';
  clientId: string;
  from: string;
  to: string;
}

export const emptyFilters: DocumentFilters = {
  query: '',
  division: 'all',
  type: 'all',
  status: 'all',
  clientId: 'all',
  from: '',
  to: ''
};

export function matchesTab(summary: DocumentSummary, tab: DocumentTab): boolean {
  const { doc, status } = summary;
  if (tab === 'archived') return doc.archived;
  if (doc.archived) return false;
  switch (tab) {
    case 'invoices':
      return doc.type === 'invoice';
    case 'quotations':
      return doc.type === 'quotation';
    case 'drafts':
      return doc.status === 'draft';
    case 'sent':
      return doc.status === 'sent';
    case 'paid':
      return status === 'paid';
    case 'outstanding':
      return doc.type === 'invoice' && isOutstanding(status);
    default:
      return true;
  }
}

function searchableText(doc: LingoDocument): string {
  return [
  doc.number,
  doc.client.name,
  doc.client.company,
  doc.projectName,
  doc.projectDescription,
  ...doc.groups.flatMap((g) => [g.title, ...g.items.map((i) => i.description)])].

  join(' ').
  toLowerCase();
}

export function applyFilters(items: DocumentSummary[], filters: DocumentFilters): DocumentSummary[] {
  const query = filters.query.trim().toLowerCase();
  return items.filter(({ doc, status }) => {
    if (filters.division !== 'all' && doc.division !== filters.division) return false;
    if (filters.type !== 'all' && doc.type !== filters.type) return false;
    if (filters.status !== 'all' && status !== filters.status) return false;
    if (filters.clientId !== 'all' && doc.client.clientId !== filters.clientId) return false;
    if (filters.from && doc.issueDate < filters.from) return false;
    if (filters.to && doc.issueDate > filters.to) return false;
    if (query && !searchableText(doc).includes(query)) return false;
    return true;
  });
}

export function activeFilterCount(filters: DocumentFilters): number {
  return (['division', 'type', 'status', 'clientId'] as const).filter((k) => filters[k] !== 'all').length + (
  filters.from ? 1 : 0) + (
  filters.to ? 1 : 0);
}