import React, { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileSignatureIcon,
  FileTextIcon,
  HistoryIcon,
  PencilIcon,
  PrinterIcon,
  Trash2Icon,
  WalletIcon } from
'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { LingoDocument } from '../../types/document';
import { divisionInfo, documentTypeLabel } from '../../utils/documentFactory';
import { formatDisplayDate, formatMoney } from '../../utils/format';
import { getDocumentSummary, getEditLock, isOutstanding, type DocumentSummary } from '../../utils/status';
import { ActionMenu, type ActionMenuItem } from '../ui/ActionMenu';
import { StatusBadge } from '../ui/StatusBadge';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import { RecordPaymentModal } from './RecordPaymentModal';

interface DocumentTableProps {
  documents: LingoDocument[];
  emptyState?: ReactNode;
  hideClient?: boolean;
}

export function DocumentTable({ documents, emptyState, hideClient = false }: DocumentTableProps) {
  const { settings, setArchived, duplicateDocument } = useData();
  const navigate = useNavigate();
  const [paymentFor, setPaymentFor] = useState<LingoDocument | null>(null);
  const [deleteFor, setDeleteFor] = useState<LingoDocument | null>(null);
  const currency = settings.currencySymbol;

  if (!documents.length) return <>{emptyState}</>;
  const rows = documents.map(getDocumentSummary);

  const actionsFor = ({ doc, status, totals }: DocumentSummary): ActionMenuItem[] => {
    const items: ActionMenuItem[] = [
    { label: 'View', icon: EyeIcon, onSelect: () => navigate(`/documents/${doc.id}`) },
    { label: 'Edit', icon: PencilIcon, onSelect: () => navigate(`/documents/${doc.id}/edit`), disabled: Boolean(getEditLock(doc)) },
    {
      label: 'Duplicate',
      icon: CopyIcon,
      onSelect: () => {
        const copy = duplicateDocument(doc.id);
        if (copy) {
          toast.success(`Duplicated as ${copy.number}`);
          navigate(`/documents/${copy.id}/edit`);
        }
      }
    },
    { label: 'Download PDF', icon: DownloadIcon, onSelect: () => navigate(`/documents/${doc.id}?action=pdf`) },
    { label: 'Print', icon: PrinterIcon, onSelect: () => navigate(`/documents/${doc.id}?action=print`) }];

    if (doc.type === 'invoice')
    items.push({
      label: 'Record payment',
      icon: WalletIcon,
      onSelect: () => setPaymentFor(doc),
      disabled: !isOutstanding(status) || totals.balance <= 0 || doc.archived
    });
    items.push(
      { label: 'View history', icon: HistoryIcon, onSelect: () => navigate(`/documents/${doc.id}#history`) },
      doc.archived ?
      { label: 'Restore', icon: ArchiveRestoreIcon, onSelect: () => (setArchived(doc.id, false), toast.success(`${doc.number} restored`)) } :
      { label: 'Archive', icon: ArchiveIcon, tone: 'danger', onSelect: () => (setArchived(doc.id, true), toast.success(`${doc.number} archived`)) },
      { label: 'Delete permanently', icon: Trash2Icon, tone: 'danger', onSelect: () => setDeleteFor(doc) }
    );
    return items;
  };

  const docIcon = (doc: LingoDocument) => {
    const Icon = doc.type === 'invoice' ? FileTextIcon : FileSignatureIcon;
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-soft">
        <Icon className="h-4 w-4" aria-hidden />
      </span>);

  };

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-ink-muted">
              <th scope="col" className="py-3 pl-5 pr-3 font-medium">Document</th>
              {!hideClient && <th scope="col" className="px-3 py-3 font-medium">Client</th>}
              <th scope="col" className="px-3 py-3 font-medium">Date</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Amount</th>
              <th scope="col" className="px-3 py-3 font-medium">Status</th>
              <th scope="col" className="py-3 pl-3 pr-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const { doc, totals, status } = row;
              return (
                <tr key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)} className="cursor-pointer transition-colors duration-150 hover:bg-canvas/70">
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      {docIcon(doc)}
                      <div className="min-w-0">
                        <Link to={`/documents/${doc.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:underline">
                          {doc.number}
                        </Link>
                        <p className="text-xs text-ink-muted">
                          {documentTypeLabel(doc.type)} · {divisionInfo(doc.division).shortName}
                        </p>
                      </div>
                    </div>
                  </td>
                  {!hideClient &&
                  <td className="max-w-[260px] px-3 py-3">
                      <p className="truncate text-ink">{doc.client.name || '—'}</p>
                      {doc.projectName && <p className="truncate text-xs text-ink-muted">{doc.projectName}</p>}
                    </td>
                  }
                  <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{formatDisplayDate(doc.issueDate)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <p className="font-medium tabular-nums text-ink">{formatMoney(totals.total, currency)}</p>
                    {doc.type === 'invoice' && isOutstanding(status) && totals.paid > 0 &&
                    <p className="text-xs tabular-nums text-ink-muted">Bal. {formatMoney(totals.balance, currency)}</p>
                    }
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={status} /></td>
                  <td className="py-3 pl-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <ActionMenu items={actionsFor(row)} label={`Actions for ${doc.number}`} />
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => {
          const { doc, totals, status } = row;
          return (
            <li key={doc.id} className="flex items-start gap-3 px-4 py-3">
              {docIcon(doc)}
              <Link to={`/documents/${doc.id}`} className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink">{doc.number}</p>
                  <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(totals.total, currency)}</p>
                </div>
                <p className="truncate text-xs text-ink-muted">
                  {hideClient ? documentTypeLabel(doc.type) : doc.client.name} · {formatDisplayDate(doc.issueDate)}
                </p>
                <div className="mt-1.5"><StatusBadge status={status} /></div>
              </Link>
              <ActionMenu items={actionsFor(row)} label={`Actions for ${doc.number}`} />
            </li>);

        })}
      </ul>

      <RecordPaymentModal doc={paymentFor} onClose={() => setPaymentFor(null)} />
      <DeleteDocumentDialog doc={deleteFor} onClose={() => setDeleteFor(null)} />
    </>);

}