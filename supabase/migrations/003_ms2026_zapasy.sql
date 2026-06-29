-- Smazání testovacích zápasů
delete from public.tips;
delete from public.leaderboard;
delete from public.matches;

-- MS 2026 - skupinová fáze (72 zápasů)
-- Časy převedeny z CZ (UTC+2) na UTC
-- Skupiny:
-- A: Argentina, Alžírsko, Rakousko, Jordánsko
-- B: Kolumbie, Uzbekistán, DR Kongo, Portugalsko
-- C: Anglie, Chorvatsko, Ghana, Panama
-- D: Francie, Senegal, Irák, Norsko
-- E: Belgie, Egypt, Írán, Nový Zéland
-- F: Španělsko, Kapverdy, Saúdská Arábie, Uruguay
-- G: Nizozemsko, Japonsko, Švédsko, Tunisko
-- H: Německo, Curacao, Pobřeží slonoviny, Ekvádor
-- I: USA, Paraguay, Austrálie, Turecko
-- J: Brazílie, Maroko, Haiti, Skotsko
-- K: Kanada, Bosna a Hercegovina, Katar, Švýcarsko
-- L: Mexiko, Jihoafrická republika, Jižní Korea, Česko

insert into public.matches (home_team, away_team, kickoff_at, stage, group_name, home_score, away_score) values

-- 1. KOLO
('Mexiko', 'Jihoafrická republika', '2026-06-11 19:00:00+00', 'group', 'L', 2, 2),
('Jižní Korea', 'Česko', '2026-06-12 02:00:00+00', 'group', 'L', 2, 1),
('Kanada', 'Bosna a Hercegovina', '2026-06-12 19:00:00+00', 'group', 'K', 1, 1),
('USA', 'Paraguay', '2026-06-13 01:00:00+00', 'group', 'I', 4, 1),
('Katar', 'Švýcarsko', '2026-06-13 19:00:00+00', 'group', 'K', 1, 1),
('Brazílie', 'Maroko', '2026-06-13 22:00:00+00', 'group', 'J', 1, 1),
('Haiti', 'Skotsko', '2026-06-14 01:00:00+00', 'group', 'J', 0, 1),
('Austrálie', 'Turecko', '2026-06-14 04:00:00+00', 'group', 'I', 2, 0),
('Německo', 'Curacao', '2026-06-14 17:00:00+00', 'group', 'H', 7, 1),
('Nizozemsko', 'Japonsko', '2026-06-14 20:00:00+00', 'group', 'G', 2, 2),
('Pobřeží slonoviny', 'Ekvádor', '2026-06-14 23:00:00+00', 'group', 'H', 1, 0),
('Švédsko', 'Tunisko', '2026-06-15 02:00:00+00', 'group', 'G', 5, 1),
('Španělsko', 'Kapverdy', '2026-06-15 16:00:00+00', 'group', 'F', 0, 0),
('Belgie', 'Egypt', '2026-06-15 19:00:00+00', 'group', 'E', 1, 1),
('Saúdská Arábie', 'Uruguay', '2026-06-15 22:00:00+00', 'group', 'F', 1, 1),
('Írán', 'Nový Zéland', '2026-06-16 01:00:00+00', 'group', 'E', 2, 2),
('Francie', 'Senegal', '2026-06-16 19:00:00+00', 'group', 'D', 3, 1),
('Irák', 'Norsko', '2026-06-16 22:00:00+00', 'group', 'D', 1, 4),
('Argentina', 'Alžírsko', '2026-06-17 01:00:00+00', 'group', 'A', 3, 0),
('Rakousko', 'Jordánsko', '2026-06-17 04:00:00+00', 'group', 'A', 3, 1),
('Portugalsko', 'DR Kongo', '2026-06-17 17:00:00+00', 'group', 'B', 1, 1),
('Anglie', 'Chorvatsko', '2026-06-17 20:00:00+00', 'group', 'C', 4, 2),
('Ghana', 'Panama', '2026-06-17 23:00:00+00', 'group', 'C', 1, 0),
('Uzbekistán', 'Kolumbie', '2026-06-18 02:00:00+00', 'group', 'B', 1, 3),
('Česko', 'Jihoafrická republika', '2026-06-18 16:00:00+00', 'group', 'L', 1, 1),
('Švýcarsko', 'Bosna a Hercegovina', '2026-06-18 19:00:00+00', 'group', 'K', 4, 1),

