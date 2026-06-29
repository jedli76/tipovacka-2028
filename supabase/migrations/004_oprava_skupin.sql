-- Oprava písmen skupin podle oficiálního losování MS 2026
-- A: Mexiko, JAR, Jižní Korea, Česko
-- B: Švýcarsko, Kanada, Bosna, Katar
-- C: Brazílie, Maroko, Skotsko, Haiti
-- D: USA, Austrálie, Paraguay, Turecko
-- E: Německo, Pobřeží slonoviny, Ekvádor, Curacao
-- F: Nizozemsko, Japonsko, Švédsko, Tunisko
-- G: Belgie, Egypt, Írán, Nový Zéland
-- H: Španělsko, Kapverdy, Uruguay, Saúdská Arábie
-- I: Francie, Norsko, Senegal, Irák
-- J: Argentina, Rakousko, Alžírsko, Jordánsko
-- K: Kolumbie, Portugalsko, DR Kongo, Uzbekistán
-- L: Anglie, Chorvatsko, Ghana, Panama

update public.matches set group_name = case group_name
  when 'A' then 'J'
  when 'B' then 'K'
  when 'C' then 'L'
  when 'D' then 'I'
  when 'E' then 'G'
  when 'F' then 'H'
  when 'G' then 'F'
  when 'H' then 'E'
  when 'I' then 'D'
  when 'J' then 'C'
  when 'K' then 'B'
  when 'L' then 'A'
end
where stage = 'group';
