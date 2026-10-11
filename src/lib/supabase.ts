import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as {env: Record<string, string | undefined>;}).env;
const url = env.VITE_SUPABASE_URL?.trim();
const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

/** True when both env variables are present. Without them the app falls back to browser-only prototype storage. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Browser client. The anon key is public by design — all protection comes from Row Level Security
 * (only users listed in public.admins can read or write anything). Never put a service_role key here.
 * The session is kept in localStorage by supabase-js, so you stay signed in until you press Sign out.
 */
export const supabase: SupabaseClient = createClient(url ?? 'http://localhost:54321', anonKey ?? 'missing-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});
