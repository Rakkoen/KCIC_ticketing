-- Query untuk melihat semua user yang ada di database
-- Jalankan query ini di Supabase Dashboard > SQL Editor

-- 1. Lihat semua user di auth.users (authentication)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Lihat semua user di public.users (dengan role)
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
FROM public.users 
ORDER BY created_at DESC;

-- 3. Join query untuk melihat lengkap data user
SELECT 
  u.id as auth_id,
  u.email,
  u.created_at as auth_created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  p.id as profile_id,
  p.full_name,
  p.role,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Cek user dengan email domain @kcic.com
SELECT 
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email LIKE '%@kcic.com'
ORDER BY p.role, u.email;

-- 5. Summary query untuk melihat statistik user
SELECT 
  p.role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN u.email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_count,
  MAX(u.last_sign_in_at) as last_login
FROM public.users p
LEFT JOIN auth.users u ON p.id = u.id
GROUP BY p.role
ORDER BY p.role;