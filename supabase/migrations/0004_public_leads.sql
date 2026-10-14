-- Public site forms, owned exclusively by MIMT (NOT the shared TAKATAK identity database).
-- No unauthenticated database access: only the private API connection may insert or review.
-- marketing_opt_in_requested is NOT a verified marketing subscription.
create table if not exists public_leads (
  id uuid primary key default gen_random_uuid(),
  form_kind text not null check (form_kind in ('waitlist', 'demo', 'contact')),
  locale text not null check (locale in ('fr-CA', 'en-CA')),
  email text not null check (char_length(email) between 3 and 254),
  fields jsonb not null check (jsonb_typeof(fields) = 'object'),
  marketing_opt_in_requested boolean not null default false,
  marketing_text text not null default '',
  source_path text not null check (char_length(source_path) between 1 and 200),
  created_at timestamptz not null default now()
);
create index if not exists public_leads_created_idx on public_leads(created_at desc);
create index if not exists public_leads_email_idx on public_leads(email);
alter table public_leads enable row level security;
revoke all on public_leads from anon, authenticated;
