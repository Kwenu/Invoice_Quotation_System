import type { LingoDocument } from '../types/document';
import type { TeamAssignment, TeamPayout } from '../types/team';
import { calculateTotals, round2 } from './calculations';

/** Agreed amount for one assignment. Percentages use the invoice total (or the manual project value). */
export function assignmentAmount(a: TeamAssignment, documents: LingoDocument[]): number {
  if (a.mode === 'fixed') return round2(a.value);
  const doc = a.documentId ? documents.find((d) => d.id === a.documentId) : undefined;
  const base = doc ? calculateTotals(doc).total : a.baseAmount;
  return round2(base * a.value / 100);
}

/**
 * Part of the agreed amount that can be released now. For invoice-linked work this follows the share of the
 * invoice the client has actually paid, so members are never paid ahead of the money arriving.
 */
export function assignmentReleasable(a: TeamAssignment, documents: LingoDocument[]): number {
  const amount = assignmentAmount(a, documents);
  const doc = a.documentId ? documents.find((d) => d.id === a.documentId) : undefined;
  if (!doc) return amount;
  const t = calculateTotals(doc);
  const ratio = t.total > 0 ? Math.min(1, t.paid / t.total) : 0;
  return round2(amount * ratio);
}

export interface MemberStats {
  assigned: number;
  releasable: number;
  paidOut: number;
  /** Agreed amount not yet paid out. */
  balance: number;
  /** Releasable amount not yet paid out (can be negative if paid in advance). */
  payableNow: number;
  projects: number;
}

export function memberStats(memberId: string, assignments: TeamAssignment[], payouts: TeamPayout[], documents: LingoDocument[]): MemberStats {
  const mine = assignments.filter((a) => a.memberId === memberId);
  const assigned = round2(mine.reduce((s, a) => s + assignmentAmount(a, documents), 0));
  const releasable = round2(mine.reduce((s, a) => s + assignmentReleasable(a, documents), 0));
  const paidOut = round2(payouts.filter((p) => p.memberId === memberId).reduce((s, p) => s + p.amount, 0));
  return { assigned, releasable, paidOut, balance: round2(assigned - paidOut), payableNow: round2(releasable - paidOut), projects: mine.length };
}
