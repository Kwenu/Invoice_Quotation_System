// Generated from supabase/schema.sql — edit that file, then re-run the copy step (see SUPABASE_SETUP.md).
export const supabaseSchemaSql = `-- ════════════════════════════════════════════════════════════════════════════
-- Lingo Billing · Supabase schema
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is "if not exists" / "or replace" / drop-then-create.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Who may use the app ─────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- security definer: lets the policies below ask "is this user an admin?" without being blocked by RLS themselves
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── Settings (one row: company, bank details, numbering, templates, signature) ──
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Customers ───────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id text primary key,
  name text not null,
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Invoices & quotations ───────────────────────────────────────────────────
create table if not exists public.documents (
  id text primary key,
  type text not null check (type in ('invoice','quotation')),
  division text not null,
  template_id text not null,
  number text not null unique,
  status text not null default 'draft',
  issue_date date,
  due_date date,
  valid_until date,
  client_id text references public.clients(id) on delete set null,
  client_name text not null default '',
  client jsonb not null,                 -- snapshot of the client as printed on the document
  project_name text not null default '',
  project_description text not null default '',
  groups jsonb not null,                 -- line items
  adjustments jsonb not null,            -- discount, tax, extra charges
  payment_details jsonb,
  payment_instructions text not null default '',
  notes text not null default '',
  terms text not null default '',
  representative jsonb,
  company_line text not null default '',
  display jsonb,
  source_quotation_id text,
  converted_invoice_id text,
  archived boolean not null default false,
  -- readable money columns for reports (the app recalculates them from the line items on every save)
  total_amount numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  balance_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_client_idx on public.documents (client_id);
create index if not exists documents_issue_idx on public.documents (issue_date);

-- ── Payments received against invoices ──────────────────────────────────────
create table if not exists public.payments (
  id text primary key,
  document_id text not null references public.documents(id) on delete cascade,
  payment_date date not null,
  amount numeric(14,2) not null,
  method text not null default '',
  reference text not null default '',
  note text not null default '',
  show_on_document boolean not null default false,
  recorded_at timestamptz not null default now()
);
create index if not exists payments_document_idx on public.payments (document_id);
create index if not exists payments_date_idx on public.payments (payment_date);

-- ── Audit trail (append-only) ───────────────────────────────────────────────
create table if not exists public.document_history (
  id text primary key,
  document_id text not null references public.documents(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  action text not null,
  detail text not null default ''
);
create index if not exists history_document_idx on public.document_history (document_id);

-- ── Team ────────────────────────────────────────────────────────────────────
create table if not exists public.team_members (
  id text primary key,
  name text not null,
  role text not null default '',
  email text not null default '',
  phone text not null default '',
  status text not null default 'active' check (status in ('active','planned','former')),
  start_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_assignments (
  id text primary key,
  member_id text not null references public.team_members(id) on delete cascade,
  document_id text references public.documents(id) on delete set null,
  label text not null,
  base_amount numeric(14,2) not null default 0,
  mode text not null check (mode in ('percent','fixed')),
  value numeric(14,2) not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists assignments_member_idx on public.team_assignments (member_id);

create table if not exists public.team_payouts (
  id text primary key,
  member_id text not null references public.team_members(id) on delete cascade,
  paid_on date not null,
  amount numeric(14,2) not null,
  method text not null default '',
  note text not null default '',
  recorded_at timestamptz not null default now()
);
create index if not exists payouts_member_idx on public.team_payouts (member_id);

-- ── Maintenance plans ───────────────────────────────────────────────────────
create table if not exists public.retainers (
  id text primary key,
  client_id text references public.clients(id) on delete set null,
  client_name text not null,
  title text not null,
  category text not null default '',
  amount numeric(14,2) not null,
  frequency text not null check (frequency in ('monthly','quarterly','yearly')),
  start_date date,
  next_due_date date not null,
  remind_days_before int not null default 7,
  status text not null default 'active' check (status in ('active','paused','ended')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists retainers_due_idx on public.retainers (next_due_date);

create table if not exists public.retainer_collections (
  id text primary key,
  retainer_id text not null references public.retainers(id) on delete cascade,
  due_date date not null,
  amount numeric(14,2) not null,
  received_on date not null,
  method text not null default '',
  note text not null default '',
  recorded_at timestamptz not null default now()
);
create index if not exists collections_retainer_idx on public.retainer_collections (retainer_id);

-- ── Row Level Security: only administrators can touch anything ──────────────
alter table public.admins               enable row level security;
alter table public.app_settings         enable row level security;
alter table public.clients              enable row level security;
alter table public.documents            enable row level security;
alter table public.payments             enable row level security;
alter table public.document_history     enable row level security;
alter table public.team_members         enable row level security;
alter table public.team_assignments     enable row level security;
alter table public.team_payouts         enable row level security;
alter table public.retainers            enable row level security;
alter table public.retainer_collections enable row level security;

-- a signed-in user may only see their own admin row (the app uses this to check access)
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['app_settings','clients','payments','team_members','team_assignments','team_payouts','retainers','retainer_collections']
  loop
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- invoices/quotations can be deleted from the app (cancel/archive keep a record instead). History is append-only; it is removed only together with its document.
drop policy if exists admin_rw on public.documents;
create policy admin_rw on public.documents for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_rw on public.document_history;
create policy admin_rw on public.document_history for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant delete on public.documents to authenticated;
revoke update, delete on public.document_history from authenticated;

-- the public (anon) key must never reach any table
revoke all on all tables in schema public from anon;

-- ── After running this, create your login (see SUPABASE_SETUP.md, step 4) and run: ──
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL@example.com';
`;
