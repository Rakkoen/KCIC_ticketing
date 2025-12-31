-- DIAGNOSTIC QUERY - Run this to check current database state
-- Execute this in Supabase SQL Editor to see what's wrong

-- 1. Check if station constraint exists and what values it allows
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.tickets'::regclass
AND conname LIKE '%station%';

-- 2. Check current user
SELECT auth.uid() as current_user_id;

-- 3. Check if current user exists in users table
SELECT id, email, role, full_name
FROM public.users
WHERE id = auth.uid();

-- 4. Check RLS policies on tickets table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'tickets';

-- 5. Test if we can insert (this will show the actual error)
-- Replace 'YOUR_USER_ID' with the user ID from query #2
/*
INSERT INTO public.tickets (
    title,
    description,
    priority,
    status,
    station,
    created_by
) VALUES (
    'Test Ticket',
    'Test Description',
    'medium',
    'open',
    'Halim',
    'YOUR_USER_ID'
) RETURNING *;
*/
