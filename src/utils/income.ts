import type { DivisionId, LingoDocument } from '../types/document';
import type { Retainer } from '../types/retainer';
import type { TeamPayout } from '../types/team';
import { getDocumentSummary, isOutstanding } from './status';
import { occurrencesInRange } from './retainers';
import { toIsoDate, todayIso } from './format';

export interface Period {
  from: string | null;
  to: string | null;
  label: string;
}
export type PeriodPreset = 'this-month' | 'last-month' | 'this-year' | 'month' | 'all';

const monthName = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export function monthRange(year: number, monthIndex: number): Period {
  return {
    from: toIsoDate(new Date(year, monthIndex, 1)),
    to: toIsoDate(new Date(year, monthIndex + 1, 0)),
    label: monthName(year, monthIndex)
  };
}

export function resolvePeriod(preset: PeriodPreset, month: string, today: string = todayIso()): Period {
  const [y, m] = today.split('-').map(Number);
  if (preset === 'this-month') return monthRange(y, m - 1);
  if (preset === 'last-month') return monthRange(m === 1 ? y - 1 : y, m === 1 ? 11 : m - 2);
  if (preset === 'this-year') return { from: `${y}-01-01`, to: `${y}-12-31`, label: String(y) };
  if (preset === 'month' && /^\d{4}-\d{2}$/.test(month)) {
    const [py, pm] = month.split('-').map(Number);
    return monthRange(py, pm - 1);
  }
  return { from: null, to: null, label: 'All time' };
}

export const inPeriod = (date: string, p: Period) => Boolean(date) && (!p.from || date >= p.from) && (!p.to || date <= p.to);

export interface IncomeData {
  documents: LingoDocument[];
  retainers: Retainer[];
  payouts: TeamPayout[];
}

export function computeIncome({ documents, retainers, payouts }: IncomeData, period: Period, today: string = todayIso()) {
  const summaries = documents.
  filter((d) => d.type === 'invoice' && d.status !== 'draft' && d.status !== 'cancelled').
  map(getDocumentSummary);

  const byDivision: Record<DivisionId, {income: number;billed: number;outstanding: number;}> = {
    startup: { income: 0, billed: 0, outstanding: 0 },
    academy: { income: 0, billed: 0, outstanding: 0 },
    auron: { income: 0, billed: 0, outstanding: 0 }
  };
  let invoiceIncome = 0;
  let billed = 0;
  let dueInPeriod = 0;
  let outstanding = 0;
  let overdue = 0;
  for (const s of summaries) {
    const div = byDivision[s.doc.division];
    for (const p of s.doc.payments) if (inPeriod(p.date, period)) {invoiceIncome += p.amount;if (div) div.income += p.amount;}
    if (inPeriod(s.doc.issueDate, period)) {billed += s.totals.total;if (div) div.billed += s.totals.total;}
    if (!s.doc.archived && isOutstanding(s.status)) {
      outstanding += s.totals.balance;
      if (div) div.outstanding += s.totals.balance;
      if (s.status === 'overdue') overdue += s.totals.balance;
      if (inPeriod(s.doc.dueDate, period)) dueInPeriod += s.totals.balance;
    }
  }

  let maintenanceIncome = 0;
  for (const r of retainers) for (const c of r.collections) if (inPeriod(c.receivedDate, period)) maintenanceIncome += c.amount;

  // Maintenance only belongs to Lingo Startup Company.
  byDivision.startup.income += maintenanceIncome;

  // "Maintenance expected" covers just ONE month: the selected month, or the current month for year / all-time views.
  const sameMonth = Boolean(period.from && period.to && period.from.slice(0, 7) === period.to.slice(0, 7));
  const expectedMonth = sameMonth ? period : monthRange(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1);
  let maintenanceExpected = 0;
  let maintenanceOverdue = 0;
  for (const r of retainers) {
    if (r.status !== 'active') continue;
    maintenanceExpected += occurrencesInRange(r, expectedMonth.from, expectedMonth.to).length * r.amount;
    if (r.nextDueDate < today) maintenanceOverdue += r.amount;
  }

  const payoutsPaid = payouts.filter((p) => inPeriod(p.date, period)).reduce((s, p) => s + p.amount, 0);
  const income = invoiceIncome + maintenanceIncome;
  return {
    income,
    invoiceIncome,
    maintenanceIncome,
    billed,
    outstanding,
    overdue,
    dueInPeriod,
    maintenanceExpected,
    maintenanceExpectedLabel: expectedMonth.label,
    maintenanceOverdue,
    byDivision,
    payoutsPaid,
    net: income - payoutsPaid
  };
}

/** Income received per month for the last `count` months (oldest first). */
export function monthlyTrend(data: IncomeData, count = 6, today: string = todayIso()) {
  const [y, m] = today.split('-').map(Number);
  const out: {key: string;label: string;income: number;}[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const p = monthRange(d.getFullYear(), d.getMonth());
    out.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      income: computeIncome(data, p, today).income
    });
  }
  return out;
}

/** Company income used for "share of company income": billed invoices plus collected maintenance. */
export function companyIncomeTotal({ documents, retainers }: Pick<IncomeData, 'documents' | 'retainers'>): number {
  const billed = documents.
  filter((d) => d.type === 'invoice' && d.status !== 'draft' && d.status !== 'cancelled').
  reduce((s, d) => s + getDocumentSummary(d).totals.total, 0);
  const maintenance = retainers.reduce((s, r) => s + r.collections.reduce((x, c) => x + c.amount, 0), 0);
  return billed + maintenance;
}
