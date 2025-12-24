-- Query untuk membuat user manager dan worker
-- Jalankan query ini sebelum menjalankan seed data tickets dan incidents

-- Insert Manager account ke auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manager@kcic.com',
  crypt('manager123', gen_salt('bf')),
  now(),
  null,
  null,
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Manager KCIC"}',
  false,
  now(),
  now(),
  ''
);

-- Insert Worker account ke auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'worker@kcic.com',
  crypt('worker123', gen_salt('bf')),
  now(),
  null,
  null,
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Worker KCIC"}',
  false,
  now(),
  now(),
  ''
);

-- Update users table dengan role yang sesuai
-- Perlu sedikit delay untuk memastikan trigger handle_new_user sudah selesai
DO $$
BEGIN
  -- Tunggu 1 detik untuk memastikan trigger selesai
  PERFORM pg_sleep(1);
  
  -- Update role untuk manager
  UPDATE public.users 
  SET role = 'admin' 
  WHERE email = 'admin@kcic.com';
  
  -- Update role untuk manager
  UPDATE public.users 
  SET role = 'manager' 
  WHERE email = 'manager@kcic.com';
  
  -- Update role untuk worker
  UPDATE public.users 
  SET role = 'worker' 
  WHERE email = 'worker@kcic.com';
  
  -- Update role untuk employee
  UPDATE public.users 
  SET role = 'employee' 
  WHERE email = 'employee@kcic.com';
END $$;

-- Verifikasi user yang sudah dibuat
SELECT 
  id,
  email,
  role,
  full_name,
  created_at
FROM public.users 
WHERE email IN ('admin@kcic.com', 'manager@kcic.com', 'worker@kcic.com', 'employee@kcic.com')
ORDER BY role;

-- Catatan:
-- 1. Admin account: admin@kcic.com / admin123
-- 2. Manager account: manager@kcic.com / manager123  
-- 3. Worker account: worker@kcic.com / worker123
-- 4. Employee account: employee@kcic.com / employee123

-- Setelah menjalankan query ini, Anda bisa:
-- 1. Login dengan salah satu akun di atas
-- 2. Jalankan seed data untuk tickets dan incidents
-- 3. Test aplikasi dengan data contoh