-- Create incidents table
create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium' not null,
  status text check (status in ('open', 'investigating', 'resolved', 'closed')) default 'open' not null,
  impact text check (impact in ('none', 'low', 'medium', 'high', 'critical')) default 'none' not null,
  urgency text check (urgency in ('low', 'medium', 'high', 'critical')) default 'medium' not null,
  category text,
  root_cause_analysis text,
  resolution_summary text,
  resolution_steps text[],
  affected_systems text[],
  affected_users integer default 0,
  estimated_downtime_minutes integer,
  actual_downtime_minutes integer,
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  created_by uuid references public.users(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.incidents enable row level security;

-- Policies for incidents
-- 1. Everyone can view incidents (or maybe restrict to authenticated users)
create policy "Incidents are viewable by authenticated users"
  on public.incidents for select
  to authenticated
  using (true);

-- 2. Authenticated users can create incidents
create policy "Authenticated users can create incidents"
  on public.incidents for insert
  to authenticated
  with check (auth.uid() = created_by);

-- 3. Incident creators, assignees, and admins/managers can update incidents
create policy "Users can update incidents they created or are assigned to"
  on public.incidents for update
  to authenticated
  using (auth.uid() = created_by or auth.uid() = assigned_to);

-- Create incident-tickets relationship table
create table public.incident_tickets (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incidents(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(incident_id, ticket_id)
);

-- Enable RLS for incident_tickets
alter table public.incident_tickets enable row level security;

-- Policies for incident_tickets
create policy "Incident tickets are viewable by authenticated users"
  on public.incident_tickets for select
  to authenticated
  using (true);

create policy "Users can create incident tickets"
  on public.incident_tickets for insert
  to authenticated
  with check (true);

-- Create incident history/audit trail table
create table public.incident_history (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incidents(id) on delete cascade not null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for incident_history
alter table public.incident_history enable row level security;

-- Policies for incident_history
create policy "Incident history is viewable by authenticated users"
  on public.incident_history for select
  to authenticated
  using (true);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_incident_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on incident update
create trigger on_incident_updated
  before update on public.incidents
  for each row execute procedure public.handle_incident_updated_at();

-- Function to log incident changes
create or replace function public.log_incident_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' then
    insert into public.incident_history (incident_id, action, old_values, new_values, changed_by)
    values (
      new.id,
      'UPDATE',
      row_to_json(old),
      row_to_json(new),
      auth.uid()
    );
  elsif TG_OP = 'INSERT' then
    insert into public.incident_history (incident_id, action, new_values, changed_by)
    values (
      new.id,
      'CREATE',
      row_to_json(new),
      auth.uid()
    );
  end if;
  return coalesce(new, old);
end;
$$;

-- Trigger to log incident changes
create trigger on_incident_change
  after insert or update on public.incidents
  for each row execute procedure public.log_incident_changes();