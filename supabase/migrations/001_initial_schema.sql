-- Smazání starých tabulek (pokud existují) a vytvoření nanovo
drop table if exists public.leaderboard cascade;
drop table if exists public.tips cascade;
drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;

-- Profily hráčů (rozšíření auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profily jsou veřejné pro čtení"
  on public.profiles for select using (true);

create policy "Hráč může upravit vlastní profil"
  on public.profiles for update using (auth.uid() = id);

-- Automatické vytvoření profilu po registraci
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Zápasy
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  stage text not null default 'group',
  group_name text,
  home_score int,
  away_score int,
  created_at timestamptz default now()
);

alter table public.matches enable row level security;

create policy "Zápasy jsou veřejné pro čtení"
  on public.matches for select using (true);

-- Tipy hráčů
create table public.tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  home_score int not null,
  away_score int not null,
  is_joker boolean not null default false,
  points int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id)
);

alter table public.tips enable row level security;

create policy "Hráč vidí vlastní tipy"
  on public.tips for select using (auth.uid() = user_id);

create policy "Hráč může vložit vlastní tip"
  on public.tips for insert with check (auth.uid() = user_id);

create policy "Hráč může upravit tip před výkopem"
  on public.tips for update using (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and m.kickoff_at > now()
    )
  );

-- Žebříček
create table public.leaderboard (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  total_points int not null default 0,
  correct_results int not null default 0,
  tips_count int not null default 0,
  updated_at timestamptz default now()
);

alter table public.leaderboard enable row level security;

create policy "Žebříček je veřejný"
  on public.leaderboard for select using (true);
