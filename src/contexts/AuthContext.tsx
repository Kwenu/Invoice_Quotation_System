import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface SessionUser {
  email: string;
  signedInAt: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const SESSION_KEY = 'lingo-billing:prototype-session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as SessionUser : null;
  } catch {
    return null;
  }
}

/**
 * PROTOTYPE authentication — any valid email and a 6+ character password opens a session for this tab.
 * Production: replace signIn/signOut with supabase.auth.signInWithPassword / signOut and gate access
 * with the `admins` table + row level security (see data/supabaseSchema.ts).
 */
export function AuthProvider({ children }: {children: ReactNode;}) {
  const [user, setUser] = useState<SessionUser | null>(readSession);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const session: SessionUser = { email: email.trim().toLowerCase(), signedInAt: new Date().toISOString() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}