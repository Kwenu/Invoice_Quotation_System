import React from 'react';
import { LOGO_URL } from '../../data/brand';

// The supplied logo file has generous whitespace; crop to the artwork so it sits exactly like the PDFs.
const NATURAL = { w: 1213, h: 683 };
const CROPS = {
  full: { x: 108, y: 148, w: 994, h: 376 },
  mark: { x: 108, y: 148, w: 292, h: 298 }
} as const;

interface LingoLogoProps {
  width: number;
  variant?: 'full' | 'mark';
  className?: string;
  alt?: string;
}

export function LingoLogo({ width, variant = 'full', className = '', alt = 'Lingo' }: LingoLogoProps) {
  const crop = CROPS[variant];
  const scale = width / crop.w;
  return (
    <div
      className={className}
      style={{ width, height: Math.round(crop.h * scale), overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      
      <img
        src={LOGO_URL}
        alt={alt}
        draggable={false}
        style={{
          position: 'absolute',
          maxWidth: 'none',
          width: NATURAL.w * scale,
          height: NATURAL.h * scale,
          left: -crop.x * scale,
          top: -crop.y * scale
        }} />
      
    </div>);

}