import React from 'react';
import type { TemplateProps } from '../../types/template';
import { calculateTotals } from '../../utils/calculations';
import { LingoLogo } from '../ui/LingoLogo';
import { AssignmentWatermark } from './AssignmentWatermark';
import { InvoicePartyRow } from './InvoicePartyRow';
import { InvoiceSummary } from './InvoiceSummary';
import { ItemsTable } from './ItemsTable';
import { NotesSignature } from './NotesSignature';
import { TemplateFrame } from './TemplateFrame';

/** Template 2 — Lingo Assignment Helpers Invoice (reference: INV0112). */
export function AssignmentInvoiceTemplate({ doc, settings }: TemplateProps) {
  const totals = calculateTotals(doc);
  const currency = settings.currencySymbol;
  const division = settings.divisions[doc.division];
  return (
    <TemplateFrame footerBrand={division.brandLine} division={doc.division}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 66 }}>
        <div style={{ marginLeft: -8 }}>
          <LingoLogo width={242} />
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1, letterSpacing: '0.005em' }}>INVOICE</div>
      </div>
      <InvoicePartyRow doc={doc} total={totals.total} currency={currency} marginTop={62} />
      <div style={{ marginTop: 50 }}>
        <ItemsTable groups={doc.groups} layout="qty" currency={currency} showQtyAlways division={doc.division} overlay={<AssignmentWatermark division={doc.division} />} />
      </div>
      <InvoiceSummary doc={doc} totals={totals} currency={currency} />
      <NotesSignature
        marginTop={34}
        blocks={[
        { heading: 'Notes', text: doc.notes },
        { heading: 'Terms  and Conditions', text: doc.terms }]
        }
        representative={doc.representative}
        companyLine={doc.companyLine}
        signatureUrl={division.signatureDataUrl} />
      
      <div style={{ flex: 1 }} />
    </TemplateFrame>);

}