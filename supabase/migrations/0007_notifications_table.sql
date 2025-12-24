-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  type text check (type in ('info', 'success', 'warning', 'error', 'ticket', 'incident', 'team', 'system')) default 'info' not null,
  read boolean default false not null,
  user_id uuid references public.users(id) on delete cascade not null,
  related_entity_type text check (related_entity_type in ('ticket', 'incident', 'team', 'user', 'knowledge', 'project')) default null,
  related_entity_id uuid,
  action_url text,
  metadata jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  read_at timestamp with time zone
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;

-- Policies for notifications
-- 1. Users can view their own notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

-- 2. Users can insert their own notifications (for system-generated notifications)
create policy "System can create notifications for users"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() = user_id or 
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- 3. Users can update their own notifications (mark as read)
create policy "Users can update their own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Admins can manage all notifications
create policy "Admins can manage all notifications"
  on public.notifications for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Create notification_preferences table to manage user notification settings
create table public.notification_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  email_notifications boolean default true not null,
  push_notifications boolean default true not null,
  ticket_notifications boolean default true not null,
  incident_notifications boolean default true not null,
  team_notifications boolean default true not null,
  system_notifications boolean default true not null,
  notification_frequency text check (notification_frequency in ('immediate', 'hourly', 'daily', 'weekly')) default 'immediate' not null,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS for notification_preferences
alter table public.notification_preferences enable row level security;

-- Policies for notification_preferences
-- 1. Users can view their own preferences
create policy "Users can view their own notification preferences"
  on public.notification_preferences for select
  to authenticated
  using (auth.uid() = user_id);

-- 2. Users can update their own preferences
create policy "Users can update their own notification preferences"
  on public.notification_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Users can insert their own preferences
create policy "Users can insert their own notification preferences"
  on public.notification_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 4. Admins can manage all preferences
create policy "Admins can manage all notification preferences"
  on public.notification_preferences for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp for notification_preferences
create or replace function public.handle_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function on notification_preferences update
create trigger on_notification_preferences_updated
  before update on public.notification_preferences
  for each row execute procedure public.handle_notification_preferences_updated_at();

-- Function to create a notification for a user
create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text default 'info',
  p_related_entity_type text default null,
  p_related_entity_id uuid default null,
  p_action_url text default null,
  p_metadata jsonb default null,
  p_expires_at timestamp with time zone default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (
    user_id, title, message, type, related_entity_type, related_entity_id, action_url, metadata, expires_at
  )
  values (
    p_user_id, p_title, p_message, p_type, p_related_entity_type, p_related_entity_id, p_action_url, p_metadata, p_expires_at
  )
  returning id into notification_id;
  
  return notification_id;
end;
$$;

-- Function to create notifications for multiple users
create or replace function public.create_bulk_notifications(
  p_user_ids uuid[],
  p_title text,
  p_message text,
  p_type text default 'info',
  p_related_entity_type text default null,
  p_related_entity_id uuid default null,
  p_action_url text default null,
  p_metadata jsonb default null,
  p_expires_at timestamp with time zone default null
)
returns table(notification_id uuid)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  insert into public.notifications (
    user_id, title, message, type, related_entity_type, related_entity_id, action_url, metadata, expires_at
  )
  select 
    user_id, p_title, p_message, p_type, p_related_entity_type, p_related_entity_id, p_action_url, p_metadata, p_expires_at
  from unnest(p_user_ids) as user_id
  returning id;
end;
$$;

-- Function to mark notification as read
create or replace function public.mark_notification_read(
  p_notification_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update public.notifications
  set read = true, read_at = now()
  where id = p_notification_id and user_id = p_user_id;
  
  return found;
end;
$$;

-- Function to mark all notifications as read for a user
create or replace function public.mark_all_notifications_read(
  p_user_id uuid
)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  count_updated integer;
begin
  update public.notifications
  set read = true, read_at = now()
  where user_id = p_user_id and read = false;
  
  get diagnostics count_updated = row_count;
  return count_updated;
end;
$$;