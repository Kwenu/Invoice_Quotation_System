##Lingo Invoice / Quotation Automation System that Developed by Lingo Startup Company

#This help to generate a Invoice or an Quotation within 5 to 10 seconds without getting delayed to do that manually. It brings customer satisfaction and love to work with us.
## v3 additions

- **Dashboard → Income summary**: income received (invoice payments + maintenance), billed, payments to receive, maintenance expected, team payouts and net, for this month / last month / this year / all time / any month. Includes a 6-month trend and a "coming up" list.
- **Maintenance** (`/maintenance`): recurring plans per client (monthly / quarterly / yearly). "Collect" records the payment and moves the next due date forward.
- **Team** (`/team`): active, planned and former members; per-project portions (percentage or fixed, linked to an invoice or manual); payouts; share of company income.
- **Reminders**: bell icon with due/overdue maintenance and invoices; optional desktop alerts while the app is open. Alerts while the app is closed need a server (email/push) — add with Supabase Edge Functions + a scheduled job.
- **Login**: new split-screen design, show/hide password, "remember my email" (the password is never stored).
- Existing browser backups still load; new sections start empty.
- `data/supabaseSchema.ts` now also contains tables for team, payouts, maintenance plans and collections.

## v4 — Supabase storage
The app now stores all data in Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (see `SUPABASE_SETUP.md`).
Without them it falls back to browser-only prototype storage. Schema: `supabase/schema.sql`.
