import React from 'react';
import type { HistoryEntry } from '../../types/document';
import { formatTimestamp } from '../../utils/format';

export function HistoryTimeline({ entries }: {entries: HistoryEntry[];}) {
  if (!entries.length) return <p className="text-sm text-ink-muted">No activity yet.</p>;
  const ordered = [...entries].reverse();
  return (
    <ol className="relative space-y-4 border-l border-line pl-4">
      {ordered.map((entry) =>
      <li key={entry.id} className="relative">
          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-ink-faint ring-1 ring-line" aria-hidden />
          <p className="text-sm font-medium text-ink">{entry.action}</p>
          <p className="text-sm text-ink-soft">{entry.detail}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{formatTimestamp(entry.at)}</p>
        </li>
      )}
    </ol>);

}