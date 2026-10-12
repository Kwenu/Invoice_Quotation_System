export type DivisionId = 'startup' | 'assignment-helpers';
export type DocumentType = 'invoice' | 'quotation';
export type TemplateId = 'startup-invoice' | 'assignment-invoice' | 'startup-quotation';

/** Status persisted on the record. Payment-driven states are derived, never stored. */
export type StoredStatus = 'draft' | 'sent' | 'cancelled' | 'accepted' | 'rejected' | 'converted';
export type InvoiceStatus = 'draft' | 'sent' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type DocumentStatus = InvoiceStatus | QuotationStatus;

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

/** plain = top-level items; section = bold heading with indented sub-items. */
export type GroupKind = 'plain' | 'section';
/** bundled = one price for the whole section (shown with a brace, like the reference PDFs). */
export type GroupPricing = 'itemized' | 'bundled';

export interface LineGroup {
  id: string;
  kind: GroupKind;
  title: string;
  pricing: GroupPricing;
  bundlePrice: number;
  bundleLabel: string;
  items: LineItem[];
}

export interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
}

export interface Adjustments {
  discountType: 'amount' | 'percent';
  discountValue: number;
  taxLabel: string;
  taxRate: number;
  charges: ExtraCharge[];
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  note: string;
  showOnDocument: boolean;
  recordedAt: string;
}

export interface ClientSnapshot {
  clientId: string | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

export interface PaymentDetails {
  method: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  reference: string;
}

export interface Representative {
  name: string;
  designation: string;
}

export interface DisplayOptions {
  showTotals: boolean;
  showProjectDetails: boolean;
  advanceLabel: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  action: string;
  detail: string;
}

export interface LingoDocument {
  id: string;
  type: DocumentType;
  division: DivisionId;
  templateId: TemplateId;
  number: string;
  status: StoredStatus;
  issueDate: string;
  dueDate: string;
  validUntil: string;
  client: ClientSnapshot;
  projectName: string;
  projectDescription: string;
  groups: LineGroup[];
  adjustments: Adjustments;
  payments: Payment[];
  paymentDetails: PaymentDetails;
  paymentInstructions: string;
  notes: string;
  terms: string;
  representative: Representative;
  companyLine: string;
  display: DisplayOptions;
  sourceQuotationId?: string;
  convertedInvoiceId?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
}

export interface DivisionInfo {
  id: DivisionId;
  name: string;
  shortName: string;
  summary: string;
}

export interface TemplateAssignment {
  division: DivisionId;
  type: DocumentType;
  templateId: TemplateId;
  label: string;
}