import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CloudCheckIcon, CloudOffIcon, DatabaseIcon, LogOutIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, PlusIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { navigationItems } from '../../data/navigation';
import { initials } from '../../utils/format';
import { buttonClasses } from '../ui/buttonStyles';
import { IconButton } from '../ui/IconButton';
import { GroupLogo } from '../ui/GroupLogo';
import { NotificationBell } from './NotificationBell';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

function StorageStatus() {
  const { storageMode, syncStatus, syncError, retrySync } = useData();

  if (storageMode === 'prototype-local') {
    return (
      <div className="mx-3 mb-3 rounded-xl border border-dashed border-line-strong p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <DatabaseIcon className="h-3.5 w-3.5" aria-hidden />
          Prototype storage
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">Records are kept in this browser only. Add your Supabase keys to store them in the cloud.</p>
      </div>);

  }

  const failed = syncStatus === 'error';
  return (
    <div className={`mx-3 mb-3 rounded-xl border p-3 ${failed ? 'border-danger/30 bg-danger-soft' : 'border-line bg-canvas/60'}`}>
      <p className={`flex items-center gap-1.5 text-xs font-semibold ${failed ? 'text-danger' : 'text-ink-soft'}`}>
        {failed ? <CloudOffIcon className="h-3.5 w-3.5" aria-hidden /> : <CloudCheckIcon className="h-3.5 w-3.5" aria-hidden />}
        {failed ? 'Not saved to cloud' : syncStatus === 'saving' ? 'Saving…' : 'Saved to cloud'}
      </p>
      {failed ?
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          {syncError} <button type="button" onClick={retrySync} className="font-medium underline">Retry now</button>
        </p> :
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">Stored in your Supabase database.</p>}
    </div>);

}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  if (collapsed) {
    return (
      <div className="flex h-full w-full flex-col items-center gap-2 py-4">
        <Link to="/" aria-label="Lingo Groups billing home" className="mb-2 inline-block">
          <GroupLogo width={40} variant="mark" />
        </Link>
        <Link to="/documents/new" aria-label="New document" title="New document" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white transition-colors hover:bg-ink-soft">
          <PlusIcon className="h-4 w-4" aria-hidden />
        </Link>
        <NotificationBell placement="right" />
        <nav aria-label="Main" className="mt-2 flex flex-1 flex-col items-center gap-1">
          {navigationItems.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.label}
            title={item.label}
            className={({ isActive }) =>
            `flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150 ${isActive ? 'bg-ink text-white' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`
            }>
              <item.icon className="h-4 w-4" aria-hidden />
            </NavLink>
          )}
        </nav>
        {onToggle && <IconButton icon={PanelLeftOpenIcon} label="Expand sidebar" onClick={onToggle} />}
        <IconButton icon={LogOutIcon} label="Sign out" onClick={signOut} />
      </div>);
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col items-center border-b border-line bg-gradient-to-b from-indigo-50 to-white px-5 pb-5 pt-6 text-center">
        <Link to="/" aria-label="Lingo Groups billing home" className="inline-block">
          <GroupLogo width={132} />
        </Link>
        <p className="mt-2 text-xs font-medium text-indigo-700">Invoices &amp; Quotations</p>
      </div>
      <div className="flex items-center justify-between px-3 pb-2">
        {onToggle ?
        <button type="button" onClick={onToggle} className="flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink">
            <PanelLeftCloseIcon className="h-4 w-4" aria-hidden />
            Collapse sidebar
          </button> : <span />}
        <NotificationBell placement="right" />
      </div>

      <div className="px-3">
        <Link to="/documents/new" className={buttonClasses('primary', 'md', 'w-full')}>
          <PlusIcon className="h-4 w-4" aria-hidden />
          New document
        </Link>
      </div>

      <nav aria-label="Main" className="mt-6 flex-1 space-y-1 px-3">
        {navigationItems.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
          `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
          isActive ? 'bg-gradient-to-r from-[#0546A9] to-[#5B5BCB] text-white shadow-sm' : 'text-ink-soft hover:bg-indigo-50 hover:text-ink'}`

          }>
          
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </NavLink>
        )}
      </nav>

      <StorageStatus />

      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink-soft">
          {initials(user?.email.split('@')[0] ?? '')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{user?.email}</p>
          <p className="text-xs text-ink-muted">Administrator</p>
        </div>
        <IconButton icon={LogOutIcon} label="Sign out" onClick={signOut} />
      </div>
    </div>);

}