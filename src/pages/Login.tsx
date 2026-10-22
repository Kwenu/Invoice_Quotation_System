import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircleIcon, BellRingIcon, EyeIcon, EyeOffIcon, FileTextIcon, LockIcon, RepeatIcon, TrendingUpIcon, UserCogIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { GroupLogo } from '../components/ui/GroupLogo';
import { TextField } from '../components/ui/TextField';

const REMEMBER_KEY = 'lingo-billing:remembered-email';

const features = [
{ icon: FileTextIcon, title: 'Invoices & quotations', text: 'Branded documents in seconds, exported as PDF.' },
{ icon: TrendingUpIcon, title: 'Income at a glance', text: 'Income for each company, payments to receive and maintenance.' },
{ icon: RepeatIcon, title: 'Maintenance tracking', text: 'Recurring client charges with reminders before they fall due.' },
{ icon: UserCogIcon, title: 'Team payouts', text: 'Each member’s portion and payouts for Lingo Startup.' }];


const ease = [0.23, 1, 0.32, 1] as const;

export function Login() {
  const { user, signIn, mode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/';

  const remembered = (() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) ?? '';
    } catch {
      return '';
    }
  })();
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // Only the email is remembered — never the password.
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email.trim().toLowerCase());else
        localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* storage unavailable */
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full bg-white lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#070B24] via-[#0B1030] to-[#1B1F5E] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.div
            className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#0546A9] opacity-60 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
          
          <motion.div
            className="absolute -bottom-32 right-0 h-[30rem] w-[30rem] rounded-full bg-[#C76BE6] opacity-40 blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
          
          <motion.div
            className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-[#5B5BCB] opacity-40 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
          
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          
        </div>

        <div className="relative">
          <span className="inline-block rounded-xl bg-white px-4 py-3">
            <GroupLogo width={150} />
          </span>
        </div>

        <div className="relative max-w-xl">
          <motion.h2
            className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}>
            
            Run the money side of your business,{' '}
            <span className="bg-gradient-to-r from-[#7FB0FF] to-[#E9A6FF] bg-clip-text text-transparent">without the spreadsheets.</span>
          </motion.h2>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {features.map((f, i) =>
            <motion.li
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.08 }}>
              
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#C76BE6]">
                  <f.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">{f.text}</p>
              </motion.li>
            )}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-white/60">
          <BellRingIcon className="h-4 w-4" aria-hidden />
          Get reminded before maintenance payments are due.
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col bg-gradient-to-br from-white via-indigo-50/60 to-fuchsia-50/50">
        <div className="h-1.5 w-full bg-lingo lg:hidden" />
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-sm rounded-3xl border border-white bg-white/80 p-8 shadow-xl shadow-indigo-200/50 backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}>
            
            <div className="lg:hidden"><GroupLogo width={132} /></div>
            <h1 className="mt-8 bg-gradient-to-r from-[#0546A9] to-[#9B5BD9] bg-clip-text text-3xl font-semibold tracking-tight text-transparent lg:mt-0">Welcome back</h1>
            <p className="mt-1.5 text-sm text-ink-muted">Sign in to Lingo Billing to manage invoices, clients and your team.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {error &&
              <div role="alert" className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </div>
              }
              <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus={!remembered} />
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-ink-soft">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus={Boolean(remembered)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 pr-10 text-sm text-ink transition-colors duration-150 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-1 inline-flex w-9 items-center justify-center text-ink-muted hover:text-ink">
                    
                    {showPassword ? <EyeOffIcon className="h-4 w-4" aria-hidden /> : <EyeIcon className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-line-strong accent-[#0B4FB3]" />
                Remember my email on this device
              </label>
              <Button type="submit" variant="brand" loading={loading} className="w-full" icon={LockIcon}>
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-ink-muted">
              {mode === 'supabase' ?
              'Secure sign-in. Your data is stored in your private Supabase database, so it is the same on every device.' :
              'Prototype mode (Supabase is not configured): any email with a password of 6+ characters opens a session in this tab, and data stays in this browser only.'}
            </p>
            <p className="mt-8 text-xs text-ink-faint">© {new Date().getFullYear()} Lingo Groups (Pvt) Ltd</p>
          </motion.div>
        </div>
      </main>
    </div>);

}
