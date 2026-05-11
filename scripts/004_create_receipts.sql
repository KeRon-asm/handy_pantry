-- Create receipts table for tracking purchases
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store text not null,
  total_amount decimal(10,2) not null,
  purchase_date date not null default current_date,
  image_url text,
  ocr_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.receipts enable row level security;

create policy "receipts_select_own"
  on public.receipts for select
  using (auth.uid() = user_id);

create policy "receipts_insert_own"
  on public.receipts for insert
  with check (auth.uid() = user_id);

create policy "receipts_update_own"
  on public.receipts for update
  using (auth.uid() = user_id);

create policy "receipts_delete_own"
  on public.receipts for delete
  using (auth.uid() = user_id);

-- Create receipt items table
create table if not exists public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity decimal(10,2) not null default 1,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  category text,
  created_at timestamp with time zone default now()
);

alter table public.receipt_items enable row level security;

create policy "receipt_items_select_own"
  on public.receipt_items for select
  using (auth.uid() = user_id);

create policy "receipt_items_insert_own"
  on public.receipt_items for insert
  with check (auth.uid() = user_id);

create policy "receipt_items_update_own"
  on public.receipt_items for update
  using (auth.uid() = user_id);

create policy "receipt_items_delete_own"
  on public.receipt_items for delete
  using (auth.uid() = user_id);

create index idx_receipt_items_receipt_id on public.receipt_items(receipt_id);
create index idx_receipt_items_user_id on public.receipt_items(user_id);
create index idx_receipts_user_id on public.receipts(user_id);
create index idx_receipts_purchase_date on public.receipts(purchase_date);
