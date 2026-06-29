-- Turnajové tipy Roman Jedlička
do $$
declare v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'romanjedlicka@gmail.com';
  insert into public.tournament_tips (id, user_id, question_id, answer, points) values
    (gen_random_uuid(), v_uid, 'd13e25b2-0967-5f99-91ee-b911c08642ff', 'Argentina', 15),
    (gen_random_uuid(), v_uid, '46bfc0ca-5ea8-bdab-da32-8bd1fb9c8162', 'Nový Zéland', 0),
    (gen_random_uuid(), v_uid, '29cfec53-706e-5d1c-b4a3-305e845b9950', 'Irák', 15),
    (gen_random_uuid(), v_uid, 'cdf02285-d2f7-3164-b423-50f05d0bc101', 'Portugalsko', 0),
    (gen_random_uuid(), v_uid, 'a025c86e-b6eb-3f4d-53db-f3d3d63abe16', 'E', 0),
    (gen_random_uuid(), v_uid, '1457a97b-d5b6-073b-125e-d24363f0db69', 'Real Madrid (Mbappe, Vinicius Jr., Guler, Bellingham,...)', 10),
    (gen_random_uuid(), v_uid, '46520357-6106-e178-b6e3-98068820bd01', 'Bossové průplavů (Írán, Panama)', 0),
    (gen_random_uuid(), v_uid, 'b98079bf-8825-4018-453a-11aac07e045b', 'Strážci Amazonky (Brazílie, Ekvádor)', 10),
    (gen_random_uuid(), v_uid, '2c8016dc-780b-3bf3-0bbc-a7853d17afb8', 'Leváci (Yamal, Messi, Havertz)', 10),
    (gen_random_uuid(), v_uid, 'b9489e46-f976-d4a6-9e4d-d9caf65a7f6c', 'Cucurella', 0),
    (gen_random_uuid(), v_uid, 'aa65a99a-4b5e-93f6-fabb-4dcd38e79584', '46-60', 0),
    (gen_random_uuid(), v_uid, 'b5760491-53e0-d7fb-d865-cd6b1cca1456', 'Mexiko, Jižní Korea', 10),
    (gen_random_uuid(), v_uid, 'e449fc7a-e852-d866-eab3-a657928ab373', 'Kanada, Švýcarsko', 20),
    (gen_random_uuid(), v_uid, '2fda57fc-47ce-67a4-bf60-96d0136fe8cd', 'Brazílie, Skotsko', 10),
    (gen_random_uuid(), v_uid, 'ee14c61c-6bf1-4ed4-681a-4aa685dee9d8', 'Turecko, USA', 10),
    (gen_random_uuid(), v_uid, 'c75975e6-c5c3-6304-2bfb-cb6c0aa4b578', 'Německo, Pobřeží slonoviny', 20),
    (gen_random_uuid(), v_uid, 'f8560180-7c7e-23f0-4563-6f30f4cf6453', 'Japonsko, Nizozemsko', 20),
    (gen_random_uuid(), v_uid, 'e4b10731-7830-0af5-a794-71904906db30', 'Belgie, Egypt', 20),
    (gen_random_uuid(), v_uid, '13f0caf6-da76-9acd-5289-f7f333542d01', 'Španělsko, Uruguay', 10),
    (gen_random_uuid(), v_uid, '3bbde22e-3ecf-eb1f-5e37-a91c42bf404c', 'Francie, Norsko', 20),
    (gen_random_uuid(), v_uid, '60753b79-22f7-a0ad-d1c0-865496b0bee6', 'Argentina, Rakousko', 20),
    (gen_random_uuid(), v_uid, 'e1c275c4-9977-8dc7-3c22-c743f3cb2a8b', 'Kolumbie, Portugalsko', 20),
    (gen_random_uuid(), v_uid, '5bf79450-498c-a1f1-e3d6-af3e1c9b6218', 'Anglie, Chorvatsko', 20)
  on conflict (user_id, question_id) do update set answer = excluded.answer, points = excluded.points;
end $$;
