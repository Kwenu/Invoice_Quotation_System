export const supabaseSchemaSql = `-- Lingo Billing · Supabase schema
-- Run in the Supabase SQL editor, then implement DataRepository (utils/repository.ts) with @supabase/supabase-js.
-- Only the public anon key belongs in the frontend (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY on Vercel).

create table public.admins (user_id uuid primary key references auth.users(id));

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null, company text, email text, phone text, address text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.number_sequences (
  key text primary key,                 -- startup-invoice | assignment-invoice | startup-quotation
  prefix text not null, separator text not null default '-',
  year_format text not null default 'YYYY', padding int not null default 4,
  next_number int not null default 1
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('invoice','quotation')),
  division text not null, template_id text not null,
  number text not null unique,
  status text not null default 'draft',
  issue_date date not null, due_date date, valid_until date,
  client_id uuid references public.clients(id),
  client_snapshot jsonb not null,
  project_name text, project_description text,
  groups jsonb not null, adjustments jsonb not null,
  payment_details jsonb, payment_instructions text, notes text, terms text,
  representative jsonb, company_line text, display jsonb,
  source_quotation_id uuid references public.documents(id),
  converted_invoice_id uuid references public.documents(id),
  archived boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  paid_on date not null, method text, reference text, note text,
  show_on_document boolean not null default false,
  recorded_by uuid default auth.uid(), recorded_at timestamptz default now()
);

create table public.document_history (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete restrict,
  action text not null, detail text,
  actor uuid default auth.uid(), at timestamptz default now()
);

create table public.app_settings (id int primary key default 1 check (id = 1), data jsonb not null);

-- Atomic, duplicate-safe numbering (row lock serialises concurrent requests)
create or replace function public.allocate_document_number(seq_key text, issue date)
returns text language plpgsql security definer set search_path = public as $$
declare s public.number_sequences; candidate text; yr text;
begin
  select * into s from public.number_sequences where key = seq_key for update;
  loop
    yr := case s.year_format when 'YYYY' then to_char(issue,'YYYY') when 'YY' then to_char(issue,'YY') else null end;
    candidate := concat_ws(s.separator, nullif(s.prefix,''), yr, lpad(s.next_number::text, s.padding, '0'));
    s.next_number := s.next_number + 1;
    exit when not exists (select 1 from public.documents where number = candidate);
  end loop;
  update public.number_sequences set next_number = s.next_number where key = seq_key;
  return candidate;
end $$;

-- Row level security: authenticated administrators only
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.clients enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.document_history enable row level security;
alter table public.number_sequences enable row level security;
alter table public.app_settings enable row level security;

create policy admin_all on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_rw on public.documents for select, insert, update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_rw on public.payments for select, insert to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_rw on public.document_history for select, insert to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.number_sequences for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Issued financial documents are archived, never deleted
revoke delete on public.documents from authenticated;
revoke update, delete on public.document_history from authenticated;

-- ── Team, payouts and maintenance (added in v3) ───────────────────────────────
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
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

create table public.team_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  label text not null,
  base_amount numeric(14,2) not null default 0,
  mode text not null check (mode in ('percent','fixed')),
  value numeric(14,2) not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table public.team_payouts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members(id) on delete cascade,
  paid_on date not null,
  amount numeric(14,2) not null check (amount > 0),
  method text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table public.retainers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  title text not null,
  category text not null default '',
  amount numeric(14,2) not null check (amount > 0),
  frequency text not null check (frequency in ('monthly','quarterly','yearly')),
  start_date date not null,
  next_due_date date not null,
  remind_days_before int not null default 7,
  status text not null default 'active' check (status in ('active','paused','ended')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.retainer_collections (
  id uuid primary key default gen_random_uuid(),
  retainer_id uuid not null references public.retainers(id) on delete cascade,
  due_date date not null,
  amount numeric(14,2) not null check (amount > 0),
  received_on date not null,
  method text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;
alter table public.team_assignments enable row level security;
alter table public.team_payouts enable row level security;
alter table public.retainers enable row level security;
alter table public.retainer_collections enable row level security;

create policy admin_all on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.team_assignments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.team_payouts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.retainers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.retainer_collections for all to authenticated using (public.is_admin()) with check (public.is_admin());
`;
