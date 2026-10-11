import React, { useLayoutEffect, useRef, useState } from 'react';
import type { TemplateProps } from '../../types/template';
import { DocumentRenderer } from '../templates/DocumentRenderer';

/** Scales the full-size A4 template to fit its container. */
export function DocumentPreview({ doc, settings }: TemplateProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [height, setHeight] = useState(1123);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      setScale(Math.min(1, outer.clientWidth / 794));
      setHeight(inner.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="w-full">
      <div
        className="mx-auto overflow-hidden bg-white shadow-[0_1px_3px_rgba(16,24,40,0.08),0_12px_32px_rgba(16,24,40,0.10)]"
        style={{ width: 794 * scale, height: height * scale }}>
        
        <div ref={innerRef} style={{ width: 794, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <DocumentRenderer doc={doc} settings={settings} />
        </div>
      </div>
    </div>);

}