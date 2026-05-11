-- Create spending analytics table
create table if not exists public.spending_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  amount decimal(10,2) not null,
  date date not null default current_date,
  month integer not null,
  year integer not null,
  store text,
  created_at timestamp with time zone default now()
);

alter table public.spending_analytics enable row level security;

create policy "spending_analytics_select_own"
  on public.spending_analytics for select
  using (auth.uid() = user_id);

create policy "spending_analytics_insert_own"
  on public.spending_analytics for insert
  with check (auth.uid() = user_id);

create policy "spending_analytics_update_own"
  on public.spending_analytics for update
  using (auth.uid() = user_id);

create policy "spending_analytics_delete_own"
  on public.spending_analytics for delete
  using (auth.uid() = user_id);

create index idx_spending_analytics_user_id on public.spending_analytics(user_id);
create index idx_spending_analytics_date on public.spending_analytics(date);
create index idx_spending_analytics_category on public.spending_analytics(category);
create index idx_spending_analytics_month_year on public.spending_analytics(month, year);
