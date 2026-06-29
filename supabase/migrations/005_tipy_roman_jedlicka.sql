-- Tipy Roman Jedlička (romanjedlicka@gmail.com)
-- Žolík: Portugalsko vs Uzbekistán

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'romanjedlicka@gmail.com';

  if v_user_id is null then
    raise exception 'Uživatel romanjedlicka@gmail.com nenalezen';
  end if;

  -- Ujisti se, že profil existuje
  insert into public.profiles (id, display_name)
  values (v_user_id, 'Roman Jedlička')
  on conflict (id) do nothing;

  -- Vlož tipy (upsert)
  insert into public.tips (user_id, match_id, home_score, away_score, is_joker, points, updated_at)
  select
    v_user_id,
    m.id,
    t.home_score,
    t.away_score,
    t.is_joker,
    case
      when m.home_score is null then null
      when t.home_score = m.home_score and t.away_score = m.away_score then
        case when t.is_joker then 50 else 25 end
      when (t.home_score > t.away_score) = (m.home_score > m.away_score)
        and not (t.home_score = t.away_score)
        and not (m.home_score = m.away_score) then
        case when t.is_joker then (15 - abs((t.home_score - t.away_score) - (m.home_score - m.away_score))) * 2
             else 15 - abs((t.home_score - t.away_score) - (m.home_score - m.away_score)) end
      when t.home_score = t.away_score and m.home_score = m.away_score then
        case when t.is_joker then (18 - abs((t.home_score + t.away_score) - (m.home_score + m.away_score))) * 2
             else 18 - abs((t.home_score + t.away_score) - (m.home_score + m.away_score)) end
      else 0
    end,
    now()
  from (values
    ('Mexiko',                 'Jihoafrická republika', 3, 0, false),
    ('Jižní Korea',            'Česko',                 1, 0, false),
    ('Kanada',                 'Bosna a Hercegovina',   3, 0, false),
    ('USA',                    'Paraguay',              2, 0, false),
    ('Katar',                  'Švýcarsko',             0, 3, false),
    ('Brazílie',               'Maroko',                4, 0, false),
    ('Haiti',                  'Skotsko',               1, 3, false),
    ('Austrálie',              'Turecko',               1, 1, false),
    ('Německo',                'Curacao',               6, 0, false),
    ('Nizozemsko',             'Japonsko',              3, 2, false),
    ('Pobřeží slonoviny',      'Ekvádor',               1, 1, false),
    ('Švédsko',                'Tunisko',               2, 1, false),
    ('Španělsko',              'Kapverdy',              6, 0, false),
    ('Belgie',                 'Egypt',                 3, 1, false),
    ('Saúdská Arábie',         'Uruguay',               0, 3, false),
    ('Írán',                   'Nový Zéland',           2, 2, false),
    ('Francie',                'Senegal',               2, 0, false),
    ('Irák',                   'Norsko',                1, 2, false),
    ('Argentina',              'Alžírsko',              3, 0, false),
    ('Rakousko',               'Jordánsko',             2, 0, false),
    ('Portugalsko',            'DR Kongo',              4, 0, false),
    ('Anglie',                 'Chorvatsko',            2, 1, false),
    ('Ghana',                  'Panama',                2, 2, false),
    ('Uzbekistán',             'Kolumbie',              0, 3, false),
    ('Česko',                  'Jihoafrická republika', 2, 0, false),
    ('Švýcarsko',              'Bosna a Hercegovina',   0, 0, false),
    ('Kanada',                 'Katar',                 3, 0, false),
    ('Mexiko',                 'Jižní Korea',           2, 1, false),
    ('USA',                    'Austrálie',             3, 0, false),
    ('Skotsko',                'Maroko',                1, 1, false),
    ('Brazílie',               'Haiti',                 7, 0, false),
    ('Turecko',                'Paraguay',              3, 2, false),
    ('Nizozemsko',             'Švédsko',               3, 1, false),
    ('Německo',                'Pobřeží slonoviny',     2, 0, false),
    ('Ekvádor',                'Curacao',               2, 0, false),
    ('Tunisko',                'Japonsko',              1, 2, false),
    ('Španělsko',              'Saúdská Arábie',        4, 0, false),
    ('Belgie',                 'Írán',                  3, 0, false),
    ('Uruguay',                'Kapverdy',              3, 1, false),
    ('Nový Zéland',            'Egypt',                 2, 2, false),
    ('Argentina',              'Rakousko',              3, 0, false),
    ('Francie',                'Irák',                  5, 0, false),
    ('Norsko',                 'Senegal',               2, 1, false),
    ('Jordánsko',              'Alžírsko',              1, 3, false),
    ('Portugalsko',            'Uzbekistán',            4, 0, true),  -- ŽOLÍK
    ('Anglie',                 'Ghana',                 2, 0, false),
    ('Panama',                 'Chorvatsko',            1, 2, false),
    ('Kolumbie',               'DR Kongo',              2, 1, false),
    ('Švýcarsko',              'Kanada',                0, 0, false),
    ('Bosna a Hercegovina',    'Katar',                 2, 0, false),
    ('Skotsko',                'Brazílie',              1, 3, false),
    ('Maroko',                 'Haiti',                 2, 0, false),
    ('Česko',                  'Mexiko',                0, 2, false),
    ('Jihoafrická republika',  'Jižní Korea',           0, 2, false),
    ('Ekvádor',                'Německo',               1, 3, false),
    ('Curacao',                'Pobřeží slonoviny',     0, 3, false),
    ('Tunisko',                'Nizozemsko',            0, 3, false),
    ('Japonsko',               'Švédsko',               1, 1, false),
    ('Turecko',                'USA',                   1, 1, false),
    ('Paraguay',               'Austrálie',             2, 0, false),
    ('Norsko',                 'Francie',               1, 2, false),
    ('Senegal',                'Irák',                  1, 1, false),
    ('Uruguay',                'Španělsko',             0, 2, false),
    ('Kapverdy',               'Saúdská Arábie',        3, 2, false),
    ('Nový Zéland',            'Belgie',                0, 1, false),
    ('Egypt',                  'Írán',                  2, 1, false),
    ('Panama',                 'Anglie',                0, 4, false),
    ('Chorvatsko',             'Ghana',                 2, 1, false),
    ('Kolumbie',               'Portugalsko',           0, 2, false),
    ('DR Kongo',               'Uzbekistán',            3, 3, false),
    ('Jordánsko',              'Argentina',             0, 4, false),
    ('Alžírsko',               'Rakousko',              1, 1, false)
  ) as t(home_team, away_team, home_score, away_score, is_joker)
  join public.matches m on m.home_team = t.home_team and m.away_team = t.away_team
  on conflict (user_id, match_id) do update set
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    is_joker = excluded.is_joker,
    points = excluded.points,
    updated_at = now();

  -- Aktualizuj žebříček
  insert into public.leaderboard (user_id, total_points, correct_results, tips_count, updated_at)
  select
    v_user_id,
    coalesce(sum(points), 0),
    count(*) filter (
      where t.home_score = m.home_score and t.away_score = m.away_score
    ),
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

end $$;
