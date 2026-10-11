import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, BellRingIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useDueItems } from '../../hooks/useDueItems';
import { notificationsSupported } from '../../hooks/useReminderNotifications';
import { whenLabel } from '../../utils/dueItems';
import { formatMoney } from '../../utils/format';

interface Props {
  /** Where the panel opens relative to the bell. */
  placement?: 'right' | 'below';
}

export function NotificationBell({ placement = 'right' }: Props) {
  const { settings } = useData();
  const { reminders } = useDueItems();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(notificationsSupported() ? Notification.permission : 'unsupported');
  const ref = useRef<HTMLDivElement>(null);
  const overdue = reminders.filter((r) => r.overdue).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const enable = async () => setPermission(await Notification.requestPermission());
  const Icon = reminders.length ? BellRingIcon : BellIcon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications${reminders.length ? `, ${reminders.length} need attention` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
        
        <Icon className="h-4 w-4" aria-hidden />
        {reminders.length > 0 &&
        <span className={`absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ${overdue ? 'bg-danger' : 'bg-warning'}`}>
            {reminders.length > 9 ? '9+' : reminders.length}
          </span>
        }
      </button>

      {open &&
      <div
        role="dialog"
        aria-label="Notifications"
        className={`absolute z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-line bg-white shadow-xl ${placement === 'right' ? 'left-full top-0 ml-3' : 'right-0 top-full mt-2'}`}>
        
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Payment reminders</p>
            <p className="text-xs text-ink-muted">Maintenance charges and invoices that are due or overdue.</p>
          </div>
          {reminders.length === 0 ?
        <p className="px-4 py-8 text-center text-sm text-ink-muted">You’re all caught up.</p> :
        <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {reminders.map((r) =>
          <li key={r.id}>
                  <Link to={r.to} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-canvas/70">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${r.overdue ? 'bg-danger' : 'bg-warning'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                      <p className={`text-xs ${r.overdue ? 'text-danger' : 'text-ink-muted'}`}>{whenLabel(r.daysAway)} · {formatMoney(r.amount, settings.currencySymbol)}</p>
                    </div>
                  </Link>
                </li>
          )}
            </ul>
        }
          {permission !== 'unsupported' &&
        <div className="border-t border-line px-4 py-3">
              {permission === 'granted' ?
          <p className="text-xs text-ink-muted">Desktop alerts are on while Lingo Billing is open.</p> :
          permission === 'denied' ?
          <p className="text-xs text-ink-muted">Desktop alerts are blocked in your browser settings for this site.</p> :
          <button type="button" onClick={enable} className="text-xs font-medium text-brand-blue hover:underline">Turn on desktop alerts</button>}
            </div>
        }
        </div>
      }
    </div>);

}
