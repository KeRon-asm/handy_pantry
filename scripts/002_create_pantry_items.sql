-- Create pantry items table
create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  quantity decimal(10,2) not null default 1,
  unit text not null default 'unit',
  purchase_date date default current_date,
  expiration_date date,
  price decimal(10,2),
  store text,
  barcode text,
  image_url text,
  notes text,
  location text default 'pantry',
  is_favorite boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.pantry_items enable row level security;

create policy "pantry_items_select_own"
  on public.pantry_items for select
  using (auth.uid() = user_id);

create policy "pantry_items_insert_own"
  on public.pantry_items for insert
  with check (auth.uid() = user_id);

create policy "pantry_items_update_own"
  on public.pantry_items for update
  using (auth.uid() = user_id);

create policy "pantry_items_delete_own"
  on public.pantry_items for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index idx_pantry_items_user_id on public.pantry_items(user_id);
create index idx_pantry_items_category on public.pantry_items(category);
create index idx_pantry_items_expiration on public.pantry_items(expiration_date);
