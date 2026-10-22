import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, PlusIcon } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { GroupLogo } from '../ui/GroupLogo';
import { Sidebar } from './Sidebar';
import { NotificationBell } from './NotificationBell';
import { useData } from '../../contexts/DataContext';
import { useDueItems } from '../../hooks/useDueItems';
import { useReminderNotifications } from '../../hooks/useReminderNotifications';

const ease = [0.23, 1, 0.32, 1] as const;

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { settings } = useData();
  const { reminders, today } = useDueItems();
  useReminderNotifications(reminders, today, settings.currencySymbol);
  const onEditor = /^\/documents\/(new\/|[^/]+\/edit)/.test(location.pathname);
  const [pref, setPref] = useState<boolean | null>(() => {
    try {
      const v = localStorage.getItem('lingo.sidebarCollapsed');
      return v === null ? null : v === '1';
    } catch {
      return null;
    }
  });
  // Auto-collapse on the editor so the form gets the room; user choice wins once made.
  const collapsed = pref ?? onEditor;
  const toggleSidebar = () => {
    const next = !collapsed;
    setPref(next);
    try {
      localStorage.setItem('lingo.sidebarCollapsed', next ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-clip bg-canvas">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-white transition-[width] duration-200 lg:flex ${collapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </aside>

      <AnimatePresence>
        {mobileOpen &&
        <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            onClick={() => setMobileOpen(false)} />
          
            <motion.aside
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 bg-white shadow-xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease }}>
            
              <Sidebar />
            </motion.aside>
          </div>
        }
      </AnimatePresence>

      <div className={`flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ${collapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-3 lg:hidden">
          <IconButton icon={MenuIcon} label="Open navigation" onClick={() => setMobileOpen(true)} />
          <Link to="/" aria-label="Lingo Groups billing home">
            <GroupLogo width={44} variant="mark" />
          </Link>
          <div className="flex items-center gap-1">
          <NotificationBell placement="below" />
          <Link
            to="/documents/new"
            aria-label="New document"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white transition-colors duration-150 hover:bg-ink-soft">
            
            <PlusIcon className="h-4 w-4" aria-hidden />
          </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>);

}