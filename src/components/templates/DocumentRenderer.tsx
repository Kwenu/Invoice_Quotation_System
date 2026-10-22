import React from 'react';
import type { TemplateProps } from '../../types/template';
import { InvoiceTemplate } from './InvoiceTemplate';
import { QuotationTemplate } from './QuotationTemplate';

/**
 * Template registry. All companies share one invoice layout and one quotation layout;
 * the company's logo, footer brand line, tagline and payment details come from its division settings.
 */
export function DocumentRenderer({ doc, settings }: TemplateProps) {
  switch (doc.templateId) {
    case 'startup-quotation':
    case 'academy-quotation':
    case 'auron-quotation':
      return <QuotationTemplate doc={doc} settings={settings} />;
    case 'startup-invoice':
    case 'academy-invoice':
    case 'auron-invoice':
    default:
      return <InvoiceTemplate doc={doc} settings={settings} />;
  }
}
