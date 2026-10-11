import React, { type CSSProperties } from 'react';
import type { LineGroup } from '../../types/document';
import { lineTotal } from '../../utils/calculations';
import { formatMoney } from '../../utils/format';
import { DOC_COLORS, TEMPLATE_GRID } from '../../utils/templateLayout';
import { Brace } from './Brace';

interface GroupRowsProps {
  group: LineGroup;
  layout: 'qty' | 'price';
  showQtyAlways: boolean;
  currency: string;
  first: boolean;
}

const descStyle: CSSProperties = { fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, color: '#151515', padding: '7px 12px 7px 6px', wordBreak: 'break-word' };
const numStyle: CSSProperties = { fontSize: 12.5, fontWeight: 400, lineHeight: 1.4, textAlign: 'center', padding: '7px 0', color: DOC_COLORS.ink, whiteSpace: 'nowrap' };
const subNote: CSSProperties = { fontSize: 11, fontWeight: 400, color: DOC_COLORS.muted, marginTop: 2 };

export function GroupRows({ group, layout, showQtyAlways, currency, first }: GroupRowsProps) {
  const hasTitle = group.kind === 'section' && group.title.trim().length > 0;
  const indent = hasTitle ? 28 : 0;
  const items = group.items.filter((i) => i.description.trim() || i.unitPrice > 0);
  const marginTop = first ? 0 : 14;
  const title = hasTitle ? <div style={descStyle}>{group.title}</div> : null;

  if (group.kind === 'section' && group.pricing === 'bundled') {
    const amount =
    group.bundlePrice === 0 && group.bundleLabel.trim() ? group.bundleLabel : formatMoney(group.bundlePrice, currency);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: layout === 'qty' ? TEMPLATE_GRID.qty : TEMPLATE_GRID.priceBundled, marginTop }}>
        <div>
          {title}
          {items.map((item) =>
          <div key={item.id} style={{ ...descStyle, paddingLeft: 6 + indent }}>
              {item.description}
            </div>
          )}
        </div>
        {layout === 'qty' && <div />}
        <div style={{ display: 'flex', justifyContent: layout === 'qty' ? 'flex-start' : 'center', padding: '4px 0 4px 6px' }}>
          <Brace />
        </div>
        <div style={{ ...numStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{amount}</div>
      </div>);

  }

  return (
    <div style={{ marginTop }}>
      {title}
      {items.map((item) => {
        const showQty = showQtyAlways || item.quantity !== 1;
        const discount = item.discount > 0 ? <div style={subNote}>Discount − {formatMoney(item.discount, currency)}</div> : null;
        if (layout === 'price') {
          return (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: TEMPLATE_GRID.price, alignItems: 'start' }}>
              <div style={{ ...descStyle, paddingLeft: 6 + indent }}>
                {item.description}
                {item.quantity !== 1 &&
                <div style={subNote}>
                    {item.quantity} × {formatMoney(item.unitPrice, currency)}
                  </div>
                }
                {discount}
              </div>
              <div style={numStyle}>{formatMoney(lineTotal(item), currency)}</div>
            </div>);

        }
        return (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: TEMPLATE_GRID.qty, alignItems: 'start' }}>
            <div style={{ ...descStyle, paddingLeft: 6 + indent }}>
              {item.description}
              {discount}
            </div>
            <div style={numStyle}>{showQty ? item.quantity : ''}</div>
            <div style={numStyle}>{showQty ? formatMoney(item.unitPrice, currency) : ''}</div>
            <div style={numStyle}>{formatMoney(lineTotal(item), currency)}</div>
          </div>);

      })}
    </div>);

}