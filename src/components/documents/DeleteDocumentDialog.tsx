import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { LingoDocument } from '../../types/document';
import { calculateTotals } from '../../utils/calculations';
import { documentTypeLabel } from '../../utils/documentFactory';
import { formatMoney } from '../../utils/format';
import { isLatestNumber } from '../../utils/numbering';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  doc: LingoDocument | null;
  onClose: () => void;
  onDeleted?: (doc: LingoDocument) => void;
}

/** Permanent delete. Documents with payments or that were already issued need the number typed to confirm. */
export function DeleteDocumentDialog({ doc, onClose, onDeleted }: Props) {
  const { settings, assignments, deleteDocument } = useData();
  const [typed, setTyped] = useState('');
  const [reuse, setReuse] = useState(true);

  useEffect(() => {
    setTyped('');
    setReuse(true);
  }, [doc?.id]);

  const open = Boolean(doc);
  const totals = doc ? calculateTotals(doc) : null;
  const linked = doc ? assignments.filter((a) => a.documentId === doc.id).length : 0;
  const reusable = doc ? isLatestNumber(settings.numbering[doc.templateId], doc.number, doc.issueDate) : false;
  const needsTyping = doc ? doc.payments.length > 0 || doc.status !== 'draft' && doc.status !== 'cancelled' : false;
  const confirmed = !needsTyping || typed.trim().toUpperCase() === doc?.number.toUpperCase();

  const handleDelete = () => {
    if (!doc || !confirmed) return;
    deleteDocument(doc.id, { reuseNumber: reusable && reuse });
    toast.success(`${doc.number} deleted${reusable && reuse ? ' — the number can be used again' : ''}`);
    onDeleted?.(doc);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc ? `Delete ${doc.number} permanently?` : 'Delete document'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={!confirmed}>Delete permanently</Button>
        </>
      }>
      
      {doc && totals &&
      <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            This removes the {documentTypeLabel(doc.type).toLowerCase()} from the database for good, together with its history
            {doc.payments.length > 0 && <> and <span className="font-medium text-ink">{doc.payments.length} recorded payment{doc.payments.length === 1 ? '' : 's'} ({formatMoney(totals.paid, settings.currencySymbol)})</span></>}.
            It can’t be undone.
          </p>
          {doc.status !== 'cancelled' && doc.status !== 'draft' &&
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-ink-soft">
              If you only want to take it out of your totals but keep a record, <span className="font-medium text-ink">cancel</span> it instead.
            </p>
        }
          {linked > 0 &&
        <p>{linked} team portion{linked === 1 ? ' is' : 's are'} linked to this invoice. {linked === 1 ? 'It' : 'They'} will stay as manual project{linked === 1 ? '' : 's'} with the same amount.</p>
        }
          {reusable &&
        <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-canvas px-3 py-2.5">
              <input type="checkbox" checked={reuse} onChange={(e) => setReuse(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0B4FB3]" />
              <span>Use <span className="font-medium text-ink">{doc.number}</span> again for the next document (it is the latest number issued).</span>
            </label>
        }
          {needsTyping &&
        <div>
              <label htmlFor="delete-confirm" className="mb-1.5 block text-xs font-medium text-ink-soft">
                Type <span className="font-semibold text-ink">{doc.number}</span> to confirm
              </label>
              <input
            id="delete-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20" />
          
            </div>
        }
        </div>
      }
    </Modal>);

}
