-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table public.users (
  id uuid not null default uuid_generate_v4(),
  auth_id uuid references auth.users (id) on delete cascade,
  email text,
  username text not null,
  created_at timestamp with time zone not null default now(),
  is_admin boolean default false,
  allowed_legacy_squat boolean default false,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username),
  constraint users_auth_id_key unique (auth_id)
);

-- Checkins Table
create table public.checkins (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null,
  date date not null,
  challenge_type text not null default 'plank',
  created_at timestamp with time zone not null default now(),
  constraint checkins_pkey primary key (id),
  constraint checkins_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint checkins_user_date_type_unique unique (user_id, date, challenge_type)
);

-- Challenge Settings Table
create table public.challenge_settings (
  key text not null,
  value text not null,
  constraint challenge_settings_pkey primary key (key)
);

-- Row Level Security (RLS)
-- With external auth enabled, we map authenticated users to their public records.

alter table public.users enable row level security;
alter table public.checkins enable row level security;
alter table public.challenge_settings enable row level security;

-- Policies
create policy "Users can read all users" on public.users for select using (true);
create policy "Users can update their own record" on public.users for update using (auth.uid() = auth_id);

create policy "Users can read all checkins" on public.checkins for select using (true);
create policy "Users can insert own checkins" on public.checkins for insert with check (
  auth.uid() = (select auth_id from public.users where id = user_id limit 1)
);
create policy "Users can delete own checkins" on public.checkins for delete using (
  auth.uid() = (select auth_id from public.users where id = user_id limit 1)
);

create policy "Allow public read settings" on public.challenge_settings for select using (true);
-- Only admin should write settings, but we can seed initially.

-- Seed initial start date
insert into public.challenge_settings (key, value) values ('start_date', '2026-01-31') on conflict do nothing;
