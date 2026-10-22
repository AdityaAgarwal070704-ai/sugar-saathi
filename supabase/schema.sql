-- Sugar Saathi database. Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Every table is locked with row-level security: a signed-in user can only see and change their own rows.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  meal_carb_target int not null default 60 check (meal_carb_target between 10 and 200),
  glucose_low int not null default 70 check (glucose_low between 40 and 120),
  glucose_high int not null default 180 check (glucose_high between 100 and 300),
  diet text not null default 'veg' check (diet in ('veg', 'nonveg', 'egg')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eaten_at timestamptz not null default now(),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  text text not null check (char_length(text) <= 300),
  items jsonb not null default '[]'::jsonb,
  carbs int not null default 0,
  fibre numeric not null default 0,
  protein numeric not null default 0,
  gl int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists meals_user_time on public.meals (user_id, eaten_at desc);

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  measured_at timestamptz not null,
  value int not null check (value between 40 and 600),
  source text not null default 'manual' check (source in ('manual', 'csv')),
  created_at timestamptz not null default now(),
  unique (user_id, measured_at, value)
);
create index if not exists readings_user_time on public.readings (user_id, measured_at desc);

create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time on public.ai_usage (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.readings enable row level security;
alter table public.ai_usage enable row level security;

create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);
create policy "meals: all own" on public.meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "readings: all own" on public.readings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_usage: read own" on public.ai_usage for select using (auth.uid() = user_id);
create policy "ai_usage: insert own" on public.ai_usage for insert with check (auth.uid() = user_id);

-- Users may edit their goals, but never their own plan or billing id (only the server can).
revoke update on public.profiles from authenticated;
grant update (display_name, meal_carb_target, glucose_low, glucose_high, diet) on public.profiles to authenticated;

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
