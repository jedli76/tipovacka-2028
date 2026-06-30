create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.news enable row level security;

create policy "anyone can read published news" on public.news
  for select using (published = true);

create policy "admin manage news" on public.news
  for all to authenticated
  using (auth.email() = 'romanjedlicka@gmail.com')
  with check (auth.email() = 'romanjedlicka@gmail.com');
