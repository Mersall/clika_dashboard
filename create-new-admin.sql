-- Create a new admin user for the dashboard
-- Run this in your Supabase SQL Editor

-- First, let's create the user with a simpler approach
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'dashboard@clika.com',
  crypt('Dashboard2024!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "admin", "display_name": "Dashboard Admin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now()
RETURNING id;

-- Create the user profile
INSERT INTO public.user_profile (
  user_id,
  display_name,
  geo_consent,
  personalized_ads
)
SELECT 
  id,
  'Dashboard Admin',
  true,
  true
FROM auth.users 
WHERE email = 'dashboard@clika.com'
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name;

-- Verify the user was created
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'dashboard@clika.com';