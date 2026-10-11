import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function RequireAuth({ children }: {children: ReactNode;}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        <Loader2Icon className="h-5 w-5 animate-spin" aria-label="Loading" />
      </div>);
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}
