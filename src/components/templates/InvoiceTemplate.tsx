import React from 'react';
import type { TemplateProps } from '../../types/template';
import { calculateTotals } from '../../utils/calculations';
import { DivisionLogo, divisionLogoWidth } from '../ui/DivisionLogo';
import { InvoicePartyRow } from './InvoicePartyRow';
import { InvoiceSummary } from './InvoiceSummary';
import { ItemsTable } from './ItemsTable';
import { NotesSignature } from './NotesSignature';
import { TemplateFrame } from './TemplateFrame';

/**
 * Invoice layout shared by every company (reference: INV0113).
 * Only the logo at the top changes between Lingo Startup Company, Lingo Tech Academy and Auron Wear.
 */
export function InvoiceTemplate({ doc, settings }: TemplateProps) {
  const totals = calculateTotals(doc);
  const currency = settings.currencySymbol;
  const division = settings.divisions[doc.division];
  return (
    <TemplateFrame division={doc.division}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 44 }}>
        <div style={{ marginLeft: -8 }}>
          <DivisionLogo division={doc.division} width={divisionLogoWidth(doc.division, 'invoice')} />
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1, letterSpacing: '0.005em' }}>INVOICE</div>
      </div>
      <InvoicePartyRow doc={doc} total={totals.total} currency={currency} marginTop={52} />
      <div style={{ marginTop: 40 }}>
        <ItemsTable groups={doc.groups} layout="qty" currency={currency} division={doc.division} />
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