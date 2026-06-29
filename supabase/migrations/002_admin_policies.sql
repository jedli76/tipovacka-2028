-- Admin může spravovat zápasy (INSERT, UPDATE, DELETE)
-- Ochrana je na úrovni aplikace (kontrola emailu v server action)

create policy "Admin může přidávat zápasy"
  on public.matches for insert
  with check (true);

create policy "Admin může upravovat zápasy"
  on public.matches for update
  using (true);

create policy "Admin může mazat zápasy"
  on public.matches for delete
  using (true);

-- Admin může upravovat žebříček
create policy "Admin může upravovat žebříček"
  on public.leaderboard for insert
  with check (true);

create policy "Admin může aktualizovat žebříček"
  on public.leaderboard for update
  using (true);

-- Admin může číst a upravovat všechny tipy (pro přepočet bodů)
create policy "Admin může aktualizovat body tipů"
  on public.tips for update
  using (true);
