import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { inputBase, inputBorder } from '../components/ui/fieldStyles';
import { PageHeader } from '../components/ui/PageHeader';
import { formatDisplayDate, formatMoney, initials } from '../utils/format';
import { getDocumentSummary, isOutstanding } from '../utils/status';

export function Clients() {
  const { clients, documents, settings } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.
    filter((c) => !q || [c.name, c.company, c.email, c.phone].join(' ').toLowerCase().includes(q)).
    map((c) => {
      const docs = documents.filter((d) => d.client.clientId === c.id && !d.archived).map(getDocumentSummary);
      const outstanding = docs.filter((s) => s.doc.type === 'invoice' && isOutstanding(s.status)).reduce((sum, s) => sum + s.totals.balance, 0);
      return { client: c, count: docs.length, outstanding };
    }).
    sort((a, b) => a.client.name.localeCompare(b.client.name));
  }, [clients, documents, query]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Clients"
        description="Saved clients auto-fill invoices and quotations."
        actions={<Button icon={UserPlusIcon} onClick={() => setModalOpen(true)}>Add client</Button>} />
      

      <div className="rounded-2xl border border-line bg-white">
        <div className="p-4">
          <div className="relative max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <label htmlFor="client-search" className="sr-only">Search clients</label>
            <input
              id="client-search"
              type="search"
              placeholder="Search name, company, email or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputBase} ${inputBorder(false)} h-10 pl-9`} />
            
          </div>
        </div>

        {rows.length === 0 ?
        <div className="border-t border-line">
            <EmptyState
            icon={UsersIcon}
            title={query ? 'No clients match your search' : 'No clients yet'}
            description={query ? 'Check the spelling or try another detail.' : 'Add a client here, or create one while writing a document.'}
            action={!query && <Button icon={UserPlusIcon} onClick={() => setModalOpen(true)}>Add client</Button>} />
          
          </div> :

        <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="py-3 pl-5 pr-3 font-medium">Client</th>
                  <th scope="col" className="px-3 py-3 font-medium">Contact</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Documents</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Outstanding</th>
                  <th scope="col" className="py-3 pl-3 pr-5 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ client, count, outstanding }) =>
              <tr key={client.id} onClick={() => navigate(`/clients/${client.id}`)} className="cursor-pointer transition-colors duration-150 hover:bg-canvas/70">
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink-soft">{initials(client.name)}</span>
                        <div className="min-w-0">
                          <Link to={`/clients/${client.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:underline">{client.name}</Link>
                          {client.company && client.company !== client.name && <p className="truncate text-xs text-ink-muted">{client.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">
                      <p className="truncate">{client.email || '—'}</p>
                      {client.phone && <p className="text-xs text-ink-muted">{client.phone}</p>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{count}</td>
                    <td className={`px-3 py-3 text-right tabular-nums ${outstanding > 0 ? 'font-medium text-ink' : 'text-ink-muted'}`}>
                      {formatMoney(outstanding, settings.currencySymbol)}
                    </td>
                    <td className="py-3 pl-3 pr-5 text-ink-muted">{formatDisplayDate(client.createdAt)}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>

      <ClientFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>);

}