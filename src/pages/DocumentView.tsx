import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftIcon, CopyIcon, DownloadIcon, FileXIcon, PencilIcon, PrinterIcon, Trash2Icon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { DocumentPreview } from '../components/documents/DocumentPreview';
import { DocumentStatusPanel } from '../components/documents/DocumentStatusPanel';
import { ExportHost } from '../components/documents/ExportHost';
import { HistoryTimeline } from '../components/documents/HistoryTimeline';
import { Button } from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonStyles';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { usePdfExport } from '../hooks/usePdfExport';
import { divisionInfo, templateInfo } from '../utils/documentFactory';
import { formatDisplayDate, formatMoney } from '../utils/format';
import { getDocumentSummary, getEditLock } from '../utils/status';

export function DocumentView() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { documents, settings, duplicateDocument, setArchived, removePayment } = useData();
  const doc = documents.find((d) => d.id === id);
  const { exportRef, busy, download, print } = usePdfExport();
  const [voidPaymentId, setVoidPaymentId] = useState<string | null>(null);
  const fileName = doc ? doc.number : 'document';

  useEffect(() => {
    const action = params.get('action');
    if (!action || !doc) return;
    const timer = window.setTimeout(() => {
      if (action === 'pdf') download(fileName);
      if (action === 'print') print();
      setParams({}, { replace: true });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [params, doc, download, print, setParams, fileName]);

  useEffect(() => {
    if (location.hash === '#history') document.getElementById('history')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  if (!doc) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={FileXIcon}
          title="Document not found"
          description="It may not exist in this browser's prototype storage."
          action={<Link to="/documents" className={buttonClasses('primary')}>Back to documents</Link>} />
        
      </div>);

  }

  const { status } = getDocumentSummary(doc);
  const lock = getEditLock(doc);
  const template = templateInfo(doc.templateId);
  const currency = settings.currencySymbol;
  const paymentToVoid = doc.payments.find((p) => p.id === voidPaymentId);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link to="/documents" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden /> Documents
      </Link>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{doc.number}</h1>
            <StatusBadge status={status} />
            {doc.archived && <span className="rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-ink-muted ring-1 ring-inset ring-line-strong">Archived</span>}
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {template.label} · {doc.client.name || 'No client'} · {formatDisplayDate(doc.issueDate)} · {divisionInfo(doc.division).name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!lock &&
          <Link to={`/documents/${doc.id}/edit`} className={buttonClasses('secondary')}>
              <PencilIcon className="h-4 w-4" aria-hidden /> Edit
            </Link>
          }
          <Button
            variant="secondary"
            icon={CopyIcon}
            onClick={() => {
              const copy = duplicateDocument(doc.id);
              if (copy) {
                toast.success(`Duplicated as ${copy.number}`);
                navigate(`/documents/${copy.id}/edit`);
              }
            }}>
            
            Duplicate
          </Button>
          <Button variant="secondary" icon={doc.archived ? ArchiveRestoreIcon : ArchiveIcon} onClick={() => (setArchived(doc.id, !doc.archived), toast.success(doc.archived ? 'Restored' : 'Archived'))}>
            {doc.archived ? 'Restore' : 'Archive'}
          </Button>
          <Button variant="secondary" icon={PrinterIcon} onClick={print}>Print</Button>
          <Button icon={DownloadIcon} loading={busy} onClick={() => download(fileName)}>
            {busy ? 'Generating…' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl bg-[#E6E8EC] p-3 sm:p-6">
          <div className="mx-auto max-w-[794px]">
            <DocumentPreview doc={doc} settings={settings} />
          </div>
        </div>

        <div className="space-y-6">
          <DocumentStatusPanel doc={doc} />

          {doc.type === 'invoice' &&
          <section aria-labelledby="payments-heading" className="rounded-2xl border border-line bg-white p-5">
              <h2 id="payments-heading" className="text-sm font-semibold text-ink">Payments</h2>
              {doc.payments.length === 0 ?
            <p className="mt-2 text-sm text-ink-muted">No payments recorded.</p> :

            <ul className="mt-3 divide-y divide-line">
                  {doc.payments.map((p) =>
              <li key={p.id} className="flex items-center gap-2 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(p.amount, currency)}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {formatDisplayDate(p.date)}
                          {p.method && ` · ${p.method}`}
                          {p.reference && ` · Ref ${p.reference}`}
                          {p.note && ` · ${p.note}`}
                        </p>
                      </div>
                      {!doc.archived && doc.status !== 'cancelled' &&
                <IconButton icon={Trash2Icon} label="Void payment" tone="danger" onClick={() => setVoidPaymentId(p.id)} />
                }
                    </li>
              )}
                </ul>
            }
            </section>
          }

          <section id="history" aria-labelledby="history-heading" className="scroll-mt-20 rounded-2xl border border-line bg-white p-5">
            <h2 id="history-heading" className="mb-4 text-sm font-semibold text-ink">History</h2>
            <HistoryTimeline entries={doc.history} />
          </section>
        </div>
      </div>

      <ExportHost ref={exportRef} doc={doc} settings={settings} />

      <ConfirmDialog
        open={Boolean(paymentToVoid)}
        title="Void this payment?"
        description={paymentToVoid ? `${formatMoney(paymentToVoid.amount, currency)} from ${formatDisplayDate(paymentToVoid.date)} will be removed and the balance recalculated. The change is kept in history.` : ''}
        confirmLabel="Void payment"
        tone="danger"
        onCancel={() => setVoidPaymentId(null)}
        onConfirm={() => {
          if (paymentToVoid) removePayment(doc.id, paymentToVoid.id);
          setVoidPaymentId(null);
          toast('Payment voided');
        }} />
      
    </div>);

}