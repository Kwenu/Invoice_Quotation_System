import React from 'react';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';
import type { LingoDocument } from '../../types/document';
import { calculateTotals } from '../../utils/calculations';
import { formatMoney } from '../../utils/format';
import { Modal } from '../ui/Modal';
import { PaymentForm } from './PaymentForm';

interface RecordPaymentModalProps {
  doc: LingoDocument | null;
  onClose: () => void;
}

export function RecordPaymentModal({ doc, onClose }: RecordPaymentModalProps) {
  const { recordPayment, settings } = useData();
  const totals = doc ? calculateTotals(doc) : null;
  const currency = settings.currencySymbol;

  return (
    <Modal
      open={Boolean(doc)}
      onClose={onClose}
      title={doc ? `Record payment · ${doc.number}` : 'Record payment'}
      description={totals ? `Outstanding ${formatMoney(totals.balance, currency)} of ${formatMoney(totals.total, currency)}` : undefined}>
      
      {doc && totals &&
      <PaymentForm
        key={doc.id}
        balance={totals.balance}
        currency={currency}
        submitLabel="Record payment"
        onCancel={onClose}
        onSubmit={(values) => {
          recordPayment(doc.id, values);
          toast.success(`${formatMoney(values.amount, currency)} recorded on ${doc.number}`);
          onClose();
        }} />

      }
    </Modal>);

}