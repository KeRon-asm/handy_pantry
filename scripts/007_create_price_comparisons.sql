-- Create price comparisons table for tracking prices across stores
create table if not exists public.price_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  store text not null,
  price decimal(10,2) not null,
  unit text,
  date_recorded date not null default current_date,
  created_at timestamp with time zone default now()
);

alter table public.price_comparisons enable row level security;

create policy "price_comparisons_select_own"
  on public.price_comparisons for select
  using (auth.uid() = user_id);

create policy "price_comparisons_insert_own"
  on public.price_comparisons for insert
  with check (auth.uid() = user_id);

create policy "price_comparisons_update_own"
  on public.price_comparisons for update
  using (auth.uid() = user_id);

create policy "price_comparisons_delete_own"
  on public.price_comparisons for delete
  using (auth.uid() = user_id);

create index idx_price_comparisons_user_id on public.price_comparisons(user_id);
create index idx_price_comparisons_product on public.price_comparisons(product_name);
create index idx_price_comparisons_store on public.price_comparisons(store);
