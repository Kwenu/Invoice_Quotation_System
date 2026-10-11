import { useEffect } from 'react';
import type { DueItem } from '../utils/dueItems';
import { formatMoney } from '../utils/format';
import { whenLabel } from '../utils/dueItems';

const KEY_PREFIX = 'lingo-billing:notified:';

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

/**
 * Shows a desktop notification once per reminder per day while the app is open.
 * Browsers only allow this after the user grants permission (button in the bell menu).
 * Alerts while the app is closed need a server (email / push) — see README.
 */
export function useReminderNotifications(reminders: DueItem[], today: string, currency: string) {
  useEffect(() => {
    if (!notificationsSupported() || Notification.permission !== 'granted' || reminders.length === 0) return;
    const key = KEY_PREFIX + today;
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
    } catch {
      seen = [];
    }
    const fresh = reminders.filter((r) => !seen.includes(r.id));
    if (fresh.length === 0) return;

    if (fresh.length > 3) {
      new Notification(`${fresh.length} payments need attention`, { body: 'Open Lingo Billing to see maintenance charges and invoices that are due.', tag: 'lingo-summary' });
    } else {
      fresh.forEach((r) =>
      new Notification(r.title, { body: `${whenLabel(r.daysAway)} · ${formatMoney(r.amount, currency)}`, tag: r.id })
      );
    }
    try {
      localStorage.setItem(key, JSON.stringify([...seen, ...fresh.map((r) => r.id)]));
      // Drop yesterday's bookkeeping.
      Object.keys(localStorage).filter((k) => k.startsWith(KEY_PREFIX) && k !== key).forEach((k) => localStorage.removeItem(k));
    } catch {
      /* best effort */
    }
  }, [reminders, today, currency]);
}
