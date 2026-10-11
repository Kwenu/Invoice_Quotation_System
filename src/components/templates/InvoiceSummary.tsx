import React from 'react';
import type { LingoDocument } from '../../types/document';
import type { DocumentTotals } from '../../utils/calculations';
import { DOC_COLORS } from '../../utils/templateLayout';
import { TotalsLines } from './TotalsLines';

interface InvoiceSummaryProps {
  doc: LingoDocument;
  totals: DocumentTotals;
  currency: string;
}

export function InvoiceSummary({ doc, totals, currency }: InvoiceSummaryProps) {
  const p = doc.paymentDetails;
  const lines = [
  p.method,
  p.accountHolder,
  p.bankName && `Bank Name : ${p.bankName}`,
  p.accountNumber && `Account No : ${p.accountNumber}`,
  p.branch && `Branch : ${p.branch}`,
  p.reference && `Reference : ${p.reference}`].
  filter(Boolean) as string[];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, marginTop: 26, alignItems: 'start' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Payment Method</div>
        {lines.map((line) =>
        <div key={line} style={{ fontSize: 13.5, color: DOC_COLORS.grey, lineHeight: 1.75 }}>
            {line}
          </div>
        )}
        {doc.paymentInstructions.trim() &&
        <div style={{ fontSize: 11.5, color: DOC_COLORS.grey, marginTop: 8, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {doc.paymentInstructions}
          </div>
        }
      </div>
      <div style={{ paddingTop: 4 }}>
        <TotalsLines doc={doc} totals={totals} currency={currency} boxLabel="Total Due" boxAmount={totals.documentDue} includePayments />
      </div>
    </div>);

}