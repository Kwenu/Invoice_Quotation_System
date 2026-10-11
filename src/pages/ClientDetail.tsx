import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FilePlus2Icon, FileTextIcon, MailIcon, MapPinIcon, PencilIcon, PhoneIcon, UserXIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { DocumentTable } from '../components/documents/DocumentTable';
import { Button } from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonStyles';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDisplayDate, formatMoney, initials } from '../utils/format';
import { getDocumentSummary, isOutstanding } from '../utils/status';

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, documents, settings } = useData();
  const [editOpen, setEditOpen] = useState(false);
  const client = clients.find((c) => c.id === id);
  const currency = settings.currencySymbol;

  const summaries = useMemo(
    () => documents.filter((d) => d.client.clientId === id).map(getDocumentSummary).sort((a, b) => b.doc.issueDate.localeCompare(a.doc.issueDate)),
    [documents, id]
  );

  if (!client) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState icon={UserXIcon} title="Client not found" description="This client isn't in this browser's prototype storage." action={<Link to="/clients" className={buttonClasses('primary')}>Back to clients</Link>} />
      </div>);

  }

  const invoices = summaries.filter((s) => s.doc.type === 'invoice' && s.status !== 'cancelled' && s.status !== 'draft' && !s.doc.archived);
  const billed = invoices.reduce((sum, s) => sum + s.totals.total, 0);
  const received = invoices.reduce((sum, s) => sum + s.totals.paid, 0);
  const outstanding = invoices.filter((s) => isOutstanding(s.status)).reduce((sum, s) => sum + s.totals.balance, 0);
  const payments = summaries.
  flatMap((s) => s.doc.payments.map((p) => ({ ...p, docNumber: s.doc.number, docId: s.doc.id }))).
  sort((a, b) => b.date.localeCompare(a.date));

  const contact = [
  { icon: MailIcon, value: client.email },
  { icon: PhoneIcon, value: client.phone },
  { icon: MapPinIcon, value: client.address }].
  filter((c) => c.value);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden /> Clients
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{initials(client.name)}</span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{client.name}</h1>
            <p className="text-sm text-ink-muted">{client.company && client.company !== client.name ? client.company : `Client since ${formatDisplayDate(client.createdAt)}`}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={PencilIcon} onClick={() => setEditOpen(true)}>Edit</Button>
          <Button icon={FilePlus2Icon} onClick={() => navigate(`/documents/new?clientId=${client.id}`)}>New document</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section aria-label="Balance" className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white">
            <div className="p-5">
              <p className="text-xs text-ink-muted">Outstanding</p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${outstanding > 0 ? 'text-ink' : 'text-ink-muted'}`}>{formatMoney(outstanding, currency)}</p>
            </div>
            <div className="p-5">
              <p className="text-xs text-ink-muted">Billed</p>
              <p className="mt-1 text-base font-medium tabular-nums text-ink-soft">{formatMoney(billed, currency)}</p>
            </div>
            <div className="p-5">
              <p className="text-xs text-ink-muted">Received</p>
              <p className="mt-1 text-base font-medium tabular-nums text-ink-soft">{formatMoney(received, currency)}</p>
            </div>
          </section>

          <section aria-labelledby="client-docs" className="rounded-2xl border border-line bg-white">
            <h2 id="client-docs" className="px-5 py-4 text-sm font-semibold text-ink">Invoices &amp; quotations</h2>
            <div className="border-t border-line">
              <DocumentTable
                hideClient
                documents={summaries.map((s) => s.doc)}
                emptyState={<EmptyState icon={FileTextIcon} title="No documents yet" description="Invoices and quotations for this client will be listed here." />} />
              
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="contact-heading" className="rounded-2xl border border-line bg-white p-5">
            <h2 id="contact-heading" className="text-sm font-semibold text-ink">Contact</h2>
            {contact.length === 0 ?
            <p className="mt-2 text-sm text-ink-muted">No contact details saved. Edit the client to add them.</p> :

            <ul className="mt-3 space-y-2.5">
                {contact.map((c) =>
              <li key={c.value} className="flex gap-2.5 text-sm text-ink-soft">
                    <c.icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                    <span className="whitespace-pre-line break-words">{c.value}</span>
                  </li>
              )}
              </ul>
            }
            {client.notes && <p className="mt-4 border-t border-line pt-3 text-sm text-ink-soft">{client.notes}</p>}
          </section>

          <section aria-labelledby="payments-heading" className="rounded-2xl border border-line bg-white p-5">
            <h2 id="payments-heading" className="text-sm font-semibold text-ink">Payments</h2>
            {payments.length === 0 ?
            <p className="mt-2 text-sm text-ink-muted">No payments recorded.</p> :

            <ul className="mt-3 divide-y divide-line">
                {payments.map((p) =>
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(p.amount, currency)}</p>
                      <p className="text-xs text-ink-muted">{formatDisplayDate(p.date)}</p>
                    </div>
                    <Link to={`/documents/${p.docId}`} className="text-xs font-medium text-ink-soft hover:text-ink hover:underline">{p.docNumber}</Link>
                  </li>
              )}
              </ul>
            }
          </section>
        </div>
      </div>

      <ClientFormModal open={editOpen} client={client} onClose={() => setEditOpen(false)} />
    </div>);

}