insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

create policy "public read news images" on storage.objects
  for select using (bucket_id = 'news-images');

create policy "admin upload news images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'news-images' and auth.email() = 'romanjedlicka@gmail.com');

create policy "admin delete news images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'news-images' and auth.email() = 'romanjedlicka@gmail.com');
