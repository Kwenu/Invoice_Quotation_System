import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface SessionUser {
  email: string;
  signedInAt: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  /** True while a saved Supabase session is being restored on page load. */
  loading: boolean;
  /** 'supabase' = real accounts; 'prototype' = any email + 6-char password (no Supabase configured). */
  mode: 'supabase' | 'prototype';
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const SESSION_KEY = 'lingo-billing:prototype-session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readPrototypeSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as SessionUser : null;
  } catch {
    return null;
  }
}

/** Signed in AND listed in public.admins. Anyone else is signed straight back out. */
async function toAdminUser(session: Session | null): Promise<SessionUser | null> {
  if (!session) return null;
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (error || !data) return null;
  return { email: session.user.email ?? '', signedInAt: new Date().toISOString() };
}

export function AuthProvider({ children }: {children: ReactNode;}) {
  const [user, setUser] = useState<SessionUser | null>(() => isSupabaseConfigured ? null : readPrototypeSession());
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    // Restore a saved session (this is what keeps you signed in after closing the browser).
    supabase.auth.getSession().then(async ({ data }) => {
      const admin = await toAdminUser(data.session);
      if (!active) return;
      if (data.session && !admin) await supabase.auth.signOut();
      setUser(admin);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Only react to sign-out / token expiry here; sign-in is handled by signIn() so the admin check can report errors.
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) setUser(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      const session: SessionUser = { email: email.trim().toLowerCase(), signedInAt: new Date().toISOString() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      throw new Error(/invalid login/i.test(error.message) ? 'Incorrect email or password.' : error.message);
    }
    const admin = await toAdminUser(data.session);
    if (!admin) {
      await supabase.auth.signOut();
      throw new Error('This account is not authorised for Lingo Billing. Ask the owner to add it as an administrator.');
    }
    setUser(admin);
  }, []);

  const signOut = useCallback(() => {
    if (isSupabaseConfigured) {
      void supabase.auth.signOut();
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, mode: isSupabaseConfigured ? 'supabase' : 'prototype', signIn, signOut }),
    [user, loading, signIn, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
