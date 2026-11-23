-- Sugar Saathi cloud sync. Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run again: every statement is "if not exists" or "create or replace".
--
-- Access model: the browser never talks to the database. Only our server does, using the secret (service-role) key,
-- after it has checked the signed Google login. Row level security is switched ON with NO policies, so the public
-- anon key (and anyone else) can read and write nothing here.

create table if not exists public.profiles (
  user_id          text primary key,              -- Google account id
  email            text not null,
  trial_started_at timestamptz not null default now(),  -- set by the database at first sign-in, so it cannot be restarted
  pro_until        timestamptz,                   -- empty for now; a future payment or manual grant sets it
  created_at       timestamptz not null default now()
);

create table if not exists public.user_data (
  user_id    text primary key references public.profiles (user_id) on delete cascade,
  data       jsonb not null,                      -- the user's meals, readings, goals, routine and recipes
  rev        bigint not null default 1,           -- bumped on every save; used to detect two devices saving at once
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  user_id text not null,
  day     date not null,
  kind    text not null,
  count   integer not null default 0,
  primary key (user_id, day, kind)
);

alter table public.profiles  enable row level security;
alter table public.user_data enable row level security;
alter table public.ai_usage  enable row level security;
-- (no policies on purpose)

-- Newer Supabase projects do not give the server key access to new tables automatically, so grant it here.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.profiles, public.user_data, public.ai_usage to service_role;
revoke all on public.profiles, public.user_data, public.ai_usage from anon, authenticated;

-- Adds one to today's (UTC) count for a user and kind, and returns the new count. Atomic, so two requests never lose a count.
create or replace function public.bump_ai_usage(p_user text, p_kind text)
returns integer
language sql
security invoker
set search_path = ''
as $$
  insert into public.ai_usage (user_id, day, kind, count)
  values (p_user, (now() at time zone 'utc')::date, p_kind, 1)
  on conflict (user_id, day, kind) do update set count = public.ai_usage.count + 1
  returning count;
$$;

-- Saves the user's data only if nobody saved since this device last read it. Returns the new rev, or null on a clash.
create or replace function public.save_user_data(p_user text, p_data jsonb, p_expected_rev bigint)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_rev bigint;
begin
  if p_expected_rev = 0 then
    insert into public.user_data (user_id, data, rev) values (p_user, p_data, 1)
    on conflict (user_id) do nothing
    returning rev into new_rev;
    return new_rev;                                -- null if a row already existed
  end if;
  update public.user_data
     set data = p_data, rev = rev + 1, updated_at = now()
   where user_id = p_user and rev = p_expected_rev
  returning rev into new_rev;
  return new_rev;                                  -- null if the rev moved on
end;
$$;

-- Only the secret key may call these.
revoke all on function public.bump_ai_usage(text, text) from public, anon, authenticated;
revoke all on function public.save_user_data(text, jsonb, bigint) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(text, text) to service_role;
grant execute on function public.save_user_data(text, jsonb, bigint) to service_role;
