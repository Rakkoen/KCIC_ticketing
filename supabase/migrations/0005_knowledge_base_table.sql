-- Create knowledge base table
create table public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text check (category in ('general', 'technical', 'process', 'policy', 'troubleshooting', 'faq')) default 'general' not null,
  tags text[],
  status text check (status in ('draft', 'published', 'archived')) default 'draft' not null,
  view_count integer default 0,
  helpful_count integer default 0,
  not_helpful_count integer default 0,
  last_reviewed_at timestamp with time zone,
  review_frequency_days integer default 90,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.knowledge_base enable row level security;

-- Policies for knowledge_base
-- 1. Everyone can view published knowledge base articles
create policy "Published knowledge articles are viewable by authenticated users"
  on public.knowledge_base for select
  to authenticated
  using (status = 'published');

-- 2. Admins and managers can view all knowledge articles
create policy "All knowledge articles are viewable by admins and managers"
  on public.knowledge_base for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 3. Admins and managers can create knowledge articles
create policy "Admins and managers can create knowledge articles"
  on public.knowledge_base for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 4. Admins and managers can update knowledge articles
create policy "Admins and managers can update knowledge articles"
  on public.knowledge_base for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  )
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 5. Creators can update their own articles
create policy "Users can update their own knowledge articles"
  on public.knowledge_base for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_knowledge_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on knowledge base update
create trigger on_knowledge_updated
  before update on public.knowledge_base
  for each row execute procedure public.handle_knowledge_updated_at();

-- Create knowledge base search history table
create table public.knowledge_search_history (
  id uuid default gen_random_uuid() primary key,
  search_query text not null,
  results_count integer default 0,
  clicked_article_id uuid references public.knowledge_base(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for knowledge_search_history
alter table public.knowledge_search_history enable row level security;

-- Policies for knowledge_search_history
create policy "Users can view their own search history"
  on public.knowledge_search_history for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own search history"
  on public.knowledge_search_history for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admins can view all search history
create policy "Admins can view all search history"
  on public.knowledge_search_history for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );