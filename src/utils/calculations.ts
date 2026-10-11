import type { LineGroup, LineItem, LingoDocument } from '../types/document';

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  charges: number;
  total: number;
  paid: number;
  balance: number;
  /** Payments printed on the document (e.g. "Advance"). */
  shownPaid: number;
  /** "Total Due" printed on the document. */
  documentDue: number;
}

const safe = (n: number) => Number.isFinite(n) ? n : 0;
export const round2 = (n: number) => Math.round((safe(n) + Number.EPSILON) * 100) / 100;

/** Line Total = Quantity × Unit Price − Discount */
export function lineTotal(item: LineItem): number {
  return round2(Math.max(0, safe(item.quantity) * safe(item.unitPrice) - safe(item.discount)));
}

export function groupTotal(group: LineGroup): number {
  if (group.kind === 'section' && group.pricing === 'bundled') return round2(Math.max(0, safe(group.bundlePrice)));
  return round2(group.items.reduce((sum, item) => sum + lineTotal(item), 0));
}

export function calculateTotals(doc: Pick<LingoDocument, 'groups' | 'adjustments' | 'payments'>): DocumentTotals {
  const subtotal = round2(doc.groups.reduce((sum, g) => sum + groupTotal(g), 0));
  const { discountType, discountValue, taxRate, charges: extra } = doc.adjustments;
  const rawDiscount = discountType === 'percent' ? subtotal * safe(discountValue) / 100 : safe(discountValue);
  const discount = round2(Math.min(subtotal, Math.max(0, rawDiscount)));
  const taxable = round2(subtotal - discount);
  const tax = round2(taxable * Math.max(0, safe(taxRate)) / 100);
  const charges = round2(extra.reduce((sum, c) => sum + safe(c.amount), 0));
  const total = round2(taxable + tax + charges);
  const paid = round2(doc.payments.reduce((sum, p) => sum + safe(p.amount), 0));
  const shownPaid = round2(doc.payments.filter((p) => p.showOnDocument).reduce((sum, p) => sum + safe(p.amount), 0));
  return {
    subtotal,
    discount,
    taxable,
    tax,
    charges,
    total,
    paid,
    balance: round2(Math.max(0, total - paid)),
    shownPaid,
    documentDue: round2(Math.max(0, total - shownPaid))
  };
}