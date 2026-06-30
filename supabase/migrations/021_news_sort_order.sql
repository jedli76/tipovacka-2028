alter table public.news add column if not exists sort_order integer not null default 0;

-- Nastav sort_order podle created_at (nejnovější = nejmenší číslo = nahoře)
update public.news set sort_order = sub.rn
from (
  select id, row_number() over (order by created_at asc) as rn from public.news
) sub
where public.news.id = sub.id;
