import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, FilePlus2Icon, FileSignatureIcon, FileTextIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { IncomeSummary } from '../components/dashboard/IncomeSummary';
import { DashboardFilterBar } from '../components/dashboard/DashboardFilterBar';
import { OutstandingPanel } from '../components/dashboard/OutstandingPanel';
import { DocumentTable } from '../components/documents/DocumentTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { applyFilters, emptyFilters, type DocumentFilters } from '../utils/filters';
import { formatDisplayDate, formatMoney, initials } from '../utils/format';
import { getDocumentSummary, isOutstanding } from '../utils/status';

export function Dashboard() {
  const { documents, clients, settings } = useData();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DocumentFilters>(emptyFilters);
  const [clientModal, setClientModal] = useState(false);
  const currency = settings.currencySymbol;

  const filtered = useMemo(
    () => applyFilters(documents.filter((d) => !d.archived).map(getDocumentSummary), filters),
    [documents, filters]
  );

  const stats = useMemo(() => {
    const invoices = filtered.filter((s) => s.doc.type === 'invoice');
    const quotations = filtered.filter((s) => s.doc.type === 'quotation');
    const count = (status: string) => invoices.filter((s) => s.status === status).length;
    const outstandingList = invoices.filter((s) => isOutstanding(s.status));
    return {
      invoices: invoices.length,
      quotations: quotations.length,
      openQuotes: quotations.filter((s) => s.status === 'sent').length,
      acceptedQuotes: quotations.filter((s) => s.status === 'accepted').length,
      drafts: filtered.filter((s) => s.status === 'draft').length,
      paid: count('paid'),
      unpaid: count('sent'),
      partial: count('partially-paid'),
      overdue: count('overdue'),
      outstanding: outstandingList.reduce((sum, s) => sum + s.totals.balance, 0),
      overdueAmount: invoices.filter((s) => s.status === 'overdue').reduce((sum, s) => sum + s.totals.balance, 0),
      awaiting: outstandingList.length,
      received: invoices.reduce((sum, s) => sum + s.totals.paid, 0)
    };
  }, [filtered]);

  const recentDocuments = [...filtered].sort((a, b) => b.doc.updatedAt.localeCompare(a.doc.updatedAt)).slice(0, 6).map((s) => s.doc);
  const recentClients = [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(emptyFilters);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="h-1 w-full rounded-full bg-lingo" aria-hidden />
      <PageHeader
        title="Dashboard"
        description="Income, payments to receive, maintenance and documents across Lingo."
        actions={
        <>
            <Button variant="secondary" icon={UserPlusIcon} onClick={() => setClientModal(true)}>Add client</Button>
            <Button variant="secondary" icon={FileSignatureIcon} onClick={() => navigate('/documents/new/startup/quotation')}>New quotation</Button>
            <Button icon={FilePlus2Icon} onClick={() => navigate('/documents/new?type=invoice')}>New invoice</Button>
          </>
        } />
      

      <IncomeSummary />

      <div className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold text-ink">Documents</h2>
        <p className="mb-4 text-sm text-ink-muted">Filter invoices and quotations by division, type, status or date.</p>
        <DashboardFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} showReset={filtersActive} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OutstandingPanel
            outstanding={stats.outstanding}
            overdueAmount={stats.overdueAmount}
            awaitingCount={stats.awaiting}
            currency={currency}
            segments={[
            { label: 'Paid', count: stats.paid, color: '#0F7A4D' },
            { label: 'Partially paid', count: stats.partial, color: '#D99A2B' },
            { label: 'Unpaid', count: stats.unpaid, color: '#6556D9' },
            { label: 'Overdue', count: stats.overdue, color: '#B42318' }]
            } />
          
        </div>
        <section aria-label="Document totals" className="flex flex-col rounded-2xl bg-gradient-to-br from-[#0B1030] via-[#1B2A6B] to-[#5B5BCB] p-6 text-white shadow-md">
          <div className="grid flex-1 grid-cols-2 gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-white/70"><FileTextIcon className="h-3.5 w-3.5" aria-hidden /> Invoices</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{stats.invoices}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-white/70"><FileSignatureIcon className="h-3.5 w-3.5" aria-hidden /> Quotations</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{stats.quotations}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-2 border-t border-white/15 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-white/70">Payments received</dt><dd className="tabular-nums">{formatMoney(stats.received, currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/70">Quotations awaiting reply</dt><dd className="tabular-nums">{stats.openQuotes}</dd></div>
            <div className="flex justify-between"><dt className="text-white/70">Accepted, ready to invoice</dt><dd className="tabular-nums">{stats.acceptedQuotes}</dd></div>
            <div className="flex justify-between"><dt className="text-white/70">Drafts</dt><dd className="tabular-nums">{stats.drafts}</dd></div>
          </dl>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="recent-docs" className="rounded-2xl border border-line bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 id="recent-docs" className="text-sm font-semibold text-ink">Recent documents</h2>
            <Link to="/documents" className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
              All documents <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="border-t border-line">
            <DocumentTable
              documents={recentDocuments}
              emptyState={
              <EmptyState
                icon={FileTextIcon}
                title={filtersActive ? 'No documents match these filters' : 'No documents yet'}
                description={filtersActive ? 'Try widening the date range or clearing filters.' : 'Create your first invoice or quotation to see it here.'}
                action={!filtersActive && <Button icon={FilePlus2Icon} onClick={() => navigate('/documents/new')}>New document</Button>} />

              } />
            
          </div>
        </section>

        <section aria-labelledby="recent-clients" className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 id="recent-clients" className="text-sm font-semibold text-ink">Recently added clients</h2>
            <Link to="/clients" className="text-sm font-medium text-ink-soft hover:text-ink">View all</Link>
          </div>
          {recentClients.length === 0 ?
          <div className="border-t border-line">
              <EmptyState icon={UsersIcon} title="No clients yet" description="Add clients once and reuse them on every document." />
            </div> :

          <ul className="divide-y divide-line border-t border-line">
              {recentClients.map((c) =>
            <li key={c.id}>
                  <Link to={`/clients/${c.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-canvas/70">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink-soft">{initials(c.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                      <p className="truncate text-xs text-ink-muted">{c.company || c.email || 'No contact details yet'}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-muted">{formatDisplayDate(c.createdAt)}</span>
                  </Link>
                </li>
            )}
            </ul>
          }
        </section>
      </div>

      <ClientFormModal open={clientModal} onClose={() => setClientModal(false)} />
    </div>);

}