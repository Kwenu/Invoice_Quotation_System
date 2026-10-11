# Connecting Lingo Billing to Supabase

Once connected, **everything you enter is stored in your own Supabase (Postgres) database**: customers, invoices and
quotations, payments received and pending, maintenance plans and their collections, team members, their portions and
payouts, and your settings (company details, bank details, numbering, signature). Settings load automatically at every
login, so you set them once.

## 1 · Create the project
1. Sign up at <https://supabase.com> → **New project**.
2. Pick a region close to you (e.g. Singapore) and save the database password somewhere safe.

## 2 · Create the tables
1. In the project open **SQL Editor → New query**.
2. Paste the whole of `supabase/schema.sql` (the same SQL is shown in the app under Settings → Database schema) and press **Run**.
   It is safe to run again later.

## 3 · Put the keys in the app
1. In Supabase open **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
2. In the project folder copy `.env.example` to **`.env.local`** and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   Never use the `service_role` key in the app, and never commit `.env.local`.
3. Restart `npm run dev` (Vite only reads the file at start-up).

## 4 · Create your login
1. **Authentication → Users → Add user → Create new user**. Enter your email and a strong password; tick *Auto Confirm User*.
2. Back in the SQL Editor run (with your email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
   Only users listed in `admins` can read or write data — even if someone found your anon key.
3. **Authentication → Sign In / Providers → Email**: switch **off** “Allow new users to sign up”, so nobody else can create accounts.

## 5 · Run it
```
npm install
npm run dev
```
Sign in with the user from step 4. The sidebar shows **Saved to cloud** once data is syncing.

Already entered data while testing? Open **Settings → Data → Upload data saved in this browser** once. The built-in
sample records are skipped; anything already in the database is kept.

## How it works
- On login the app loads all tables into memory (fast, works like before).
- Every change is saved to the database a moment later. Only the rows that changed are written (not the whole file), so
  two devices do not overwrite each other’s unrelated work.
- If the connection drops, the app keeps your changes, shows **Not saved to cloud**, and retries automatically (or press *Retry now*).
  The browser warns you if you try to close the tab with unsaved changes.
- Logins use Supabase Auth; the session is kept on the device until you press **Sign out**.
- Changes made on another device appear after you refresh the page.

| What you enter | Table(s) |
| --- | --- |
| Customers | `clients` |
| Invoices & quotations (line items, totals) | `documents` (`total_amount`, `paid_amount`, `balance_amount` are readable columns) |
| Payments received / pending | `payments` (pending = `balance_amount` on the invoice) |
| Document audit trail | `document_history` |
| Maintenance plans / collections | `retainers`, `retainer_collections` |
| Team members | `team_members` |
| Team portions / payouts | `team_assignments`, `team_payouts` |
| Settings | `app_settings` (one row) |
| Who may log in | `admins` |

## Hosting later (domain)
- Deploy the built app (`npm run build`) to Vercel, Netlify or Cloudflare Pages and add the **same two variables**
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host’s environment settings, then redeploy (Vite bakes them in at build time).
- Serve the app over HTTPS (all of those hosts do), and add a rewrite so every path serves `index.html` (the app uses client-side routes).
- In Supabase **Authentication → URL Configuration** set *Site URL* to your domain.

## Good to know
- Free Supabase projects are paused after about a week without activity (you can restart them from the dashboard), and the free plan has no
  point-in-time recovery. Use **Settings → Export backup (JSON)** regularly, or upgrade the plan once the data matters.
- Document numbers are allocated by the app from the numbering settings. That is safe for one person using the app at a time;
  if several people will create documents at the same moment, move numbering into a database function.
- Alerts while the browser is closed (email/WhatsApp) need a server job — Supabase Edge Functions with a daily schedule can do this later.
