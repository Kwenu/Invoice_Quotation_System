import React from 'react';

/** Faint "LAH" watermark behind the item rows, as on the Assignment Helpers invoice. */
export function AssignmentWatermark() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: -12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
      
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 190, lineHeight: 1, color: 'rgba(40,40,40,0.075)', letterSpacing: '-0.04em' }}>
        LAH
      </div>
      <div style={{ fontSize: 13, letterSpacing: '0.42em', color: 'rgba(40,40,40,0.2)', marginTop: -70 }}>LINGO ASSIGNMENT HELPERS</div>
    </div>);

}