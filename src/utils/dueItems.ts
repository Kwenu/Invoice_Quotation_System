import type { LingoDocument } from '../types/document';
import type { Retainer } from '../types/retainer';
import { daysBetween } from './retainers';
import { todayIso } from './format';
import { getDocumentSummary, isOutstanding } from './status';

export interface DueItem {
  id: string;
  kind: 'retainer' | 'invoice';
  date: string;
  daysAway: number;
  title: string;
  detail: string;
  amount: number;
  overdue: boolean;
  /** Worth a notification right now (overdue, or inside its reminder window). */
  remind: boolean;
  to: string;
}

const INVOICE_REMIND_DAYS = 3;

export function buildDueItems(documents: LingoDocument[], retainers: Retainer[], today: string = todayIso()): DueItem[] {
  const items: DueItem[] = [];

  for (const r of retainers) {
    if (r.status !== 'active') continue;
    const days = daysBetween(today, r.nextDueDate);
    items.push({
      id: `ret:${r.id}:${r.nextDueDate}`,
      kind: 'retainer',
      date: r.nextDueDate,
      daysAway: days,
      title: `${r.title} — ${r.clientName}`,
      detail: 'Maintenance charge',
      amount: r.amount,
      overdue: days < 0,
      remind: days <= r.remindDaysBefore,
      to: '/maintenance'
    });
  }

  for (const doc of documents) {
    if (doc.type !== 'invoice' || doc.archived || !doc.dueDate) continue;
    const s = getDocumentSummary(doc);
    if (!isOutstanding(s.status)) continue;
    const days = daysBetween(today, doc.dueDate);
    items.push({
      id: `inv:${doc.id}:${doc.dueDate}`,
      kind: 'invoice',
      date: doc.dueDate,
      daysAway: days,
      title: `Invoice ${doc.number} — ${doc.client.name || 'No client'}`,
      detail: 'Invoice payment',
      amount: s.totals.balance,
      overdue: days < 0,
      remind: days <= INVOICE_REMIND_DAYS,
      to: `/documents/${doc.id}`
    });
  }

  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export const whenLabel = (daysAway: number) =>
daysAway === 0 ? 'Due today' :
daysAway === 1 ? 'Due tomorrow' :
daysAway > 1 ? `In ${daysAway} days` :
`${Math.abs(daysAway)} day${daysAway === -1 ? '' : 's'} overdue`;
