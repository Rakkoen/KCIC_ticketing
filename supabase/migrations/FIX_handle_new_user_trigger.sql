-- ========================================
-- FIX: Handle New User Trigger for Technician Role
-- Run this to update existing trigger
-- ========================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle role from user metadata (with technician)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
  -- Get role from user_metadata, default to 'employee' if not specified
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
  
  -- Validate role (NOW WITH TECHNICIAN!)
  IF user_role NOT IN ('admin', 'manager', 'technician', 'employee') THEN
    user_role := 'employee';
  END IF;
  
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', user_role);
  RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verification
-- SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
