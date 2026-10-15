-- SECURITY-03B: private shared rate limiter state for MIMT's API only.
-- Must be applied to the dedicated MIMT Postgres instance, never to TAKATAK.
-- Each bucket key is server-keyed HMAC-SHA256 hashed in the API; no phones, emails or user IDs here.
create table if not exists public.fraud_rate_buckets (
  key_hash text primary key check (key_hash ~ '^[a-f0-9]{64}$'),
  tokens double precision not null check (tokens >= 0 and tokens < 1000000000),
  updated_at timestamptz not null default now(),
  window_seconds double precision not null check (window_seconds > 0),
  last_seen_at timestamptz not null default now()
);
create index if not exists fraud_rate_buckets_expiry_idx on public.fraud_rate_buckets(last_seen_at);
alter table public.fraud_rate_buckets enable row level security;
revoke all on public.fraud_rate_buckets from public;
-- Supabase roles exist on managed projects; local vanilla Postgres may not have them.
do $mimt_roles$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.fraud_rate_buckets from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.fraud_rate_buckets from authenticated';
  end if;
end $mimt_roles$;
-- This is a server-side-only table. Never grant browser Data API access.
-- Operational cleanup (after checking that all buckets are fully refilled):
-- delete from public.fraud_rate_buckets
--   where last_seen_at + (window_seconds * interval '1 second') < clock_timestamp();
