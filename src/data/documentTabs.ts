import type { DocumentTab } from '../utils/filters';

export const documentTabs: {id: DocumentTab;label: string;}[] = [
{ id: 'all', label: 'All documents' },
{ id: 'invoices', label: 'Invoices' },
{ id: 'quotations', label: 'Quotations' },
{ id: 'drafts', label: 'Drafts' },
{ id: 'sent', label: 'Sent' },
{ id: 'paid', label: 'Paid' },
{ id: 'outstanding', label: 'Outstanding' },
{ id: 'archived', label: 'Archived' }];


export const settingsTabs = [
{ id: 'company', label: 'Company' },
{ id: 'divisions', label: 'Divisions & payment' },
{ id: 'templates', label: 'Document defaults' },
{ id: 'numbering', label: 'Numbering' },
{ id: 'data', label: 'Data & integrations' }];


export const statusFilterOptions = [
{ value: 'all', label: 'Any status' },
{ value: 'draft', label: 'Draft' },
{ value: 'sent', label: 'Sent' },
{ value: 'partially-paid', label: 'Partially paid' },
{ value: 'paid', label: 'Paid' },
{ value: 'overdue', label: 'Overdue' },
{ value: 'cancelled', label: 'Cancelled' },
{ value: 'accepted', label: 'Accepted' },
{ value: 'rejected', label: 'Rejected' },
{ value: 'expired', label: 'Expired' },
{ value: 'converted', label: 'Converted to invoice' }];