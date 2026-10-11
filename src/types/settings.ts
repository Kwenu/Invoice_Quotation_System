import type { DivisionId, PaymentDetails, Representative, TemplateId } from './document';

export type YearFormat = 'YYYY' | 'YY' | 'none';

export interface NumberingConfig {
  prefix: string;
  separator: string;
  yearFormat: YearFormat;
  padding: number;
  nextNumber: number;
}

export interface TemplateDefaults {
  notes: string;
  terms: string;
  paymentInstructions: string;
  dueDays: number;
  validDays: number;
}

export interface DivisionSettings {
  id: DivisionId;
  name: string;
  brandLine: string;
  tagline: string;
  companyLine: string;
  paymentDetails: PaymentDetails;
  representative: Representative;
  signatureDataUrl: string;
}

export interface AppSettings {
  companyName: string;
  currencySymbol: string;
  currencyCode: string;
  divisions: Record<DivisionId, DivisionSettings>;
  templates: Record<TemplateId, TemplateDefaults>;
  numbering: Record<TemplateId, NumberingConfig>;
}