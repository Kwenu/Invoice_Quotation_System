import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BanknoteIcon, CalendarClockIcon, HandCoinsIcon, ReceiptIcon, UsersIcon, WalletIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useDueItems } from '../../hooks/useDueItems';
import { whenLabel } from '../../utils/dueItems';
import { formatDisplayDate, formatMoney, todayIso } from '../../utils/format';
import { computeIncome, monthlyTrend, resolvePeriod, type PeriodPreset } from '../../utils/income';
import { divisions } from '../../data/divisions';
import { SegmentedTabs } from '../ui/SegmentedTabs';

export function IncomeSummary() {
  const { documents, retainers, payouts, settings, team } = useData();
  const { items } = useDueItems();
  const currency = settings.currencySymbol;
  const [preset, setPreset] = useState<PeriodPreset>('this-month');
  const [month, setMonth] = useState(todayIso().slice(0, 7));

  const period = useMemo(() => resolvePeriod(preset, month), [preset, month]);
  const data = useMemo(() => ({ documents, retainers, payouts }), [documents, retainers, payouts]);
  const s = useMemo(() => computeIncome(data, period), [data, period]);
  const trend = useMemo(() => monthlyTrend(data, 6), [data]);
  const maxTrend = Math.max(1, ...trend.map((t) => t.income));
  const upcoming = items.filter((i) => i.daysAway <= 30).slice(0, 6);

  const toReceive = s.outstanding + s.maintenanceOverdue;
  const workerCount = team.filter((m) => m.status === 'active').length;
  const plannedCount = team.filter((m) => m.status === 'planned').length;

  const cards = [
  { label: 'Income received', value: s.income, icon: BanknoteIcon, accent: 'from-emerald-500 to-teal-500', tone: 'text-emerald-700', sub: `Invoices ${formatMoney(s.invoiceIncome, currency)} · Maintenance ${formatMoney(s.maintenanceIncome, currency)}` },
  { label: 'Billed in period', value: s.billed, icon: ReceiptIcon, accent: 'from-blue-600 to-indigo-500', tone: 'text-ink', sub: 'Invoices issued (excluding drafts)' },
  { label: 'Payments to receive', value: toReceive, icon: HandCoinsIcon, accent: 'from-amber-500 to-orange-500', tone: 'text-ink', sub: `${formatMoney(s.overdue + s.maintenanceOverdue, currency)} overdue · ${formatMoney(s.dueInPeriod, currency)} invoices due in period` },
  { label: 'Maintenance expected', value: s.maintenanceExpected, icon: CalendarClockIcon, accent: 'from-violet-600 to-fuchsia-500', tone: 'text-ink', sub: `Charges due in ${s.maintenanceExpectedLabel}` },
  { label: 'Paid to team', value: s.payoutsPaid, icon: WalletIcon, accent: 'from-rose-500 to-pink-500', tone: 'text-ink', sub: 'Payouts recorded in period' }];

  const companyStyle: Record<string, {bar: string;soft: string;text: string;}> = {
    startup: { bar: 'from-[#0546A9] via-[#5B5BCB] to-[#C76BE6]', soft: 'bg-indigo-50', text: 'text-indigo-700' },
    academy: { bar: 'from-teal-500 to-emerald-500', soft: 'bg-teal-50', text: 'text-teal-700' },
    auron: { bar: 'from-amber-500 to-rose-500', soft: 'bg-amber-50', text: 'text-amber-700' }
  };

  return (
    <section aria-labelledby="income-summary" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="income-summary" className="text-lg font-semibold text-ink">Income summary</h2>
          <p className="text-sm text-ink-muted">{period.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedTabs
            variant="pill"
            label="Summary period"
            value={preset}
            onChange={setPreset}
            items={[
            { id: 'this-month', label: 'This month' },
            { id: 'last-month', label: 'Last month' },
            { id: 'this-year', label: 'This year' },
            { id: 'all', label: 'All time' },
            { id: 'month', label: 'Pick month' }]
            } />
          
          {preset === 'month' &&
          <>
              <label htmlFor="summary-month" className="sr-only">Month</label>
              <input
              id="summary-month"
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            
            </>
          }
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Income by company</p>
        <div className="grid gap-4 md:grid-cols-3">
          {divisions.map((d) => {
            const v = s.byDivision[d.id];
            const st = companyStyle[d.id];
            return (
              <div key={d.id} className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-sm">
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${st.bar}`} aria-hidden />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{d.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.soft} ${st.text}`}>{d.shortName}</span>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-ink">{formatMoney(v.income, currency)}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {d.id === 'startup' ?
                  `Invoices ${formatMoney(v.income - s.maintenanceIncome, currency)} · Maintenance ${formatMoney(s.maintenanceIncome, currency)}` :
                  'Invoice payments received'}
                </p>
                <dl className="mt-3 flex justify-between border-t border-line pt-3 text-xs">
                  <div><dt className="text-ink-muted">Billed</dt><dd className="mt-0.5 font-medium tabular-nums text-ink">{formatMoney(v.billed, currency)}</dd></div>
                  <div className="text-right"><dt className="text-ink-muted">Outstanding</dt><dd className="mt-0.5 font-medium tabular-nums text-ink">{formatMoney(v.outstanding, currency)}</dd></div>
                </dl>
              </div>);
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) =>
        <div key={c.label} className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-ink-muted">{c.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${c.accent} text-white`}><c.icon className="h-4 w-4" aria-hidden /></span>
            </div>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${c.tone}`}>{formatMoney(c.value, currency)}</p>
            <p className="mt-1 text-xs text-ink-muted">{c.sub}</p>
          </div>
        )}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-ink-muted">Team members</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white"><UsersIcon className="h-4 w-4" aria-hidden /></span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{workerCount}</p>
          <p className="mt-1 text-xs text-ink-muted">Active {workerCount === 1 ? 'worker' : 'workers'}{plannedCount > 0 ? ` · ${plannedCount} planned` : ''}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-3">
          <p className="text-sm font-semibold text-ink">Income received — last 6 months</p>
          <div className="mt-5 flex h-40 items-end gap-3" role="img" aria-label="Income received per month, last six months">
            {trend.map((t) =>
            <div key={t.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] tabular-nums text-ink-muted">{t.income > 0 ? Math.round(t.income).toLocaleString('en-US') : ''}</span>
                <div className="w-full max-w-12 rounded-t-md bg-[#111111]" style={{ height: `${Math.max(t.income / maxTrend * 100, t.income > 0 ? 3 : 0)}%`, minHeight: t.income > 0 ? 4 : 0 }} />
                <span className="text-xs text-ink-muted">{t.label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-semibold text-ink">Coming up — next 30 days</p>
            <Link to="/maintenance" className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">Maintenance <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden /></Link>
          </div>
          {upcoming.length === 0 ?
          <p className="border-t border-line px-5 py-8 text-center text-sm text-ink-muted">Nothing due in the next 30 days.</p> :
          <ul className="divide-y divide-line border-t border-line">
              {upcoming.map((i) =>
            <li key={i.id}>
                  <Link to={i.to} className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-canvas/70">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${i.overdue ? 'bg-danger' : i.remind ? 'bg-warning' : 'bg-success'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{i.title}</p>
                      <p className={`text-xs ${i.overdue ? 'text-danger' : 'text-ink-muted'}`}>{whenLabel(i.daysAway)} · {formatDisplayDate(i.date)}</p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-ink">{formatMoney(i.amount, currency)}</span>
                  </Link>
                </li>
            )}
            </ul>
          }
        </div>
      </div>
    </section>);

}
