import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { formatMoney } from '../../utils/format';

interface Segment {
  label: string;
  count: number;
  color: string;
}

interface OutstandingPanelProps {
  outstanding: number;
  overdueAmount: number;
  awaitingCount: number;
  segments: Segment[];
  currency: string;
}

export function OutstandingPanel({ outstanding, overdueAmount, awaitingCount, segments, currency }: OutstandingPanelProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  return (
    <section aria-labelledby="outstanding-heading" className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="outstanding-heading" className="text-sm font-medium text-ink-muted">Total outstanding balance</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-ink">{formatMoney(outstanding, currency)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {awaitingCount} {awaitingCount === 1 ? 'invoice' : 'invoices'} awaiting payment
            {overdueAmount > 0 &&
            <>
                {' · '}
                <span className="font-medium text-danger">{formatMoney(overdueAmount, currency)} overdue</span>
              </>
            }
          </p>
        </div>
        <Link
          to="/documents?tab=outstanding"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-ink">
          
          View outstanding <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-canvas" role="img" aria-label="Invoice status breakdown">
          {total > 0 &&
          segments.filter((s) => s.count > 0).map((s) => <div key={s.label} style={{ width: `${s.count / total * 100}%`, backgroundColor: s.color }} />)}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {segments.map((s) =>
          <div key={s.label}>
              <dt className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                {s.label}
              </dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{s.count}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>);

}