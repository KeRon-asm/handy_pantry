-- Create shopping lists table
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Shopping List',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.shopping_lists enable row level security;

create policy "shopping_lists_select_own"
  on public.shopping_lists for select
  using (auth.uid() = user_id);

create policy "shopping_lists_insert_own"
  on public.shopping_lists for insert
  with check (auth.uid() = user_id);

create policy "shopping_lists_update_own"
  on public.shopping_lists for update
  using (auth.uid() = user_id);

create policy "shopping_lists_delete_own"
  on public.shopping_lists for delete
  using (auth.uid() = user_id);

-- Create shopping list items table
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity decimal(10,2) not null default 1,
  unit text not null default 'unit',
  category text,
  estimated_price decimal(10,2),
  checked boolean default false,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.shopping_list_items enable row level security;

create policy "shopping_list_items_select_own"
  on public.shopping_list_items for select
  using (auth.uid() = user_id);

create policy "shopping_list_items_insert_own"
  on public.shopping_list_items for insert
  with check (auth.uid() = user_id);

create policy "shopping_list_items_update_own"
  on public.shopping_list_items for update
  using (auth.uid() = user_id);

create policy "shopping_list_items_delete_own"
  on public.shopping_list_items for delete
  using (auth.uid() = user_id);

create index idx_shopping_list_items_list_id on public.shopping_list_items(shopping_list_id);
create index idx_shopping_list_items_user_id on public.shopping_list_items(user_id);
