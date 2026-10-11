import { useEffect, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { todayIso } from '../utils/format';
import { buildDueItems } from '../utils/dueItems';

/** Due maintenance charges and invoices, recalculated when data changes or the day rolls over. */
export function useDueItems() {
  const { documents, retainers } = useData();
  const [today, setToday] = useState(todayIso());

  useEffect(() => {
    const id = window.setInterval(() => setToday(todayIso()), 10 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const items = useMemo(() => buildDueItems(documents, retainers, today), [documents, retainers, today]);
  const reminders = useMemo(() => items.filter((i) => i.remind), [items]);
  return { items, reminders, today };
}
