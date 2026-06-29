-- Admin (romanjedlicka@gmail.com) může číst všechny tipy pro CSV export
create policy "admin read all tips"
  on public.tips for select
  to authenticated
  using (auth.email() = 'romanjedlicka@gmail.com');

-- Stejně pro profiles a matches (join v exportu)
create policy "admin read all bonus_tips"
  on public.bonus_tips for select
  to authenticated
  using (auth.email() = 'romanjedlicka@gmail.com');

create policy "admin read all tournament_tips"
  on public.tournament_tips for select
  to authenticated
  using (auth.email() = 'romanjedlicka@gmail.com');
