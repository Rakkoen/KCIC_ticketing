-- Migration: Update role 'worker' to 'technician'
-- Priority 1: RBAC Role Management
-- Date: 2026-01-06

-- Step 1: Update existing users with 'worker' role to 'technician'
UPDATE public.users 
SET role = 'technician', updated_at = NOW()
WHERE role = 'worker';

-- Step 2: Update the role constraint to use new role name
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'technician', 'employee'));

-- Step 3: Update any existing test data or seed data
UPDATE public.users 
SET updated_at = NOW()
WHERE role IN ('admin', 'manager', 'technician', 'employee');

-- Verification query (run this to check)
-- SELECT role, COUNT(*) as count FROM public.users GROUP BY role;
