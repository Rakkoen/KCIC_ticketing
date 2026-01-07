-- ========================================
-- USER DELETION SYNC - Auth & Public Users
-- Ensures auth.users and public.users stay in sync
-- ========================================

-- ========================================
-- PART 1: Trigger to Sync Deletion
-- When public.users deleted → auto delete auth.users
-- ========================================

-- Create function to delete auth user when public user deleted
CREATE OR REPLACE FUNCTION delete_auth_user_on_public_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from auth.users when public.users is deleted
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_delete_auth_user ON public.users;

-- Create trigger
CREATE TRIGGER trigger_delete_auth_user
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_public_delete();

-- ========================================
-- PART 2: Trigger to Auto-Create Public User on Registration
-- When auth.users created → auto create public.users
-- ========================================

-- Create function to create public user when auth user registered
CREATE OR REPLACE FUNCTION create_public_user_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users when someone registers
  INSERT INTO public.users (id, email, role, full_name, availability_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'), -- Default role from metadata or 'employee'
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- Use metadata or email
    'offline'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate if already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_create_public_user ON auth.users;

-- Create trigger
CREATE TRIGGER trigger_create_public_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_public_user_on_signup();

-- ========================================
-- PART 3: Cascade Delete from Auth to Public
-- When auth.users deleted → auto delete public.users
-- ========================================

-- Create function to delete public user when auth user deleted
CREATE OR REPLACE FUNCTION delete_public_user_on_auth_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from public.users when auth.users is deleted
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_delete_public_user ON auth.users;

-- Create trigger
CREATE TRIGGER trigger_delete_public_user
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION delete_public_user_on_auth_delete();

-- ========================================
-- VERIFICATION
-- ========================================

-- Check triggers
-- SELECT tgname, tgrelid::regclass 
-- FROM pg_trigger 
-- WHERE tgname IN ('trigger_delete_auth_user', 'trigger_create_public_user', 'trigger_delete_public_user');

-- Test deletion sync:
-- 1. Delete user from public.users → should auto-delete from auth.users
-- 2. Delete user from auth.users → should auto-delete from public.users
-- 3. Register new user → should auto-create in public.users
