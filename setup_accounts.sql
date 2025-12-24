-- SQL Script untuk membuat akun test dengan berbagai role
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- 1. Hapus akun yang sudah ada (jika ada)
DELETE FROM public.users WHERE email LIKE '%@kcic.com';
DELETE FROM auth.users WHERE email LIKE '%@kcic.com';

-- 2. Buat fungsi helper untuk membuat user
CREATE OR REPLACE FUNCTION create_test_user(
  email_param TEXT,
  password_param TEXT,
  full_name_param TEXT,
  role_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Insert ke auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    email_param,
    crypt(password_param, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', full_name_param),
    false,
    now(),
    now()
  ) RETURNING id INTO user_id;
  
  -- Insert ke public.users dengan role yang benar
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (user_id, email_param, full_name_param, role_param, now(), now());
  
  RETURN user_id;
END;
$$;

-- 3. Buat akun-akun test
SELECT create_test_user('admin@kcic.com', 'admin123', 'Admin KCIC', 'admin');
SELECT create_test_user('manager@kcic.com', 'manager123', 'Manager KCIC', 'manager');
SELECT create_test_user('worker@kcic.com', 'worker123', 'Worker KCIC', 'worker');
SELECT create_test_user('employee@kcic.com', 'employee123', 'Employee KCIC', 'employee');

-- 4. Tampilkan hasil
SELECT 
  u.email,
  u.full_name,
  u.role,
  u.created_at
FROM public.users u
WHERE u.email LIKE '%@kcic.com'
ORDER BY u.role;

-- 5. Hapus fungsi helper (opsional)
-- DROP FUNCTION IF EXISTS create_test_user(TEXT, TEXT, TEXT, TEXT);