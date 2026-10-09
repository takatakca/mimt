-- MIMT initial schema (docs/MIMT-MVP.md §5).
-- The API connects with the service role and bypasses RLS. RLS is enabled on every table so the
-- anon key can read nothing; authenticated Supabase users (if the app ever reads directly) only see
-- their own rows through users.auth_user_id = auth.uid().

create extension if not exists pgcrypto;

-- users ---------------------------------------------------------------------------------------
create table users (
  id                    uuid primary key default gen_random_uuid(),
  global_user_id        text unique,
  auth_user_id          uuid unique,
  locale                text not null default 'fr-CA' check (locale in ('fr-CA', 'en-CA')),
  display_name          text,
  email                 text,
  phone_e164            text unique check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  phone_verified_at     timestamptz,
  device_verified_at    timestamptz,
  status                text not null default 'active' check (status in ('active', 'suspended', 'pending_deletion', 'deleted')),
  deletion_scheduled_at timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  family_id   uuid not null,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index refresh_tokens_user_idx on refresh_tokens(user_id);
create index refresh_tokens_family_idx on refresh_tokens(family_id);

-- accounts, plans, entitlements ---------------------------------------------------------------
create table telecom_accounts (
  id                     uuid primary key default gen_random_uuid(),
  owner_user_id          uuid not null references users(id) on delete restrict,
  workspace_id           text,
  business_id            text,
  kind                   text not null default 'consumer' check (kind in ('consumer', 'business')),
  status                 text not null default 'ACTIVE_INDEPENDENT'
                           check (status in ('ACTIVE_MANAGED', 'ACTIVE_INDEPENDENT', 'OUTBOUND_SUSPENDED', 'SUSPENDED', 'CLOSED')),
  risk_tier              text not null default 'new' check (risk_tier in ('new', 'standard', 'trusted', 'high')),
  twilio_subaccount_sid  text,
  stripe_customer_id     text unique,
  intl_credit_cents      integer not null default 0 check (intl_credit_cents >= 0),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create unique index telecom_accounts_owner_consumer_idx on telecom_accounts(owner_user_id) where kind = 'consumer';
create index telecom_accounts_business_idx on telecom_accounts(business_id) where business_id is not null;

create table subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  telecom_account_id      uuid not null references telecom_accounts(id) on delete cascade,
  kind                    text not null check (kind in ('plan', 'addon')),
  code                    text not null,
  quantity                integer not null default 1 check (quantity > 0),
  stripe_subscription_id  text unique,
  status                  text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid')),
  source                  text not null check (source in ('stripe', 'iap_apple', 'iap_google', 'takatak', 'manual')),
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (kind <> 'plan' or code in ('free', 'lock', 'premium', 'business', 'business_pro'))
);
create index subscriptions_account_idx on subscriptions(telecom_account_id);

create table entitlements (
  telecom_account_id  uuid not null references telecom_accounts(id) on delete cascade,
  feature             text not null,
  "limit"             integer,
  source              text not null,
  primary key (telecom_account_id, feature, source)
);

-- numbers and 9-1-1 -----------------------------------------------------------------------------
create table phone_numbers (
  id                  uuid primary key default gen_random_uuid(),
  e164                text not null unique check (e164 ~ '^\+1[2-9][0-9]{2}[2-9][0-9]{6}$'),
  twilio_sid          text unique,
  telecom_account_id  uuid references telecom_accounts(id) on delete set null,
  kind                text not null default 'local' check (kind in ('local', 'toll_free')),
  state               text not null check (state in ('active', 'locked', 'grace', 'quarantine', 'released', 'porting_in', 'porting_out')),
  last_activity_at    timestamptz not null default now(),
  state_changed_at    timestamptz not null default now(),
  quarantine_until    timestamptz,
  warnings_sent       integer[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index phone_numbers_account_idx on phone_numbers(telecom_account_id);
create index phone_numbers_state_idx on phone_numbers(state) where state in ('active', 'grace', 'quarantine');

create table e911_addresses (
  id                  uuid primary key default gen_random_uuid(),
  telecom_account_id  uuid not null unique references telecom_accounts(id) on delete cascade,
  phone_number_id     uuid references phone_numbers(id) on delete set null,
  customer_name       text not null,
  street              text not null,
  unit                text,
  city                text not null,
  province            text not null check (province in ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')),
  postal_code         text not null check (postal_code ~ '^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]$'),
  country             text not null default 'CA' check (country = 'CA'),
  validated_at        timestamptz,
  provider_ref        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table e911_acknowledgements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  notice_version  text not null,
  accepted_at     timestamptz not null default now(),
  ip              text,
  app_version     text,
  user_agent      text
);
create index e911_ack_user_idx on e911_acknowledgements(user_id, accepted_at desc);

-- calls, messages, voicemail --------------------------------------------------------------------
create table calls (
  id                  uuid primary key default gen_random_uuid(),
  twilio_call_sid     text not null unique,
  telecom_account_id  uuid references telecom_accounts(id) on delete set null,
  user_id             uuid references users(id) on delete set null,
  direction           text not null check (direction in ('inbound', 'outbound')),
  kind                text not null check (kind in ('pstn', 'app', 'emergency')),
  from_number         text not null,
  to_number           text not null,
  status              text not null,
  started_at          timestamptz not null default now(),
  ended_at            timestamptz,
  duration_s          integer,
  price               numeric(12, 5),
  price_unit          text,
  rated_cad           numeric(12, 5),
  usage_applied       boolean not null default false
);
create index calls_account_idx on calls(telecom_account_id, started_at desc);
create index calls_active_idx on calls(telecom_account_id) where status in ('queued', 'initiated', 'ringing', 'in-progress');

create table messages (
  id                  uuid primary key default gen_random_uuid(),
  twilio_sid          text unique,
  telecom_account_id  uuid not null references telecom_accounts(id) on delete cascade,
  direction           text not null check (direction in ('inbound', 'outbound')),
  our_number          text not null,
  peer                text not null,
  body_encrypted      text not null,
  body_fingerprint    text not null,
  status              text not null,
  segments            integer not null default 1,
  num_media           integer not null default 0,
  price               numeric(12, 5),
  price_unit          text,
  error_code          text,
  -- Millisecond precision so (created_at, id) cursors round-trip through JS Dates exactly.
  created_at          timestamptz not null default date_trunc('milliseconds', now())
);
create index messages_thread_idx on messages(telecom_account_id, peer, created_at desc, id desc);
create index messages_outbound_idx on messages(telecom_account_id, created_at desc) where direction = 'outbound';
create index messages_fingerprint_idx on messages(telecom_account_id, body_fingerprint, created_at desc);
create index messages_our_number_idx on messages(our_number);

create table voicemails (
  id                  uuid primary key default gen_random_uuid(),
  telecom_account_id  uuid not null references telecom_accounts(id) on delete cascade,
  phone_number_id     uuid not null references phone_numbers(id) on delete cascade,
  call_sid            text not null,
  recording_sid       text not null unique,
  from_number         text,
  audio_url           text,
  audio_path          text,
  duration_s          integer,
  transcript          text,
  transcript_lang     text,
  listened_at         timestamptz,
  created_at          timestamptz not null default now()
);
create index voicemails_account_idx on voicemails(telecom_account_id, created_at desc);

-- consent, usage, fraud -------------------------------------------------------------------------
create table consents (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references users(id) on delete cascade,
  kind      text not null check (kind in ('casl_marketing', 'ads_personalised', 'call_recording_notice', 'privacy_policy', 'terms')),
  granted   boolean not null,
  version   text not null,
  source    text not null,
  ip        text,
  at        timestamptz not null default now()
);
create index consents_user_idx on consents(user_id, kind, at desc);

create table usage_ledger (
  telecom_account_id  uuid not null references telecom_accounts(id) on delete cascade,
  period              text not null check (period ~ '^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$'),
  minutes_out         integer not null default 0,
  minutes_in          integer not null default 0,
  sms_out             integer not null default 0,
  bonus_minutes_out   integer not null default 0,
  spend_cad           numeric(12, 5) not null default 0,
  intl_spend_cad      numeric(12, 5) not null default 0,
  updated_at          timestamptz not null default now(),
  primary key (telecom_account_id, period)
);

create table fraud_events (
  id                  uuid primary key default gen_random_uuid(),
  telecom_account_id  uuid references telecom_accounts(id) on delete set null,
  rule                text not null,
  score               integer not null default 0,
  action              text not null check (action in ('block', 'hold', 'suspend', 'alert')),
  details             jsonb not null default '{}',
  at                  timestamptz not null default now()
);
create index fraud_events_account_idx on fraud_events(telecom_account_id, at desc);

-- TAKATAK handoff, replay protection, opt-outs, outbox, audit -------------------------------------
create table handoffs (
  id                  uuid primary key default gen_random_uuid(),
  token_hash          text not null unique,
  global_user_id      text not null,
  workspace_id        text not null,
  business_id         text,
  plan_hint           text check (plan_hint is null or plan_hint in ('free', 'lock', 'premium', 'business', 'business_pro')),
  locale              text not null check (locale in ('fr-CA', 'en-CA')),
  jti                 text not null unique,
  expires_at          timestamptz not null,
  claimed_at          timestamptz,
  claimed_by_user_id  uuid references users(id) on delete set null,
  created_at          timestamptz not null default now()
);

create table used_once_keys (
  key         text primary key,
  expires_at  timestamptz not null
);
create index used_once_keys_expiry_idx on used_once_keys(expires_at);

create table sms_opt_outs (
  our_number  text not null,
  peer        text not null,
  opted_out   boolean not null,
  updated_at  timestamptz not null default now(),
  primary key (our_number, peer)
);

create table takatak_outbox (
  id               uuid primary key default gen_random_uuid(),
  event_type       text not null check (event_type in ('entitlement.updated', 'telecom_account.status_changed', 'phone_number.assigned')),
  payload          jsonb not null,
  attempts         integer not null default 0,
  next_attempt_at  timestamptz default now(),
  delivered_at     timestamptz,
  last_error       text,
  created_at       timestamptz not null default now()
);
create index takatak_outbox_due_idx on takatak_outbox(next_attempt_at) where delivered_at is null;

create table audit_log (
  id             uuid primary key default gen_random_uuid(),
  actor_user_id  uuid references users(id) on delete set null,
  action         text not null,
  target_type    text,
  target_id      text,
  ip             text,
  meta           jsonb not null default '{}',
  at             timestamptz not null default now()
);
create index audit_log_actor_idx on audit_log(actor_user_id, at desc);

-- updated_at triggers -----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['users', 'telecom_accounts', 'subscriptions', 'phone_numbers', 'e911_addresses', 'usage_ledger'] loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- Row level security ------------------------------------------------------------------------------
-- Maps the Supabase auth user to a MIMT user id. security definer so policies can read users.
create or replace function mimt_current_user_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from users where auth_user_id = auth.uid()
$$;

create or replace function mimt_owns_account(account_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from telecom_accounts a where a.id = account_id and a.owner_user_id = mimt_current_user_id())
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'users', 'refresh_tokens', 'telecom_accounts', 'subscriptions', 'entitlements', 'phone_numbers', 'e911_addresses',
    'e911_acknowledgements', 'calls', 'messages', 'voicemails', 'consents', 'usage_ledger', 'fraud_events', 'handoffs',
    'used_once_keys', 'sms_opt_outs', 'takatak_outbox', 'audit_log'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on %I from anon', t);
  end loop;
end $$;

-- Read-only own-row policies for authenticated users. Writes go through the API (service role).
-- Tables with no policy (refresh_tokens, fraud_events, handoffs, used_once_keys, sms_opt_outs,
-- takatak_outbox, audit_log) are deny-all for anon and authenticated.
create policy users_self_read on users for select to authenticated using (auth_user_id = auth.uid());
create policy accounts_owner_read on telecom_accounts for select to authenticated using (owner_user_id = mimt_current_user_id());
create policy subscriptions_owner_read on subscriptions for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy entitlements_owner_read on entitlements for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy numbers_owner_read on phone_numbers for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy e911_owner_read on e911_addresses for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy e911_ack_self_read on e911_acknowledgements for select to authenticated using (user_id = mimt_current_user_id());
create policy calls_owner_read on calls for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy messages_owner_read on messages for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy voicemails_owner_read on voicemails for select to authenticated using (mimt_owns_account(telecom_account_id));
create policy consents_self_read on consents for select to authenticated using (user_id = mimt_current_user_id());
create policy usage_owner_read on usage_ledger for select to authenticated using (mimt_owns_account(telecom_account_id));

revoke execute on function mimt_current_user_id() from public, anon;
revoke execute on function mimt_owns_account(uuid) from public, anon;
grant execute on function mimt_current_user_id() to authenticated;
grant execute on function mimt_owns_account(uuid) to authenticated;
