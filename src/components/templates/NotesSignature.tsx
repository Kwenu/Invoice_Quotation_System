import React from 'react';
import type { Representative } from '../../types/document';
import { DOC_COLORS } from '../../utils/templateLayout';
import { SignatureBlock } from './SignatureBlock';

interface NotesSignatureProps {
  blocks: {heading: string;text: string;}[];
  representative: Representative;
  companyLine: string;
  signatureUrl: string;
  marginTop: number;
}

export function NotesSignature({ blocks, representative, companyLine, signatureUrl, marginTop }: NotesSignatureProps) {
  const visible = blocks.filter((b) => b.text.trim());
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, marginTop, alignItems: 'start' }}>
      <div style={{ paddingTop: 14, maxWidth: 300 }}>
        {visible.map((block, index) =>
        <div key={block.heading} style={{ marginTop: index === 0 ? 0 : 22 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{block.heading}</div>
            <div style={{ fontSize: 12.5, color: DOC_COLORS.grey, marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{block.text}</div>
          </div>
        )}
      </div>
      <SignatureBlock representative={representative} companyLine={companyLine} signatureUrl={signatureUrl} />
    </div>);

}