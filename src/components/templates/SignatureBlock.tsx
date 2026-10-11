import React from 'react';
import type { Representative } from '../../types/document';
import { DOC_COLORS } from '../../utils/templateLayout';

interface SignatureBlockProps {
  representative: Representative;
  companyLine: string;
  signatureUrl: string;
}

export function SignatureBlock({ representative, companyLine, signatureUrl }: SignatureBlockProps) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 17, fontWeight: 500, color: DOC_COLORS.ink }}>{representative.name}</div>
      <div style={{ fontSize: 14, marginTop: 4, color: DOC_COLORS.ink }}>{representative.designation}</div>
      <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        {signatureUrl ?
        <img src={signatureUrl} alt="Authorised signature" style={{ maxHeight: 92, maxWidth: 200, objectFit: 'contain' }} /> :
        null}
      </div>
      <div style={{ fontSize: 17, color: DOC_COLORS.ink, marginTop: 4 }}>{companyLine}</div>
    </div>);

}