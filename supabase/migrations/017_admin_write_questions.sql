-- Admin může plně spravovat otázky
create policy "admin manage tournament_questions"
  on public.tournament_questions for all
  to authenticated
  using (auth.email() = 'romanjedlicka@gmail.com')
  with check (auth.email() = 'romanjedlicka@gmail.com');

create policy "admin manage bonus_questions"
  on public.bonus_questions for all
  to authenticated
  using (auth.email() = 'romanjedlicka@gmail.com')
  with check (auth.email() = 'romanjedlicka@gmail.com');
