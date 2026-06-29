-- Bonus otázky a tipy
create table if not exists public.bonus_questions (
  id uuid primary key default gen_random_uuid(),
  col_index int unique not null,
  question text not null,
  correct_answer text not null,
  points int not null default 3,
  sort_order int not null
);

create table if not exists public.bonus_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.bonus_questions(id) on delete cascade,
  answer text not null,
  points int not null default 0,
  unique(user_id, question_id)
);

alter table public.bonus_questions enable row level security;
alter table public.bonus_tips enable row level security;

create policy "Anyone can read bonus questions" on public.bonus_questions
  for select using (true);
create policy "Authenticated users can read all bonus tips" on public.bonus_tips
  for select to authenticated using (true);
create policy "Users manage own bonus tips" on public.bonus_tips
  for all using (auth.uid() = user_id);

-- Bonus otázky
insert into public.bonus_questions (id, col_index, question, correct_answer, sort_order) values
  ('3cc9e640-3c1b-9bed-6ae9-b9f0b9124240', 6, 'Který tým dostane první žlutou kartu?', 'JAR', 0),
  ('f14a8508-9a9b-4ad5-889f-80ea4387b496', 10, 'Který tým bude mít víc střel na branku?', 'KOR', 1),
  ('a3b142b8-dd94-d451-3dd4-8e66e0dcf391', 14, 'Kdo bude kopat poslední roh v prvním poločase?', 'KAN', 2),
  ('6077cb56-2661-afa0-7c83-48d45c87d0fa', 18, 'Ve kterém poločase padne víc gólů?', '1.', 3),
  ('f107a9a8-f16f-261b-b1c0-e6b4ec6354c2', 22, 'Co se v zápase po úvodním výkopu stane jako první?', 'NIC', 4),
  ('d2ea396c-dd24-0aaa-2672-0e5ee2cb0797', 28, 'Kolik gólů dají v těchto dvou zápasech náhradníci?', '0', 5),
  ('780ab6e7-b547-1010-4996-a3ee1287b5b2', 32, 'Který tým se dopustí většího počtu faulů?', 'AUS', 6),
  ('76d35c68-79f3-96e0-d6ba-9d4172503560', 36, 'Kolik poločasů vyhraje Německo?', '2', 7),
  ('3dffcd44-6c67-aa78-3d86-1e43d89dd7ba', 40, 'Který tým vystřídá první?', 'JAP', 8),
  ('ae56efe8-af6b-f5b1-7d73-218e0475b844', 46, 'Který ze čtyř týmů bude mít nejvyšší držení míče (posession)?', 'EKV', 9),
  ('0690d33e-994a-0c4c-88eb-047fd2cfa26d', 50, 'Kolik gólů nastřílejí hráči FC Barcelona?', '0', 10),
  ('6836db27-62e5-190d-3391-69b593a7d756', 54, 'Který tým dostane poslední žlutou kartu?', 'BEL', 11),
  ('4ff70a21-f816-2ea4-787e-d0c54b643964', 60, 'Kdo dá víc gólů?', 'STEJNĚ', 12),
  ('1233bc38-2bc8-1d1c-2001-f21eaa2307a9', 64, 'Ve kterém poločase se bude kopat víc rohů?', 'STEJNĚ', 13),
  ('e3364466-45ae-def3-2e8d-cbbf359f2f76', 70, 'Ve kterých poločasech padne v nočních zápasech více gólů?', 'STEJNĚ', 14),
  ('0c50b224-de7b-a347-a409-79f512785787', 74, 'Kdo bude vhazovat poslední aut?', 'JOR', 15),
  ('42431632-bd23-4584-a240-d4480b9d2ea5', 78, 'Bude v utkání trefena tyč nebo břevno?', 'NE', 16),
  ('81849e39-dbe4-7bde-802e-51b9ae1fcc95', 82, 'Který tým bude mít více střel na branku?', 'ANG', 17),
  ('46980d0f-a627-32e0-7361-4cbfddca0bca', 88, 'Ve kterém zápase bude rozdáno víc žlutých karet?', 'GHA-PAN', 18),
  ('ee02b373-59b7-f76f-e265-d4fc4100ec33', 92, 'Kdo bude kopat poslední roh zápasu?', 'JAR', 19),
  ('c45faeae-42e5-f85a-9df8-92e5b8908fb5', 96, 'Který brankář se dotkne míče jako první?', 'SVY', 20),
  ('77226a61-180f-86fe-801b-b2663f4d03b5', 102, 'Kdy padne nejrychlejší gól v nočních zápasech?', 'DO 23:00', 21),
  ('6d4e4ff4-3017-cabc-844e-229db8fcfac4', 106, 'Který tým první vystřídá?', 'AUS', 22),
  ('dc31db58-6b79-2389-875c-279e921f3886', 114, 'Kdo nastřílí více gólů? Brazílie, nebo všechny ostatní týmy dohromady?', 'BRAZÍLIE', 23),
  ('df0c5504-e262-bc49-bdb5-ea790b621056', 118, 'Kdo spáchá poslední faul?', 'SWE', 24),
  ('c80c4a6a-bd18-062f-e7a3-ddb263fb1613', 122, 'Kdo bude vhazovat první aut?', 'NEM', 25),
  ('83951274-3c0c-a12b-7928-893be898c3e3', 126, 'Počet zákroků brankáře (brankářů) Curacaa?', '8 A VÍC', 26),
  ('55fe25c9-14fc-9038-bc16-3b2c112d4428', 130, 'Kdy padne gól ve 2. poločase?', 'DVĚ VARIANTY', 27),
  ('ee449213-7db1-bcf8-be52-57e16aa13608', 134, 'Ve kterém poločase se bude kopat víc rohů?  2', '1.', 28),
  ('401b9c36-9392-36ec-651e-5a30ea92ad6b', 138, 'Kolik střídání proběhne do času 65:00?', '3-4', 29),
  ('5c1fde28-a490-24c7-e6d3-76eb19ea4f99', 144, 'Který tým dostane nejvíc žlutých karet?', 'URU, KAP, NZE', 30),
  ('6c07be06-50a2-4613-ae4d-e72d6ebf6cbf', 148, 'Jak padne druhý gól zápasu?', 'LEVOU', 31),
  ('ee36e043-1a51-1ac3-b7f5-aa6928d547ff', 152, 'Kolik Irák zblokuje střel?', '3-5', 32),
  ('2467d1fc-0aae-f0c7-a011-f5c88771e26b', 158, 'Kolik týmů vyhraje alespoň poločas?', '3', 33),
  ('f3ac29fa-294c-0b4e-c3e1-2fb6cd7d7f7d', 162, 'Padne gól střelou mimo vápno? Teče uvnitř vápna se nepočítají, oficiální autor gólu prostě střílel mimo vápno.', 'ANO', 34),
  ('475d854d-99cb-5168-a9ba-def8c14c8efb', 166, 'Který brankář se dotkne míče první ve druhém poločase?', 'GHA', 35),
  ('bd290a93-b171-4d41-8ece-3a0a8376e5cd', 172, 'Který z týmů vystřídá jako první?', 'KON, CHOR', 36),
  ('948c652b-00ee-6914-6c76-505f04876529', 176, 'Kdo bude kopat první roh?', 'SVY', 37),
  ('f0d0c4f9-9928-b307-e5e8-6abadd7fb4a1', 180, 'Kolik poletí střel na branku?', '7-9', 38),
  ('661bb234-37c6-8172-995b-af8c63af2a5f', 186, 'Kolik z těchto týmů dá alespoň gól?', '3', 39),
  ('6af5da74-2793-facd-3626-52ad6ad42f7d', 192, 'Který z těchto týmů bude nejčastěji v ofsajdu?', 'JAR', 40),
  ('50e745f7-e589-4505-d7f1-8269c073cc92', 196, 'Kolik gólů nastřílejí hráči Bayernu Mnichov?', '0', 41),
  ('61843a86-69e6-c9c0-2d9c-1bff6eb5e0f2', 200, 'Co se v zápase po úvodním výkopu stane jako první?  2', 'NIC', 42),
  ('a4876a56-2b88-0b95-5e37-5b18d760e657', 210, 'Kolik gólů dají týmy z Evropy (NIZ, SWE, TUR) oproti ostatním?', 'VÍCE', 43),
  ('825575e6-7e3a-be6d-be7c-0e93ee2c63b4', 214, 'Kdo vystřelí dříve na branku?', 'MBAPPE', 44),
  ('78f83aa5-9b4e-d7a4-807f-99f7e2d9db9f', 218, 'Kdo bude vhazovat první aut?  2', 'SEN', 45),
  ('cc250708-22ce-3d5e-296a-54ce1a9537be', 228, 'Padne v noci gól hlavou?', 'ANO', 46),
  ('e97bbef0-4732-68c7-4300-a1ae8cabb3ff', 232, 'Ve kterém poločase bude Anglie kopat víc rohů?', '1.', 47),
  ('d5ed4ba3-d1b6-1eac-c042-a8cebcd9608a', 236, 'Bude v utkání trefena tyč nebo břevno?  2', 'ANO', 48),
  ('f6c758ad-f5e1-f967-fce4-009b423dc94b', 246, 'Kolik gólů nastřílí týmy Ronalda a Messiho (Portugalsko + Argentina) oproti ostatním?', 'MÉNĚ', 49)
on conflict (col_index) do update set question = excluded.question, correct_answer = excluded.correct_answer;
