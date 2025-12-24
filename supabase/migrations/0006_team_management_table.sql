-- Create teams table
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  team_lead_id uuid references public.users(id) on delete set null,
  department text,
  status text check (status in ('active', 'inactive', 'archived')) default 'active' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for teams
alter table public.teams enable row level security;

-- Policies for teams
-- 1. Everyone can view active teams
create policy "Active teams are viewable by authenticated users"
  on public.teams for select
  to authenticated
  using (status = 'active');

-- 2. Admins and managers can view all teams
create policy "All teams are viewable by admins and managers"
  on public.teams for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 3. Admins and managers can create teams
create policy "Admins and managers can create teams"
  on public.teams for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 4. Admins and managers can update teams
create policy "Admins and managers can update teams"
  on public.teams for update
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

-- 5. Team leads can update their own teams
create policy "Team leads can update their own teams"
  on public.teams for update
  to authenticated
  using (auth.uid() = team_lead_id)
  with check (auth.uid() = team_lead_id);

-- Create team_members table to manage team membership
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text check (role in ('member', 'lead', 'admin')) default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  left_at timestamp with time zone,
  unique(team_id, user_id)
);

-- Enable RLS for team_members
alter table public.team_members enable row level security;

-- Policies for team_members
-- 1. Everyone can view active team memberships
create policy "Active team memberships are viewable by authenticated users"
  on public.team_members for select
  to authenticated
  using (left_at is null);

-- 2. Admins and managers can view all team memberships
create policy "All team memberships are viewable by admins and managers"
  on public.team_members for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 3. Admins and managers can manage team memberships
create policy "Admins and managers can manage team memberships"
  on public.team_members for all
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

-- 4. Team leads can manage their own team memberships
create policy "Team leads can manage their own team memberships"
  on public.team_members for all
  to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_id
      and t.team_lead_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_id
      and t.team_lead_id = auth.uid()
    )
  );

-- 5. Users can view their own team memberships
create policy "Users can view their own team memberships"
  on public.team_members for select
  to authenticated
  using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp for teams
create or replace function public.handle_teams_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on teams update
create trigger on_teams_updated
  before update on public.teams
  for each row execute procedure public.handle_teams_updated_at();

-- Create team_projects table to manage projects assigned to teams
create table public.team_projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  team_id uuid references public.teams(id) on delete cascade not null,
  status text check (status in ('planning', 'active', 'on_hold', 'completed', 'cancelled')) default 'planning' not null,
  priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'medium' not null,
  start_date date,
  end_date date,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for team_projects
alter table public.team_projects enable row level security;

-- Policies for team_projects
-- 1. Everyone can view active team projects
create policy "Active team projects are viewable by authenticated users"
  on public.team_projects for select
  to authenticated
  using (status in ('planning', 'active', 'on_hold'));

-- 2. Admins and managers can view all team projects
create policy "All team projects are viewable by admins and managers"
  on public.team_projects for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 3. Admins and managers can manage team projects
create policy "Admins and managers can manage team projects"
  on public.team_projects for all
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

-- 4. Team leads can manage their own team projects
create policy "Team leads can manage their own team projects"
  on public.team_projects for all
  to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_id
      and t.team_lead_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_id
      and t.team_lead_id = auth.uid()
    )
  );

-- 5. Team members can view their team projects
create policy "Team members can view their team projects"
  on public.team_projects for select
  to authenticated
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_id
      and tm.user_id = auth.uid()
      and tm.left_at is null
    )
  );

-- Function to automatically update updated_at timestamp for team_projects
create or replace function public.handle_team_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on team_projects update
create trigger on_team_projects_updated
  before update on public.team_projects
  for each row execute procedure public.handle_team_projects_updated_at();