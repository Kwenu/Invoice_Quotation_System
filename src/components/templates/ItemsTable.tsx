import React, { type CSSProperties, type ReactNode } from 'react';
import type { LineGroup } from '../../types/document';
import { DOC_COLORS, TEMPLATE_GRID, docBarBackground } from '../../utils/templateLayout';
import { GroupRows } from './GroupRows';

interface ItemsTableProps {
  groups: LineGroup[];
  layout: 'qty' | 'price';
  currency: string;
  showQtyAlways?: boolean;
  overlay?: ReactNode;
  division?: string;
}

const headCell: CSSProperties = { textAlign: 'center' };

export function ItemsTable({ groups, layout, currency, showQtyAlways = false, overlay, division }: ItemsTableProps) {
  const visible = groups.filter(
    (g) => g.kind === 'section' && g.title.trim() || g.items.some((i) => i.description.trim() || i.unitPrice > 0)
  );
  return (
    <div>
      <div
        style={{
          background: docBarBackground(division),
          height: 45,
          display: 'grid',
          gridTemplateColumns: layout === 'qty' ? TEMPLATE_GRID.qty : TEMPLATE_GRID.price,
          alignItems: 'center',
          color: '#ffffff',
          fontSize: 17,
          fontWeight: 600
        }}>
        
        <div style={{ paddingLeft: 18 }}>Description</div>
        {layout === 'qty' ?
        <>
            <div style={headCell}>Qty</div>
            <div style={headCell}>Price</div>
            <div style={headCell}>Total</div>
          </> :

        <div style={headCell}>Price</div>
        }
      </div>
      <div style={{ position: 'relative', padding: '30px 0 26px', minHeight: 150 }}>
        {overlay}
        <div style={{ position: 'relative' }}>
          {visible.length === 0 ?
          <div style={{ fontSize: 12.5, color: DOC_COLORS.muted, padding: '7px 6px' }}>Line items will appear here.</div> :

          visible.map((group, index) =>
          <GroupRows
            key={group.id}
            group={group}
            layout={layout}
            currency={currency}
            showQtyAlways={showQtyAlways}
            first={index === 0} />

          )
          }
        </div>
      </div>
      <div style={{ height: 1, background: DOC_COLORS.ink }} />
    </div>);

}