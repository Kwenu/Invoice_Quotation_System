import React, { type ReactNode } from 'react';
import { DOC_COLORS } from '../../utils/templateLayout';

interface TemplateFrameProps {
  children: ReactNode;
  footerBrand?: string;
}

/** A4 page (794 × 1123px at 96dpi) with the gradient bars from the reference documents. Grows when content is long. */
export function TemplateFrame({ children, footerBrand }: TemplateFrameProps) {
  return (
    <div
      className="font-doc"
      style={{
        width: 794,
        minHeight: 1123,
        background: '#ffffff',
        color: DOC_COLORS.ink,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
      
      <div className="bg-lingo" style={{ height: 39, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 88px' }}>{children}</div>
      {footerBrand ?
      <div
        className="font-hand"
        style={{
          textAlign: 'center',
          fontSize: 21,
          letterSpacing: '0.62em',
          textIndent: '0.62em',
          color: DOC_COLORS.muted,
          padding: '24px 0 30px',
          whiteSpace: 'nowrap'
        }}>
        
          {footerBrand}
        </div> :

      <div style={{ height: 40 }} />
      }
      <div className="bg-lingo" style={{ height: 39, flexShrink: 0 }} />
    </div>);

}