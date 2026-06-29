-- Bonus tipy pro Roman Jedlička
do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'romanjedlicka@gmail.com';
  if v_uid is null then raise exception 'User not found'; end if;

  insert into public.bonus_tips (id, user_id, question_id, answer, points) values
    (gen_random_uuid(), v_uid, '3cc9e640-3c1b-9bed-6ae9-b9f0b9124240', 'JAR', 3),
    (gen_random_uuid(), v_uid, 'f14a8508-9a9b-4ad5-889f-80ea4387b496', 'KOR', 3),
    (gen_random_uuid(), v_uid, 'a3b142b8-dd94-d451-3dd4-8e66e0dcf391', 'KAN', 3),
    (gen_random_uuid(), v_uid, '6077cb56-2661-afa0-7c83-48d45c87d0fa', '2.', 0),
    (gen_random_uuid(), v_uid, 'f107a9a8-f16f-261b-b1c0-e6b4ec6354c2', 'AUT', 0),
    (gen_random_uuid(), v_uid, 'd2ea396c-dd24-0aaa-2672-0e5ee2cb0797', '1', 0),
    (gen_random_uuid(), v_uid, '780ab6e7-b547-1010-4996-a3ee1287b5b2', 'TUR', 0),
    (gen_random_uuid(), v_uid, '76d35c68-79f3-96e0-d6ba-9d4172503560', '2', 3),
    (gen_random_uuid(), v_uid, '3dffcd44-6c67-aa78-3d86-1e43d89dd7ba', 'JAP', 3),
    (gen_random_uuid(), v_uid, 'ae56efe8-af6b-f5b1-7d73-218e0475b844', 'SWE', 0),
    (gen_random_uuid(), v_uid, '0690d33e-994a-0c4c-88eb-047fd2cfa26d', '3', 0),
    (gen_random_uuid(), v_uid, '6836db27-62e5-190d-3391-69b593a7d756', 'BEL', 3),
    (gen_random_uuid(), v_uid, '4ff70a21-f816-2ea4-787e-d0c54b643964', 'STEJNĚ', 3),
    (gen_random_uuid(), v_uid, '1233bc38-2bc8-1d1c-2001-f21eaa2307a9', '2.', 0),
    (gen_random_uuid(), v_uid, 'e3364466-45ae-def3-2e8d-cbbf359f2f76', 'STEJNĚ', 3),
    (gen_random_uuid(), v_uid, '0c50b224-de7b-a347-a409-79f512785787', 'RAK', 0),
    (gen_random_uuid(), v_uid, '42431632-bd23-4584-a240-d4480b9d2ea5', 'ANO', 0),
    (gen_random_uuid(), v_uid, '81849e39-dbe4-7bde-802e-51b9ae1fcc95', 'ANG', 3),
    (gen_random_uuid(), v_uid, '46980d0f-a627-32e0-7361-4cbfddca0bca', 'UZB-KOL', 0),
    (gen_random_uuid(), v_uid, 'ee02b373-59b7-f76f-e265-d4fc4100ec33', 'CZE', 0),
    (gen_random_uuid(), v_uid, 'c45faeae-42e5-f85a-9df8-92e5b8908fb5', 'SVY', 3),
    (gen_random_uuid(), v_uid, '77226a61-180f-86fe-801b-b2663f4d03b5', 'DO 23:00', 3),
    (gen_random_uuid(), v_uid, '6d4e4ff4-3017-cabc-844e-229db8fcfac4', 'AUS', 3),
    (gen_random_uuid(), v_uid, 'dc31db58-6b79-2389-875c-279e921f3886', 'BRAZÍLIE', 3),
    (gen_random_uuid(), v_uid, 'df0c5504-e262-bc49-bdb5-ea790b621056', 'NIZ', 0),
    (gen_random_uuid(), v_uid, 'c80c4a6a-bd18-062f-e7a3-ddb263fb1613', 'NEM', 3),
    (gen_random_uuid(), v_uid, '83951274-3c0c-a12b-7928-893be898c3e3', '4-7', 0),
    (gen_random_uuid(), v_uid, '55fe25c9-14fc-9038-bc16-3b2c112d4428', '75:01 - KONEC', 0),
    (gen_random_uuid(), v_uid, 'ee449213-7db1-bcf8-be52-57e16aa13608', '2.', 0),
    (gen_random_uuid(), v_uid, '401b9c36-9392-36ec-651e-5a30ea92ad6b', '3-4', 3),
    (gen_random_uuid(), v_uid, '5c1fde28-a490-24c7-e6d3-76eb19ea4f99', 'EGY', 0),
    (gen_random_uuid(), v_uid, '6c07be06-50a2-4613-ae4d-e72d6ebf6cbf', 'LEVOU', 3),
    (gen_random_uuid(), v_uid, 'ee36e043-1a51-1ac3-b7f5-aa6928d547ff', '0-2', 0),
    (gen_random_uuid(), v_uid, '2467d1fc-0aae-f0c7-a011-f5c88771e26b', '2', 0),
    (gen_random_uuid(), v_uid, 'f3ac29fa-294c-0b4e-c3e1-2fb6cd7d7f7d', 'ANO', 3),
    (gen_random_uuid(), v_uid, '475d854d-99cb-5168-a9ba-def8c14c8efb', 'ANG', 0),
    (gen_random_uuid(), v_uid, 'bd290a93-b171-4d41-8ece-3a0a8376e5cd', 'CHOR', 0),
    (gen_random_uuid(), v_uid, '948c652b-00ee-6914-6c76-505f04876529', 'KAN', 0),
    (gen_random_uuid(), v_uid, 'f0d0c4f9-9928-b307-e5e8-6abadd7fb4a1', '7-9', 3),
    (gen_random_uuid(), v_uid, '661bb234-37c6-8172-995b-af8c63af2a5f', '3', 3),
    (gen_random_uuid(), v_uid, '6af5da74-2793-facd-3626-52ad6ad42f7d', 'KOR', 0),
    (gen_random_uuid(), v_uid, '50e745f7-e589-4505-d7f1-8269c073cc92', '1', 0),
    (gen_random_uuid(), v_uid, '61843a86-69e6-c9c0-2d9c-1bff6eb5e0f2', 'AUT', 0),
    (gen_random_uuid(), v_uid, 'a4876a56-2b88-0b95-5e37-5b18d760e657', 'VÍCE', 3),
    (gen_random_uuid(), v_uid, '825575e6-7e3a-be6d-be7c-0e93ee2c63b4', 'MBAPPE', 3),
    (gen_random_uuid(), v_uid, '78f83aa5-9b4e-d7a4-807f-99f7e2d9db9f', 'SEN', 3),
    (gen_random_uuid(), v_uid, 'cc250708-22ce-3d5e-296a-54ce1a9537be', 'ANO', 3),
    (gen_random_uuid(), v_uid, 'e97bbef0-4732-68c7-4300-a1ae8cabb3ff', 'STEJNĚ', 0),
    (gen_random_uuid(), v_uid, 'd5ed4ba3-d1b6-1eac-c042-a8cebcd9608a', 'ANO', 3),
    (gen_random_uuid(), v_uid, 'f6c758ad-f5e1-f967-fce4-009b423dc94b', 'VÍCE', 0)
  on conflict (user_id, question_id) do update set answer = excluded.answer, points = excluded.points;
end $$;
