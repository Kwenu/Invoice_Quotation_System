import React from 'react';
import { DIVISION_LOGOS } from '../../data/brand';
import type { DivisionId } from '../../types/document';
import { LingoLogo } from './LingoLogo';

interface DivisionLogoProps {
  division: DivisionId;
  width: number;
  /** `mark` is the icon-only version. Renders nothing when a company has no separate icon. */
  variant?: 'full' | 'mark';
  className?: string;
}

/** The logo of one trading company, as printed on its invoices and quotations. */
export function DivisionLogo({ division, width, variant = 'full', className = '' }: DivisionLogoProps) {
  if (division === 'startup') return <LingoLogo width={width} variant={variant} className={className} />;

  const config = DIVISION_LOGOS[division];
  const asset = variant === 'mark' ? config.mark : config.full;
  if (!asset) return null;
  return (
    <img
      src={asset.src}
      alt={division === 'academy' ? 'Lingo Tech Academy' : 'Auron Wear'}
      draggable={false}
      className={className}
      style={{ display: 'block', width, height: Math.round(width * asset.h / asset.w), maxWidth: 'none', flexShrink: 0 }} />);


}

/** Printed width of a company's logo for a given document type. */
export function divisionLogoWidth(division: DivisionId, type: 'invoice' | 'quotation'): number {
  if (division === 'startup') return type === 'invoice' ? 242 : 226;
  const config = DIVISION_LOGOS[division];
  return type === 'invoice' ? config.invoiceWidth : config.quotationWidth;
}

export function divisionHasMark(division: DivisionId): boolean {
  return division === 'startup' || Boolean(DIVISION_LOGOS[division].mark);
}
