-- Create analytics_reports table
create table public.analytics_reports (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text check (type in ('ticket', 'incident', 'team', 'user', 'knowledge', 'custom')) default 'custom' not null,
  query text not null,
  parameters jsonb default '{}'::jsonb,
  schedule text check (schedule in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand')) default 'on_demand' not null,
  is_active boolean default true not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for analytics_reports
alter table public.analytics_reports enable row level security;

-- Policies for analytics_reports
-- 1. Admins and managers can view all reports
create policy "Analytics reports are viewable by admins and managers"
  on public.analytics_reports for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 2. Users can view reports they created
create policy "Users can view their own analytics reports"
  on public.analytics_reports for select
  to authenticated
  using (auth.uid() = created_by);

-- 3. Admins and managers can create reports
create policy "Admins and managers can create analytics reports"
  on public.analytics_reports for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 4. Admins and managers can update reports
create policy "Admins and managers can update analytics reports"
  on public.analytics_reports for update
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

-- 5. Users can update their own reports
create policy "Users can update their own analytics reports"
  on public.analytics_reports for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- Create analytics_snapshots table to store report results
create table public.analytics_snapshots (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references public.analytics_reports(id) on delete cascade not null,
  data jsonb not null,
  report_period_start timestamp with time zone,
  report_period_end timestamp with time zone,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  generated_by uuid references public.users(id) on delete set null
);

-- Enable RLS for analytics_snapshots
alter table public.analytics_snapshots enable row level security;

-- Policies for analytics_snapshots
-- 1. Admins and managers can view all snapshots
create policy "Analytics snapshots are viewable by admins and managers"
  on public.analytics_snapshots for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 2. Users can view snapshots of their own reports
create policy "Users can view snapshots of their own reports"
  on public.analytics_snapshots for select
  to authenticated
  using (
    exists (
      select 1 from public.analytics_reports ar
      where ar.id = report_id
      and ar.created_by = auth.uid()
    )
  );

-- Create dashboard_widgets table for custom dashboard widgets
create table public.dashboard_widgets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('chart', 'metric', 'table', 'list', 'custom')) default 'metric' not null,
  data_source text check (data_source in ('tickets', 'incidents', 'team', 'knowledge', 'custom')) default 'custom' not null,
  query text,
  config jsonb default '{}'::jsonb,
  position_x integer default 0,
  position_y integer default 0,
  width integer default 4,
  height integer default 2,
  is_visible boolean default true not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for dashboard_widgets
alter table public.dashboard_widgets enable row level security;

-- Policies for dashboard_widgets
-- 1. Admins and managers can view all widgets
create policy "Dashboard widgets are viewable by admins and managers"
  on public.dashboard_widgets for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 2. Users can view widgets they created
create policy "Users can view their own dashboard widgets"
  on public.dashboard_widgets for select
  to authenticated
  using (auth.uid() = created_by);

-- 3. Admins and managers can create widgets
create policy "Admins and managers can create dashboard widgets"
  on public.dashboard_widgets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 4. Admins and managers can update widgets
create policy "Admins and managers can update dashboard widgets"
  on public.dashboard_widgets for update
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

-- 5. Users can update their own widgets
create policy "Users can update their own dashboard widgets"
  on public.dashboard_widgets for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- Create activity_logs table for audit trail
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  entity_type text check (entity_type in ('ticket', 'incident', 'user', 'team', 'knowledge', 'project', 'report', 'widget')) not null,
  entity_id uuid not null,
  action text check (action in ('create', 'update', 'delete', 'view', 'assign', 'close', 'reopen', 'comment', 'upload')) not null,
  old_values jsonb,
  new_values jsonb,
  user_id uuid references public.users(id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for activity_logs
alter table public.activity_logs enable row level security;

-- Policies for activity_logs
-- 1. Admins and managers can view all activity logs
create policy "Activity logs are viewable by admins and managers"
  on public.activity_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 2. Users can view their own activity logs
create policy "Users can view their own activity logs"
  on public.activity_logs for select
  to authenticated
  using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp for analytics_reports
create or replace function public.handle_analytics_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on analytics_reports update
create trigger on_analytics_reports_updated
  before update on public.analytics_reports
  for each row execute procedure public.handle_analytics_reports_updated_at();

-- Function to automatically update updated_at timestamp for dashboard_widgets
create or replace function public.handle_dashboard_widgets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on dashboard_widgets update
create trigger on_dashboard_widgets_updated
  before update on public.dashboard_widgets
  for each row execute procedure public.handle_dashboard_widgets_updated_at();

-- Function to log activity
create or replace function public.log_activity(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_user_id uuid default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  activity_id uuid;
begin
  insert into public.activity_logs (
    entity_type, entity_id, action, old_values, new_values, user_id
  )
  values (
    p_entity_type, p_entity_id, p_action, p_old_values, p_new_values, p_user_id
  )
  returning id into activity_id;
  
  return activity_id;
end;
$$;