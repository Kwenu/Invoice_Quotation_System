import type { LingoDocument } from '../types/document';

const invoiceTerms =
'Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.';
const bankDetails = {
  method: '',
  accountHolder: 'G.H.G.K. Wenuraka',
  bankName: 'BOC',
  accountNumber: '88884803',
  branch: 'Galle Bazaar Branch',
  reference: ''
};
const noAdjustments = { discountType: 'amount' as const, discountValue: 0, taxLabel: 'Tax', taxRate: 0, charges: [] };

/** Sample records recreated from the three reference PDFs. */
export const seedDocuments: LingoDocument[] = [
{
  id: 'doc_qut_0031',
  type: 'quotation',
  division: 'startup',
  templateId: 'startup-quotation',
  number: 'QUT-2026-0031',
  status: 'sent',
  issueDate: '2026-09-10',
  dueDate: '',
  validUntil: '2026-10-10',
  client: { clientId: 'cli_cybertec', name: 'Cybertec Enterprises', company: '', email: '', phone: '', address: '' },
  projectName: 'Cybertec Enterprises web application redo',
  projectDescription: '',
  groups: [
  {
    id: 'grp_q31_a',
    kind: 'section',
    title: 'Redo the Web Application for Cybertec Enterprises',
    pricing: 'bundled',
    bundlePrice: 10000,
    bundleLabel: '',
    items: [
    { id: 'itm_q31_1', description: 'UI Design', quantity: 1, unitPrice: 0, discount: 0 },
    { id: 'itm_q31_2', description: 'Development', quantity: 1, unitPrice: 0, discount: 0 }]

  },
  {
    id: 'grp_q31_b',
    kind: 'section',
    title: 'For Hosting with Maintenance Cost',
    pricing: 'itemized',
    bundlePrice: 0,
    bundleLabel: '',
    items: [
    { id: 'itm_q31_3', description: 'Annually', quantity: 1, unitPrice: 10000, discount: 0 },
    { id: 'itm_q31_4', description: 'Monthly', quantity: 1, unitPrice: 1000, discount: 0 }]

  }],

  adjustments: noAdjustments,
  payments: [],
  paymentDetails: bankDetails,
  paymentInstructions: '',
  notes: 'All the Modifications will undertaken by our company for a reasonable cost.',
  terms: 'The Prices will Change respecting to the Current USD Rate.',
  representative: { name: 'Kisara Wenuraka', designation: 'Founder/ CEO' },
  companyLine: '- Lingo Groups (Pvt) Ltd -',
  display: { showTotals: false, showProjectDetails: false, advanceLabel: 'Advance' },
  archived: false,
  createdAt: '2026-09-10T09:00:00.000Z',
  updatedAt: '2026-09-10T09:30:00.000Z',
  history: [
  { id: 'h_q31_1', at: '2026-09-10T09:00:00.000Z', action: 'Created', detail: 'Recreated from reference document QUT0031' },
  { id: 'h_q31_2', at: '2026-09-10T09:30:00.000Z', action: 'Status changed', detail: 'Marked as sent' }]

},
{
  id: 'doc_inv_0113',
  type: 'invoice',
  division: 'startup',
  templateId: 'startup-invoice',
  number: 'INV-2026-0113',
  status: 'sent',
  issueDate: '2026-09-05',
  dueDate: '2026-10-05',
  validUntil: '',
  client: { clientId: 'cli_shirantha', name: 'Shirantha Dewaka', company: '', email: '', phone: '', address: '' },
  projectName: 'Senehasa Elder Care Platform',
  projectDescription: '',
  groups: [
  {
    id: 'grp_113_a',
    kind: 'section',
    title: 'For Web App Development for Senehasa Elder Care Platform',
    pricing: 'bundled',
    bundlePrice: 0,
    bundleLabel: 'FOC',
    items: [
    { id: 'itm_113_1', description: 'UI Design', quantity: 1, unitPrice: 0, discount: 0 },
    { id: 'itm_113_2', description: 'Development', quantity: 1, unitPrice: 0, discount: 0 }]

  },
  {
    id: 'grp_113_b',
    kind: 'section',
    title: 'For Servers with maintenance cost',
    pricing: 'itemized',
    bundlePrice: 0,
    bundleLabel: '',
    items: [
    { id: 'itm_113_3', description: 'Annually', quantity: 1, unitPrice: 10000, discount: 0 },
    { id: 'itm_113_4', description: 'Monthly', quantity: 1, unitPrice: 1000, discount: 0 }]

  },
  {
    id: 'grp_113_c',
    kind: 'plain',
    title: '',
    pricing: 'itemized',
    bundlePrice: 0,
    bundleLabel: '',
    items: [
    { id: 'itm_113_5', description: 'For Hosting (Annually)', quantity: 1, unitPrice: 15000, discount: 0 },
    { id: 'itm_113_6', description: 'For Domain - senehasalanka.lk (Annually)', quantity: 1, unitPrice: 4500, discount: 0 }]

  }],

  adjustments: noAdjustments,
  payments: [
  {
    id: 'pay_113_1',
    date: '2026-09-05',
    amount: 10000,
    method: '',
    reference: '',
    note: 'Advance payment',
    showOnDocument: true,
    recordedAt: '2026-09-05T09:10:00.000Z'
  }],

  paymentDetails: bankDetails,
  paymentInstructions: '',
  notes: 'All the Modifications will undertaken by our company',
  terms: invoiceTerms,
  representative: { name: 'Kisara Wenuraka', designation: 'Founder/ CEO' },
  companyLine: '- Lingo Groups (Pvt) Ltd -',
  display: { showTotals: true, showProjectDetails: false, advanceLabel: 'Advance' },
  archived: false,
  createdAt: '2026-09-05T09:00:00.000Z',
  updatedAt: '2026-09-05T09:10:00.000Z',
  history: [
  { id: 'h_113_1', at: '2026-09-05T09:00:00.000Z', action: 'Created', detail: 'Recreated from reference document INV0113' },
  { id: 'h_113_2', at: '2026-09-05T09:05:00.000Z', action: 'Status changed', detail: 'Marked as sent' },
  { id: 'h_113_3', at: '2026-09-05T09:10:00.000Z', action: 'Payment recorded', detail: 'Rs. 10,000.00 advance received' }]

},
{
  id: 'doc_inv_0112',
  type: 'invoice',
  division: 'assignment-helpers',
  templateId: 'assignment-invoice',
  number: 'INV-AH-2026-0112',
  status: 'sent',
  issueDate: '2026-08-05',
  dueDate: '2026-09-04',
  validUntil: '',
  client: { clientId: 'cli_ruwan', name: 'Ruwan Pasindu', company: '', email: '', phone: '', address: '' },
  projectName: '',
  projectDescription: '',
  groups: [
  {
    id: 'grp_112_a',
    kind: 'plain',
    title: '',
    pricing: 'itemized',
    bundlePrice: 0,
    bundleLabel: '',
    items: [
    { id: 'itm_112_1', description: 'MS Office Package Final Assignment', quantity: 1, unitPrice: 1500, discount: 0 },
    { id: 'itm_112_2', description: 'Computer Networking Assignment', quantity: 1, unitPrice: 1500, discount: 0 },
    { id: 'itm_112_3', description: 'Fundamental of IT Assignment', quantity: 1, unitPrice: 1500, discount: 0 },
    { id: 'itm_112_4', description: 'Computer Hardware Assignment', quantity: 1, unitPrice: 1500, discount: 0 }]

  }],

  adjustments: noAdjustments,
  payments: [],
  paymentDetails: bankDetails,
  paymentInstructions: '',
  notes: 'All the Modifications will undertaken by our company',
  terms: invoiceTerms,
  representative: { name: 'Kisara Wenuraka', designation: 'Founder/ CEO' },
  companyLine: '- Lingo Groups (Pvt) Ltd -',
  display: { showTotals: true, showProjectDetails: false, advanceLabel: 'Advance' },
  archived: false,
  createdAt: '2026-08-05T09:00:00.000Z',
  updatedAt: '2026-08-05T09:20:00.000Z',
  history: [
  { id: 'h_112_1', at: '2026-08-05T09:00:00.000Z', action: 'Created', detail: 'Recreated from reference document INV0112' },
  { id: 'h_112_2', at: '2026-08-05T09:20:00.000Z', action: 'Status changed', detail: 'Marked as sent' }]

}];