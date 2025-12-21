
-- Create tickets table
create table public.tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  status text check (status in ('new', 'in_progress', 'resolved', 'closed')) default 'new' not null,
  priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'low' not null,
  created_by uuid references public.users(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tickets enable row level security;

-- Policies for tickets
-- 1. Everyone can view tickets (or maybe restrict to authenticated users)
create policy "Tickets are viewable by authenticated users"
  on public.tickets for select
  to authenticated
  using (true);

-- 2. Authenticated users can create tickets
create policy "Authenticated users can create tickets"
  on public.tickets for insert
  to authenticated
  with check (auth.uid() = created_by);

-- 3. Ticket creators and assignees and admins/managers can update tickets
-- For simplicity in this phase, letting creators update. We will refine role-based update policies later.
create policy "Users can update their own tickets"
  on public.tickets for update
  to authenticated
  using (auth.uid() = created_by or auth.uid() = assigned_to);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_ticket_updated
  before update on public.tickets
  for each row execute procedure public.handle_updated_at();
