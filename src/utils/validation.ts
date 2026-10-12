import type { LingoDocument } from '../types/document';
import type { DocumentTotals } from './calculations';

export type ValidationField =
'clientName' |
'clientEmail' |
'issueDate' |
'dueDate' |
'validUntil' |
'items' |
'adjustments' |
'payments';

export type ValidationErrors = Partial<Record<ValidationField, string>>;

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function validateDocument(doc: LingoDocument, totals: DocumentTotals): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!doc.client.name.trim()) errors.clientName = 'Client name is required.';
  if (doc.client.email.trim() && !isValidEmail(doc.client.email.trim())) errors.clientEmail = 'Enter a valid email address.';
  if (!doc.issueDate) errors.issueDate = 'Choose a document date.';

  if (doc.type === 'invoice') {
    if (!doc.dueDate) errors.dueDate = 'Choose a payment due date.';else
    if (doc.dueDate < doc.issueDate) errors.dueDate = 'Due date cannot be before the invoice date.';
  } else {
    if (!doc.validUntil) errors.validUntil = 'Choose a valid-until date.';else
    if (doc.validUntil < doc.issueDate) errors.validUntil = 'Valid-until date cannot be before the quotation date.';
  }

  const hasContent = doc.groups.some(
    (g) => g.kind === 'section' && g.title.trim() || g.items.some((i) => i.description.trim())
  );
  if (!hasContent) errors.items = 'Add at least one line item with a description.';else
  if (doc.groups.some((g) => g.items.some((i) => !i.description.trim() && i.unitPrice > 0)))
  errors.items = 'Every priced line item needs a description.';

  if (doc.adjustments.discountType === 'percent' && doc.adjustments.discountValue > 100)
  errors.adjustments = 'A percentage discount cannot exceed 100%.';
  if (doc.adjustments.charges.some((c) => c.amount !== 0 && !c.label.trim()))
  errors.adjustments = 'Give every additional charge a label.';

  if (doc.type === 'invoice' && totals.paid > totals.total + 0.001)
  errors.payments = 'Recorded payments exceed the new invoice total. Void or reduce a payment first, or raise the total.';
  return errors;
}