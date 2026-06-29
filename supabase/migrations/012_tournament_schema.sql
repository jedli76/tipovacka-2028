-- Turnajové bonusy (velké bonusy + postupující ze skupin)
create table if not exists public.tournament_questions (
  id uuid primary key default gen_random_uuid(),
  col_index int unique not null,
  question text not null,
  category text not null, -- 'bonus' nebo 'group_advancement'
  correct_answer text,
  points_per_correct int not null default 10,
  sort_order int not null
);

create table if not exists public.tournament_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.tournament_questions(id) on delete cascade,
  answer text not null,
  points int not null default 0,
  unique(user_id, question_id)
);

alter table public.tournament_questions enable row level security;
alter table public.tournament_tips enable row level security;

create policy "read tournament_questions" on public.tournament_questions
  for select to anon, authenticated using (true);
create policy "read tournament_tips" on public.tournament_tips
  for select to anon, authenticated using (true);
create policy "manage own tournament_tips" on public.tournament_tips
  for all using (auth.uid() = user_id);

grant select on public.tournament_questions to anon, authenticated;
grant select on public.tournament_tips to anon, authenticated;

-- Otázky
insert into public.tournament_questions (id, col_index, question, category, points_per_correct, sort_order) values
  ('d13e25b2-0967-5f99-91ee-b911c08642ff', 249, 'Který tým bude kopat penaltu?', 'bonus', 15, 0),
  ('46bfc0ca-5ea8-bdab-da32-8bd1fb9c8162', 251, 'Proti komu bude nařízená penalta?', 'bonus', 15, 1),
  ('29cfec53-706e-5d1c-b4a3-305e845b9950', 253, 'Který tým dostane červenou kartu?', 'bonus', 15, 2),
  ('cdf02285-d2f7-3164-b423-50f05d0bc101', 255, 'Který tým vstřelí nejvíc gólů?', 'bonus', 15, 3),
  ('a025c86e-b6eb-3f4d-53db-f3d3d63abe16', 257, 'Ve které skupině padne nejvíc gólů?', 'bonus', 10, 4),
  ('1457a97b-d5b6-073b-125e-d24363f0db69', 259, 'Hráči kterého z těchto klubů nastřílí nejvíc gólů?', 'bonus', 10, 5),
  ('46520357-6106-e178-b6e3-98068820bd01', 261, 'Která dvojice týmů nasbírá nejvíc žlutých karet?', 'bonus', 10, 6),
  ('b98079bf-8825-4018-453a-11aac07e045b', 263, 'Která dvojice zemí dostane nejmíň gólů?', 'bonus', 10, 7),
  ('2c8016dc-780b-3bf3-0bbc-a7853d17afb8', 265, 'Která trojice hráčů vstřelí nejvíce gólů?', 'bonus', 10, 8),
  ('b9489e46-f976-d4a6-9e4d-d9caf65a7f6c', 267, 'Vyber si hráče a za každou jeho ŽK se ti odečte 10 bodů ?', 'bonus', 10, 9),
  ('aa65a99a-4b5e-93f6-fabb-4dcd38e79584', 269, 'Kolik minut dohromady odehrají Hugo Sochůrek a Neymar?', 'bonus', 10, 10),
  ('b5760491-53e0-d7fb-d865-cd6b1cca1456', 271, 'Kdo postoupí z prvních dvou míst ve skupině A?', 'group_advancement', 10, 11),
  ('e449fc7a-e852-d866-eab3-a657928ab373', 273, 'Kdo postoupí z prvních dvou míst ve skupině B?', 'group_advancement', 10, 12),
  ('2fda57fc-47ce-67a4-bf60-96d0136fe8cd', 275, 'Kdo postoupí z prvních dvou míst ve skupině C?', 'group_advancement', 10, 13),
  ('ee14c61c-6bf1-4ed4-681a-4aa685dee9d8', 277, 'Kdo postoupí z prvních dvou míst ve skupině D?', 'group_advancement', 10, 14),
  ('c75975e6-c5c3-6304-2bfb-cb6c0aa4b578', 279, 'Kdo postoupí z prvních dvou míst ve skupině E?', 'group_advancement', 10, 15),
  ('f8560180-7c7e-23f0-4563-6f30f4cf6453', 281, 'Kdo postoupí z prvních dvou míst ve skupině F?', 'group_advancement', 10, 16),
  ('e4b10731-7830-0af5-a794-71904906db30', 283, 'Kdo postoupí z prvních dvou míst ve skupině G?', 'group_advancement', 10, 17),
  ('13f0caf6-da76-9acd-5289-f7f333542d01', 285, 'Kdo postoupí z prvních dvou míst ve skupině H?', 'group_advancement', 10, 18),
  ('3bbde22e-3ecf-eb1f-5e37-a91c42bf404c', 287, 'Kdo postoupí z prvních dvou míst ve skupině I?', 'group_advancement', 10, 19),
  ('60753b79-22f7-a0ad-d1c0-865496b0bee6', 289, 'Kdo postoupí z prvních dvou míst ve skupině J?', 'group_advancement', 10, 20),
  ('e1c275c4-9977-8dc7-3c22-c743f3cb2a8b', 291, 'Kdo postoupí z prvních dvou míst ve skupině K?', 'group_advancement', 10, 21),
  ('5bf79450-498c-a1f1-e3d6-af3e1c9b6218', 293, 'Kdo postoupí z prvních dvou míst ve skupině L?', 'group_advancement', 10, 22)
on conflict (col_index) do update set question = excluded.question;
