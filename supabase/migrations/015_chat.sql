create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  content text not null check (char_length(content) > 0 and char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

create policy "Přihlášení uživatelé čtou zprávy" on public.messages
  for select to authenticated using (true);

create policy "Přihlášení uživatelé píší vlastní zprávy" on public.messages
  for insert to authenticated with check (auth.uid() = user_id);

grant select, insert on public.messages to authenticated;

-- Zapni realtime pro tabulku messages
alter publication supabase_realtime add table public.messages;
