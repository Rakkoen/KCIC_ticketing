
-- Create a table for public profiles if you want to store extra data
-- This table mirrors the auth.users table
create table public.users (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text check (role in ('admin', 'manager', 'worker', 'employee')) default 'employee',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

-- Enable RLS
alter table public.users enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    user_role text;
begin
  -- Get role from user_metadata, default to 'employee' if not specified
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
  
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', user_role);
  return new;
end;
$$;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
