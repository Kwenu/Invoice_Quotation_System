import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import type { TemplateProps } from '../../types/template';
import { DocumentRenderer } from '../templates/DocumentRenderer';

/** Off-screen, unscaled copy of the document used for PDF export and printing. */
export const ExportHost = forwardRef<HTMLDivElement, TemplateProps>(function ExportHost({ doc, settings }, ref) {
  return createPortal(
    <div
      className="print-root"
      data-export-host
      aria-hidden
      style={{ position: 'fixed', left: -10000, top: 0, width: 794, pointerEvents: 'none', zIndex: -1 }}>
      
      <div ref={ref} style={{ width: 794, background: '#ffffff' }}>
        <DocumentRenderer doc={doc} settings={settings} />
      </div>
    </div>,
    document.body
  );
});