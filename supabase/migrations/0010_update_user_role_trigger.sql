-- Update user role trigger to handle role from registration
-- This migration ensures the handle_new_user function properly uses role from user metadata

-- Drop the existing trigger
drop trigger if exists on_auth_user_created on auth.users;

-- Update the function to handle role from user metadata
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
  
  -- Validate role
  if user_role not in ('admin', 'manager', 'technician', 'employee') then
    user_role := 'employee';
  end if;
  
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', user_role);
  return new;
end;
$$;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update existing users without role (set default to employee)
update public.users 
set role = 'employee' 
where role is null or role = '';

-- Update existing users to match their auth metadata if available
update public.users u
set role = COALESCE(a.raw_user_meta_data->>'role', 'employee')
from auth.users a
where u.id = a.id 
and a.raw_user_meta_data->>'role' is not null;