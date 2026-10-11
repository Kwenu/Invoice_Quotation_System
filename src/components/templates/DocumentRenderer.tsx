import React from 'react';
import type { TemplateProps } from '../../types/template';
import { AssignmentInvoiceTemplate } from './AssignmentInvoiceTemplate';
import { StartupInvoiceTemplate } from './StartupInvoiceTemplate';
import { StartupQuotationTemplate } from './StartupQuotationTemplate';

/** Template registry — add new division templates here. */
export function DocumentRenderer({ doc, settings }: TemplateProps) {
  switch (doc.templateId) {
    case 'assignment-invoice':
      return <AssignmentInvoiceTemplate doc={doc} settings={settings} />;
    case 'startup-quotation':
      return <StartupQuotationTemplate doc={doc} settings={settings} />;
    case 'startup-invoice':
    default:
      return <StartupInvoiceTemplate doc={doc} settings={settings} />;
  }
}