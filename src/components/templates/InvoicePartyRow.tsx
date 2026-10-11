import React from 'react';
import type { LingoDocument } from '../../types/document';
import { formatDocDate, formatMoney } from '../../utils/format';
import { DOC_COLORS } from '../../utils/templateLayout';

interface InvoicePartyRowProps {
  doc: LingoDocument;
  total: number;
  currency: string;
  marginTop: number;
}

export function InvoicePartyRow({ doc, total, currency, marginTop }: InvoicePartyRowProps) {
  const { client } = doc;
  const extraLines = [client.company && client.company !== client.name ? client.company : '', client.address, client.phone, client.email].filter(Boolean);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', alignItems: 'start', marginTop }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700 }}>INVOICE TO :</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: DOC_COLORS.navy, marginTop: 6, textTransform: 'uppercase', lineHeight: 1.3 }}>
          {client.name || 'Client name'}
        </div>
        {extraLines.map((line) =>
        <div key={line} style={{ fontSize: 11, color: DOC_COLORS.grey, marginTop: 3, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
            {line}
          </div>
        )}
        <div style={{ width: 44, height: 3, background: DOC_COLORS.ink, marginTop: 10, borderRadius: 2 }} />
      </div>
      <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>
        <div>Date : {formatDocDate(doc.issueDate)}</div>
        <div style={{ marginTop: 14 }}>Invoice No : {doc.number}</div>
        {doc.dueDate && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 400, color: DOC_COLORS.grey }}>Due Date : {formatDocDate(doc.dueDate)}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700 }}>TOTAL&nbsp; :</div>
        <div style={{ fontSize: 21, fontWeight: 700, color: DOC_COLORS.navy, marginTop: 6, whiteSpace: 'nowrap' }}>
          {formatMoney(total, currency)}
        </div>
      </div>
    </div>);

}