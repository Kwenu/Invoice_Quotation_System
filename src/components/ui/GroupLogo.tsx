import React from 'react';
import { GROUP_LOGO } from '../../data/brand';

interface GroupLogoProps {
  width: number;
  /** `full` = logo with company name, `mark` = LG monogram only (small spaces). */
  variant?: 'full' | 'mark';
  className?: string;
}

/** Lingo Groups (Pvt) Ltd — the head company logo used throughout the app interface. */
export function GroupLogo({ width, variant = 'full', className = '' }: GroupLogoProps) {
  const asset = GROUP_LOGO[variant];
  return (
    <img
      src={asset.src}
      alt="Lingo Groups (Pvt) Ltd"
      draggable={false}
      className={className}
      style={{ display: 'block', width, height: Math.round(width * asset.h / asset.w), maxWidth: 'none', flexShrink: 0 }} />);


}
