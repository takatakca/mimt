-- Device push tokens for message notifications (POST /v1/push/register).
-- Native APNs (ios) / FCM (android) tokens; VoIP push for calls is handled by Twilio, not stored here.
-- A token identifies one app install, so it belongs to at most one user: re-registering moves it.

create table push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  platform    text not null check (platform in ('ios', 'android')),
  kind        text not null default 'messages' check (kind in ('messages')),
  token       text not null unique check (char_length(token) between 1 and 4096),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index push_tokens_user_idx on push_tokens(user_id);

create trigger push_tokens_updated_at before update on push_tokens for each row execute function set_updated_at();

-- Same model as 0001: RLS on, nothing for anon, authenticated users may only read their own rows.
-- Writes go through the API (service role).
alter table push_tokens enable row level security;
revoke all on push_tokens from anon;
create policy push_tokens_self_read on push_tokens for select to authenticated using (user_id = mimt_current_user_id());
