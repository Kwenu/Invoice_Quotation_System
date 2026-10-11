import React from 'react';
import type { LingoDocument } from '../../types/document';
import type { DocumentTotals } from '../../utils/calculations';
import { formatMoney } from '../../utils/format';
import { DOC_COLORS } from '../../utils/templateLayout';

interface TotalsLinesProps {
  doc: LingoDocument;
  totals: DocumentTotals;
  currency: string;
  boxLabel: string;
  boxAmount: number;
  includePayments: boolean;
}

/** Right-aligned Sub-total / adjustments / Advance rows followed by the gradient "Total Due" box. */
export function TotalsLines({ doc, totals, currency, boxLabel, boxAmount, includePayments }: TotalsLinesProps) {
  const { adjustments } = doc;
  const rows: {label: string;value: string;}[] = [{ label: 'Sub-total :', value: formatMoney(totals.subtotal, currency) }];
  if (totals.discount > 0)
  rows.push({
    label: adjustments.discountType === 'percent' ? `Discount (${adjustments.discountValue}%) :` : 'Discount :',
    value: `-  ${formatMoney(totals.discount, currency)}`
  });
  if (totals.tax > 0) rows.push({ label: `${adjustments.taxLabel || 'Tax'} (${adjustments.taxRate}%) :`, value: formatMoney(totals.tax, currency) });
  adjustments.charges.
  filter((c) => c.amount !== 0).
  forEach((c) => rows.push({ label: `${c.label} :`, value: formatMoney(c.amount, currency) }));
  if (includePayments && totals.shownPaid > 0)
  rows.push({ label: `${doc.display.advanceLabel || 'Advance'} :`, value: `-  ${formatMoney(totals.shownPaid, currency)}` });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 14, rowGap: 14, fontSize: 12.5, color: DOC_COLORS.ink, marginRight: 22 }}>
        {rows.map((row, index) =>
        <React.Fragment key={`${row.label}-${index}`}>
            <div style={{ textAlign: 'right' }}>{row.label}</div>
            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{row.value}</div>
          </React.Fragment>
        )}
      </div>
      <div
        className="bg-lingo"
        style={{ marginTop: 18, minWidth: 228, padding: '10px 18px', color: '#ffffff', fontSize: 17.5, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
        
        {boxLabel} : {formatMoney(boxAmount, currency)}
      </div>
    </div>);

}