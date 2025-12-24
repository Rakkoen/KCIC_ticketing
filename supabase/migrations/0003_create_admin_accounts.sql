-- Create admin accounts for testing purposes
-- These accounts will have different roles to test the system functionality

-- Insert Admin account
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
  'admin@kcic.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  null,
  null,
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin KCIC"}',
  false,
  now(),
  now(),
  ''
);

-- Insert Manager account
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

-- Insert Worker account
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

-- Insert Employee account
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
  'employee@kcic.com',
  crypt('employee123', gen_salt('bf')),
  now(),
  null,
  null,
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Employee KCIC"}',
  false,
  now(),
  now(),
  ''
);

-- Update the users table with appropriate roles
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@kcic.com';

UPDATE public.users 
SET role = 'manager' 
WHERE email = 'manager@kcic.com';

UPDATE public.users 
SET role = 'worker' 
WHERE email = 'worker@kcic.com';

UPDATE public.users 
SET role = 'employee' 
WHERE email = 'employee@kcic.com';