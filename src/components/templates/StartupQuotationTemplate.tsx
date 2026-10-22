import React from 'react';
import type { TemplateProps } from '../../types/template';
import { calculateTotals } from '../../utils/calculations';
import { formatDocDate } from '../../utils/format';
import { DOC_COLORS, docAccent } from '../../utils/templateLayout';
import { LingoLogo } from '../ui/LingoLogo';
import { ItemsTable } from './ItemsTable';
import { NotesSignature } from './NotesSignature';
import { TemplateFrame } from './TemplateFrame';
import { TotalsLines } from './TotalsLines';

/** Template 3 — Lingo Startup Quotation (reference: QUT0031). */
export function StartupQuotationTemplate({ doc, settings }: TemplateProps) {
  const totals = calculateTotals(doc);
  const currency = settings.currencySymbol;
  const division = settings.divisions[doc.division];
  const { client } = doc;
  const extraLines = [client.company && client.company !== client.name ? client.company : '', client.address, client.phone, client.email].filter(Boolean);
  const showProject = doc.display.showProjectDetails && (doc.projectName.trim() || doc.projectDescription.trim());

  return (
    <TemplateFrame footerBrand={division.brandLine} division={doc.division}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20 }}>
        <div style={{ marginLeft: -60, marginTop: 22 }}>
          <LingoLogo width={226} />
        </div>
        <div style={{ marginRight: -66, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LingoLogo width={94} variant="mark" />
          {division.tagline &&
          <div className="font-script" style={{ fontSize: 20, marginTop: 4, color: '#2B2B2B', whiteSpace: 'nowrap' }}>
              {division.tagline}
            </div>
          }
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 64, fontWeight: 700, lineHeight: 1, marginTop: 26 }}>QUOTATION</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start', marginTop: 50 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700 }}>TO :</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: docAccent(doc.division), marginTop: 6, textTransform: 'uppercase', lineHeight: 1.3 }}>
            {client.name || 'Client name'}
          </div>
          {extraLines.map((line) =>
          <div key={line} style={{ fontSize: 11, color: DOC_COLORS.grey, marginTop: 3, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
              {line}
            </div>
          )}
          <div style={{ width: 44, height: 3, background: DOC_COLORS.ink, marginTop: 12, borderRadius: 2 }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, paddingRight: 10, paddingTop: 10 }}>
          <div>Date : {formatDocDate(doc.issueDate)}</div>
          <div style={{ marginTop: 16 }}>Quotation No : {doc.number}</div>
          {doc.validUntil &&
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 400, color: DOC_COLORS.grey }}>Valid Until : {formatDocDate(doc.validUntil)}</div>
          }
        </div>
      </div>

      {showProject &&
      <div style={{ marginTop: 26 }}>
          {doc.projectName.trim() && <div style={{ fontSize: 13, fontWeight: 600 }}>Project : {doc.projectName}</div>}
          {doc.projectDescription.trim() &&
        <div style={{ fontSize: 12, color: DOC_COLORS.grey, marginTop: 4, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{doc.projectDescription}</div>
        }
        </div>
      }

      <div style={{ marginTop: showProject ? 24 : 44 }}>
        <ItemsTable groups={doc.groups} layout="price" currency={currency} division={doc.division} />
      </div>

      {doc.display.showTotals &&
      <div style={{ marginTop: 22 }}>
          <TotalsLines doc={doc} totals={totals} currency={currency} boxLabel="Total" boxAmount={totals.total} includePayments={false} />
        </div>
      }

      <NotesSignature
        marginTop={doc.display.showTotals ? 26 : 34}
        blocks={[{ heading: 'Notes', text: [doc.notes, doc.terms].filter((t) => t.trim()).join('\n\n') }]}
        representative={doc.representative}
        companyLine={doc.companyLine}
        signatureUrl={division.signatureDataUrl} />
      
      <div style={{ flex: 1 }} />
    </TemplateFrame>);

}