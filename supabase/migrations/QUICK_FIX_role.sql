-- ========================================
-- QUICK FIX: Update Role Constraint Only
-- Run this first to fix registration issue
-- ========================================

-- Step 1: Update existing worker users to technician
UPDATE public.users 
SET role = 'technician', updated_at = NOW()
WHERE role = 'worker';

-- Step 2: Drop old constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add new constraint with technician
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'technician', 'employee'));

-- Verify
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'users_role_check';
