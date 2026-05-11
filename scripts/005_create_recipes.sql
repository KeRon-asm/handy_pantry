-- Create recipes table for AI-suggested recipes
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  ingredients jsonb not null,
  instructions jsonb not null,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  cuisine text,
  tags text[],
  image_url text,
  is_favorite boolean default false,
  source text default 'ai-generated',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.recipes enable row level security;

create policy "recipes_select_own"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "recipes_insert_own"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "recipes_update_own"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "recipes_delete_own"
  on public.recipes for delete
  using (auth.uid() = user_id);

create index idx_recipes_user_id on public.recipes(user_id);
create index idx_recipes_is_favorite on public.recipes(is_favorite);