-- 2. KOLO
('Kanada', 'Katar', '2026-06-18 22:00:00+00', 'group', 'K', 2, 6),
('Mexiko', 'Jižní Korea', '2026-06-19 01:00:00+00', 'group', 'L', 1, 0),
('USA', 'Austrálie', '2026-06-19 19:00:00+00', 'group', 'I', 2, 0),
('Skotsko', 'Maroko', '2026-06-19 22:00:00+00', 'group', 'J', 0, 1),
('Brazílie', 'Haiti', '2026-06-20 00:30:00+00', 'group', 'J', 3, 0),
('Turecko', 'Paraguay', '2026-06-20 03:00:00+00', 'group', 'I', 0, 1),
('Německo', 'Pobřeží slonoviny', '2026-06-20 17:00:00+00', 'group', 'H', 2, 1),
('Nizozemsko', 'Švédsko', '2026-06-20 20:00:00+00', 'group', 'G', 5, 1),
('Ekvádor', 'Curacao', '2026-06-21 00:00:00+00', 'group', 'H', 0, 0),
('Tunisko', 'Japonsko', '2026-06-21 04:00:00+00', 'group', 'G', 0, 4),
('Španělsko', 'Saúdská Arábie', '2026-06-21 16:00:00+00', 'group', 'F', 4, 0),
('Belgie', 'Írán', '2026-06-21 19:00:00+00', 'group', 'E', 0, 0),
('Uruguay', 'Kapverdy', '2026-06-21 22:00:00+00', 'group', 'F', 2, 2),
('Nový Zéland', 'Egypt', '2026-06-22 01:00:00+00', 'group', 'E', 1, 3),
('Argentina', 'Rakousko', '2026-06-22 17:00:00+00', 'group', 'A', 2, 0),
('Francie', 'Irák', '2026-06-22 21:00:00+00', 'group', 'D', 3, 0),
('Norsko', 'Senegal', '2026-06-23 00:00:00+00', 'group', 'D', 3, 2),
('Jordánsko', 'Alžírsko', '2026-06-23 03:00:00+00', 'group', 'A', 1, 2),
('Portugalsko', 'Uzbekistán', '2026-06-23 17:00:00+00', 'group', 'B', 5, 0),
('Anglie', 'Ghana', '2026-06-23 20:00:00+00', 'group', 'C', 0, 0),
('Panama', 'Chorvatsko', '2026-06-23 23:00:00+00', 'group', 'C', 0, 1),
('Kolumbie', 'DR Kongo', '2026-06-24 02:00:00+00', 'group', 'B', 1, 0),
('Bosna a Hercegovina', 'Katar', '2026-06-24 19:00:00+00', 'group', 'K', 3, 1),
('Švýcarsko', 'Kanada', '2026-06-24 19:00:00+00', 'group', 'K', 2, 1),

-- 3. KOLO
('Maroko', 'Haiti', '2026-06-24 22:00:00+00', 'group', 'J', 4, 2),
('Skotsko', 'Brazílie', '2026-06-24 22:00:00+00', 'group', 'J', 0, 3),
('Česko', 'Mexiko', '2026-06-25 01:00:00+00', 'group', 'L', 0, 3),
('Jihoafrická republika', 'Jižní Korea', '2026-06-25 01:00:00+00', 'group', 'L', 1, 0),
('Curacao', 'Pobřeží slonoviny', '2026-06-25 20:00:00+00', 'group', 'H', 0, 2),
('Ekvádor', 'Německo', '2026-06-25 20:00:00+00', 'group', 'H', 2, 1),
('Japonsko', 'Švédsko', '2026-06-25 23:00:00+00', 'group', 'G', 1, 1),
('Tunisko', 'Nizozemsko', '2026-06-25 23:00:00+00', 'group', 'G', 1, 3),
('Paraguay', 'Austrálie', '2026-06-26 02:00:00+00', 'group', 'I', 0, 0),
('Turecko', 'USA', '2026-06-26 02:00:00+00', 'group', 'I', 3, 2),
('Norsko', 'Francie', '2026-06-26 19:00:00+00', 'group', 'D', 1, 4),
('Senegal', 'Irák', '2026-06-26 19:00:00+00', 'group', 'D', 5, 0),
('Kapverdy', 'Saúdská Arábie', '2026-06-27 00:00:00+00', 'group', 'F', 0, 0),
('Uruguay', 'Španělsko', '2026-06-27 00:00:00+00', 'group', 'F', 0, 1),
('Egypt', 'Írán', '2026-06-27 03:00:00+00', 'group', 'E', 1, 1),
('Nový Zéland', 'Belgie', '2026-06-27 03:00:00+00', 'group', 'E', 1, 5),
('Chorvatsko', 'Ghana', '2026-06-27 21:00:00+00', 'group', 'C', 2, 1),
('Panama', 'Anglie', '2026-06-27 21:00:00+00', 'group', 'C', 0, 2),
('DR Kongo', 'Uzbekistán', '2026-06-27 23:30:00+00', 'group', 'B', 3, 1),
('Kolumbie', 'Portugalsko', '2026-06-27 23:30:00+00', 'group', 'B', 0, 0),
('Alžírsko', 'Rakousko', '2026-06-28 02:00:00+00', 'group', 'A', 3, 3),
('Jordánsko', 'Argentina', '2026-06-28 02:00:00+00', 'group', 'A', 1, 3);
