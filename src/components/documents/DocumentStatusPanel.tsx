import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRightLeftIcon, BanIcon, CheckCircle2Icon, SendIcon, WalletIcon, XCircleIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { LingoDocument } from '../../types/document';
import { formatDisplayDate, formatMoney } from '../../utils/format';
import { getDocumentSummary, isOutstanding } from '../../utils/status';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StatusBadge } from '../ui/StatusBadge';
import { RecordPaymentModal } from './RecordPaymentModal';

export function DocumentStatusPanel({ doc }: {doc: LingoDocument;}) {
  const { settings, documents, setDocumentStatus, convertToInvoice } = useData();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { totals, status } = getDocumentSummary(doc);
  const currency = settings.currencySymbol;
  const isInvoice = doc.type === 'invoice';
  const source = doc.sourceQuotationId ? documents.find((d) => d.id === doc.sourceQuotationId) : undefined;
  const converted = doc.convertedInvoiceId ? documents.find((d) => d.id === doc.convertedInvoiceId) : undefined;
  const readOnly = doc.archived;

  const markSent = () => {
    setDocumentStatus(doc.id, 'sent');
    toast.success(`${doc.number} marked as sent`);
  };

  const handleConvert = () => {
    const invoice = convertToInvoice(doc.id);
    if (invoice) {
      toast.success(`Invoice ${invoice.number} created from ${doc.number}`);
      navigate(`/documents/${invoice.id}/edit`);
    }
  };

  return (
    <section aria-labelledby="status-heading" className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="status-heading" className="text-sm font-semibold text-ink">Status</h2>
        <StatusBadge status={status} />
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{isInvoice ? 'Invoice total' : 'Quotation total'}</dt>
          <dd className="font-medium tabular-nums text-ink">{formatMoney(totals.total, currency)}</dd>
        </div>
        {isInvoice &&
        <>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Paid</dt>
              <dd className="tabular-nums text-ink-soft">{formatMoney(totals.paid, currency)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-line pt-2">
              <dt className="font-medium text-ink">Balance due</dt>
              <dd className="text-base font-semibold tabular-nums text-ink">{formatMoney(totals.balance, currency)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Due date</dt>
              <dd className={status === 'overdue' ? 'font-medium text-danger' : 'text-ink-soft'}>{formatDisplayDate(doc.dueDate)}</dd>
            </div>
          </>
        }
        {!isInvoice &&
        <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Valid until</dt>
            <dd className={status === 'expired' ? 'font-medium text-warning' : 'text-ink-soft'}>{formatDisplayDate(doc.validUntil)}</dd>
          </div>
        }
      </dl>

      {!readOnly &&
      <div className="mt-5 flex flex-col gap-2">
          {doc.status === 'draft' &&
        <Button icon={SendIcon} onClick={markSent}>Mark as sent</Button>
        }
          {isInvoice && isOutstanding(status) && totals.balance > 0 &&
        <Button icon={WalletIcon} onClick={() => setPaymentOpen(true)}>Record payment</Button>
        }
          {!isInvoice && (status === 'sent' || status === 'expired') &&
        <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" icon={CheckCircle2Icon} onClick={() => (setDocumentStatus(doc.id, 'accepted'), toast.success('Quotation accepted'))}>
                Accepted
              </Button>
              <Button variant="secondary" icon={XCircleIcon} onClick={() => (setDocumentStatus(doc.id, 'rejected'), toast('Quotation marked as rejected'))}>
                Rejected
              </Button>
            </div>
        }
          {!isInvoice && doc.status === 'accepted' &&
        <Button variant="brand" icon={ArrowRightLeftIcon} onClick={handleConvert}>Convert to invoice</Button>
        }
          {isInvoice && doc.status !== 'cancelled' && status !== 'paid' && totals.paid === 0 &&
        <Button variant="ghost" icon={BanIcon} onClick={() => setConfirmCancel(true)}>Cancel invoice</Button>
        }
        </div>
      }

      {(source || converted) &&
      <div className="mt-5 rounded-xl bg-canvas px-3 py-2.5 text-sm">
          {source &&
        <p className="text-ink-soft">
              Created from quotation{' '}
              <Link to={`/documents/${source.id}`} className="font-medium text-ink underline-offset-2 hover:underline">{source.number}</Link>
            </p>
        }
          {converted &&
        <p className="text-ink-soft">
              Converted to invoice{' '}
              <Link to={`/documents/${converted.id}`} className="font-medium text-ink underline-offset-2 hover:underline">{converted.number}</Link>
            </p>
        }
        </div>
      }

      <RecordPaymentModal doc={paymentOpen ? doc : null} onClose={() => setPaymentOpen(false)} />
      <ConfirmDialog
        open={confirmCancel}
        title={`Cancel ${doc.number}?`}
        description="The invoice stays on record with its number but is excluded from outstanding balances. This can't be undone."
        confirmLabel="Cancel invoice"
        tone="danger"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setDocumentStatus(doc.id, 'cancelled');
          setConfirmCancel(false);
          toast(`${doc.number} cancelled`);
        }} />
      
    </section>);

}