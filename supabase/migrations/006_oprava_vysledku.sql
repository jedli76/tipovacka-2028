-- Oprava dvou špatných výsledků

-- 1. Mexiko vs JAR: bylo 2:2, správně 2:0
update public.matches set home_score = 2, away_score = 0
where home_team = 'Mexiko' and away_team = 'Jihoafrická republika';

-- 2. Kanada vs Katar: bylo 2:6, správně 6:0
update public.matches set home_score = 6, away_score = 0
where home_team = 'Kanada' and away_team = 'Katar';

-- Přepočet tipů pro opravené zápasy
do $$
declare
  v_match_id uuid;
  v_home_score int;
  v_away_score int;
  v_user_id uuid;
  v_points int;
begin
  -- Pro každý opravený zápas přepočítej tipy
  for v_match_id, v_home_score, v_away_score in
    select id, home_score, away_score from public.matches
    where (home_team = 'Mexiko' and away_team = 'Jihoafrická republika')
       or (home_team = 'Kanada' and away_team = 'Katar')
  loop
    -- Přepočítej body pro všechny tipy na tento zápas
    update public.tips t set
      points = case
        when t.home_score = v_home_score and t.away_score = v_away_score then
          case when t.is_joker then 50 else 25 end
        when (t.home_score > t.away_score) = (v_home_score > v_away_score)
          and not (t.home_score = t.away_score)
          and not (v_home_score = v_away_score) then
          case when t.is_joker
               then greatest(0, (15 - abs((t.home_score - t.away_score) - (v_home_score - v_away_score)))) * 2
               else greatest(0, 15 - abs((t.home_score - t.away_score) - (v_home_score - v_away_score))) end
        when t.home_score = t.away_score and v_home_score = v_away_score then
          case when t.is_joker
               then greatest(0, (18 - abs((t.home_score + t.away_score) - (v_home_score + v_away_score)))) * 2
               else greatest(0, 18 - abs((t.home_score + t.away_score) - (v_home_score + v_away_score))) end
        else 0
      end
    where t.match_id = v_match_id;
  end loop;

  -- Přepočítej žebříček pro všechny dotčené hráče
  for v_user_id in
    select distinct t.user_id from public.tips t
    join public.matches m on m.id = t.match_id
    where (m.home_team = 'Mexiko' and m.away_team = 'Jihoafrická republika')
       or (m.home_team = 'Kanada' and m.away_team = 'Katar')
  loop
    insert into public.leaderboard (user_id, total_points, correct_results, tips_count, updated_at)
    select
      v_user_id,
      coalesce(sum(t.points), 0),
      count(*) filter (where t.home_score = m.home_score and t.away_score = m.away_score),
      count(*),
      now()
    from public.tips t
    join public.matches m on m.id = t.match_id
    where t.user_id = v_user_id
    on conflict (user_id) do update set
      total_points = excluded.total_points,
      correct_results = excluded.correct_results,
      tips_count = excluded.tips_count,
      updated_at = now();
  end loop;
end $$;
