import type { Retainer, RetainerFrequency } from '../types/retainer';
import { toIsoDate, todayIso } from './format';

export const frequencyMonths: Record<RetainerFrequency, number> = { monthly: 1, quarterly: 3, yearly: 12 };
export const frequencyLabel: Record<RetainerFrequency, string> = { monthly: 'Monthly', quarterly: 'Every 3 months', yearly: 'Yearly' };
export const categoryOptions = ['Web development', 'POS system', 'CRM system', 'Hosting / domain', 'Other'];

/** Adds whole months, keeping the billing day (clamped to month end, e.g. 31 Jan → 28 Feb). */
export function addMonthsIso(iso: string, months: number, anchorDay?: number): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const day = anchorDay ?? d;
  const first = new Date(y, m - 1 + months, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return toIsoDate(new Date(first.getFullYear(), first.getMonth(), Math.min(day, last)));
}

export function nextDueAfter(r: Pick<Retainer, 'frequency' | 'startDate'>, due: string): string {
  const anchor = r.startDate ? Number(r.startDate.slice(8, 10)) : undefined;
  return addMonthsIso(due, frequencyMonths[r.frequency], anchor);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [a, b, c] = fromIso.split('-').map(Number);
  const [d, e, f] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(d, e - 1, f) - Date.UTC(a, b - 1, c)) / 86400000);
}

export type DueState = 'overdue' | 'due-soon' | 'upcoming' | 'paused' | 'ended';

export function dueState(r: Retainer, today: string = todayIso()): DueState {
  if (r.status === 'paused') return 'paused';
  if (r.status === 'ended') return 'ended';
  const days = daysBetween(today, r.nextDueDate);
  if (days < 0) return 'overdue';
  if (days <= r.remindDaysBefore) return 'due-soon';
  return 'upcoming';
}

export function dueLabel(r: Retainer, today: string = todayIso()): string {
  const days = daysBetween(today, r.nextDueDate);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} day${days === -1 ? '' : 's'} overdue`;
}

/** Monthly-equivalent value, used for "monthly recurring revenue". */
export function monthlyValue(r: Pick<Retainer, 'amount' | 'frequency'>): number {
  return r.amount / frequencyMonths[r.frequency];
}

/** Future due dates (from the current next-due date) that fall inside [from, to]. */
export function occurrencesInRange(r: Retainer, from: string | null, to: string | null): string[] {
  if (r.status !== 'active') return [];
  const out: string[] = [];
  let due = r.nextDueDate;
  for (let i = 0; i < 120 && due; i++) {
    if (to && due > to) break;
    if (!from || due >= from) out.push(due);
    due = nextDueAfter(r, due);
  }
  return out;
}
