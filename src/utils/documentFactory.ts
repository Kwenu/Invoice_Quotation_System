import { divisions, templateAssignments } from '../data/divisions';
import type { Client } from '../types/client';
import type {
  ClientSnapshot,
  DivisionId,
  DocumentType,
  GroupKind,
  LineGroup,
  LineItem,
  LingoDocument,
  TemplateId } from
'../types/document';
import type { AppSettings } from '../types/settings';
import { addDaysIso, todayIso } from './format';
import { createId } from './id';

export function resolveTemplate(division: DivisionId, type: DocumentType): TemplateId | null {
  return templateAssignments.find((t) => t.division === division && t.type === type)?.templateId ?? null;
}

export function templateInfo(templateId: TemplateId) {
  return templateAssignments.find((t) => t.templateId === templateId)!;
}

export function divisionInfo(id: DivisionId) {
  return divisions.find((d) => d.id === id)!;
}

export function isDivisionId(value: string | undefined): value is DivisionId {
  return value === 'startup' || value === 'academy' || value === 'auron';
}

export function isDocumentType(value: string | undefined): value is DocumentType {
  return value === 'invoice' || value === 'quotation';
}

export const documentTypeLabel = (type: DocumentType) => type === 'invoice' ? 'Invoice' : 'Quotation';

export function createItem(partial: Partial<LineItem> = {}): LineItem {
  return { id: createId('item'), description: '', quantity: 1, unitPrice: 0, discount: 0, ...partial };
}

export function createGroup(kind: GroupKind, partial: Partial<LineGroup> = {}): LineGroup {
  return {
    id: createId('grp'),
    kind,
    title: '',
    pricing: 'itemized',
    bundlePrice: 0,
    bundleLabel: '',
    items: [createItem()],
    ...partial
  };
}

export function emptyClientSnapshot(): ClientSnapshot {
  return { clientId: null, name: '', company: '', email: '', phone: '', address: '' };
}

export function snapshotFromClient(client: Client): ClientSnapshot {
  return {
    clientId: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    address: client.address
  };
}

export function cloneGroups(groups: LineGroup[]): LineGroup[] {
  return groups.map((g) => ({ ...g, id: createId('grp'), items: g.items.map((i) => ({ ...i, id: createId('item') })) }));
}

export function createBlankDocument(division: DivisionId, type: DocumentType, settings: AppSettings): LingoDocument {
  const templateId = resolveTemplate(division, type);
  if (!templateId) throw new Error(`No ${type} template configured for ${division}`);
  const defaults = settings.templates[templateId];
  const divisionSettings = settings.divisions[division];
  const today = todayIso();
  const now = new Date().toISOString();
  return {
    id: createId('doc'),
    type,
    division,
    templateId,
    number: '',
    status: 'draft',
    issueDate: today,
    dueDate: type === 'invoice' ? addDaysIso(today, defaults.dueDays) : '',
    validUntil: type === 'quotation' ? addDaysIso(today, defaults.validDays) : '',
    client: emptyClientSnapshot(),
    projectName: '',
    projectDescription: '',
    groups: [createGroup('plain')],
    adjustments: { discountType: 'amount', discountValue: 0, taxLabel: 'Tax', taxRate: 0, charges: [] },
    payments: [],
    paymentDetails: { ...divisionSettings.paymentDetails },
    paymentInstructions: defaults.paymentInstructions,
    notes: defaults.notes,
    terms: defaults.terms,
    representative: { ...divisionSettings.representative },
    companyLine: divisionSettings.companyLine,
    display: { showTotals: true, showProjectDetails: true, advanceLabel: 'Advance' },
    archived: false,
    createdAt: now,
    updatedAt: now,
    history: []
  };
}

export function cloneAsDraft(source: LingoDocument, settings: AppSettings): LingoDocument {
  const blank = createBlankDocument(source.division, source.type, settings);
  return {
    ...blank,
    client: { ...source.client },
    projectName: source.projectName,
    projectDescription: source.projectDescription,
    groups: cloneGroups(source.groups),
    adjustments: { ...source.adjustments, charges: source.adjustments.charges.map((c) => ({ ...c, id: createId('chg') })) },
    paymentDetails: { ...source.paymentDetails },
    paymentInstructions: source.paymentInstructions,
    notes: source.notes,
    terms: source.terms,
    representative: { ...source.representative },
    companyLine: source.companyLine,
    display: { ...source.display }
  };
}

export function invoiceFromQuotation(quotation: LingoDocument, settings: AppSettings): LingoDocument {
  const blank = createBlankDocument(quotation.division, 'invoice', settings);
  return {
    ...blank,
    client: { ...quotation.client },
    projectName: quotation.projectName,
    projectDescription: quotation.projectDescription,
    groups: cloneGroups(quotation.groups),
    adjustments: {
      ...quotation.adjustments,
      charges: quotation.adjustments.charges.map((c) => ({ ...c, id: createId('chg') }))
    },
    representative: { ...quotation.representative },
    companyLine: quotation.companyLine,
    sourceQuotationId: quotation.id
  };
}