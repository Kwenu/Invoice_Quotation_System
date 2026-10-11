import { FileTextIcon, LayoutDashboardIcon, RepeatIcon, SettingsIcon, UserCogIcon, UsersIcon } from 'lucide-react';

export const navigationItems = [
{ to: '/', label: 'Dashboard', icon: LayoutDashboardIcon, end: true },
{ to: '/documents', label: 'Documents', icon: FileTextIcon, end: false },
{ to: '/clients', label: 'Clients', icon: UsersIcon, end: false },
{ to: '/maintenance', label: 'Maintenance', icon: RepeatIcon, end: false },
{ to: '/team', label: 'Team', icon: UserCogIcon, end: false },
{ to: '/settings', label: 'Settings', icon: SettingsIcon, end: false }];