-- Přidej turnajové body do žebříčku
update public.leaderboard lb
set total_points = lb.total_points + coalesce((
  select sum(tt.points)
  from public.tournament_tips tt
  where tt.user_id = lb.user_id
), 0)
where exists (
  select 1 from public.tournament_tips tt where tt.user_id = lb.user_id
);
