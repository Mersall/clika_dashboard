# Create Admin User for CLIKA Dashboard

This guide will help you create an admin user for the CLIKA dashboard.

## Login Credentials

After running the script below, you can login with:

- **Email:** `dashboard@clika.com`
- **Password:** `Dashboard2024!`

## SQL Script

Copy and run this entire script in your [Supabase SQL Editor](https://supabase.com/dashboard/project/iwfgkwjqwxqbcjimqmxv/sql/new):

```sql
-- Delete existing user if any (to avoid conflicts)
DELETE FROM public.user_profile WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'dashboard@clika.com'
);
DELETE FROM auth.users WHERE email = 'dashboard@clika.com';

-- Create a new admin user
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
);

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
WHERE email = 'dashboard@clika.com';

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.email_confirmed_at,
  u.created_at,
  p.display_name
FROM auth.users u
LEFT JOIN public.user_profile p ON u.id = p.user_id
WHERE u.email = 'dashboard@clika.com';
```

## Alternative Method - Create Multiple Users

If you want to create multiple users with different roles, use this script:

```sql
-- Clean up any existing test users
DELETE FROM public.user_profile WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'admin@clika.com',
    'editor@clika.com',
    'reviewer@clika.com',
    'user@clika.com'
  )
);

DELETE FROM auth.users WHERE email IN (
  'admin@clika.com',
  'editor@clika.com', 
  'reviewer@clika.com',
  'user@clika.com'
);

-- Create multiple users with different roles
WITH new_users AS (
  INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', 'admin@clika.com', crypt('Admin123!', gen_salt('bf')), now(), 
     '{"provider": "email", "providers": ["email"]}'::jsonb, '{"role": "admin"}'::jsonb, 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000000', 'editor@clika.com', crypt('Editor123!', gen_salt('bf')), now(),
     '{"provider": "email", "providers": ["email"]}'::jsonb, '{"role": "editor"}'::jsonb, 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000000', 'reviewer@clika.com', crypt('Reviewer123!', gen_salt('bf')), now(),
     '{"provider": "email", "providers": ["email"]}'::jsonb, '{"role": "reviewer"}'::jsonb, 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000000', 'user@clika.com', crypt('User123!', gen_salt('bf')), now(),
     '{"provider": "email", "providers": ["email"]}'::jsonb, '{"role": "user"}'::jsonb, 'authenticated', 'authenticated')
  RETURNING id, email, raw_user_meta_data->>'role' as role
)
-- Create profiles for all users
INSERT INTO public.user_profile (user_id, display_name, geo_consent, personalized_ads)
SELECT 
  id,
  CASE role
    WHEN 'admin' THEN 'Admin User'
    WHEN 'editor' THEN 'Editor User'
    WHEN 'reviewer' THEN 'Reviewer User'
    ELSE 'Regular User'
  END,
  true,
  true
FROM new_users;

-- Show all created users
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as role,
  p.display_name,
  CASE u.email
    WHEN 'admin@clika.com' THEN 'Password: Admin123!'
    WHEN 'editor@clika.com' THEN 'Password: Editor123!'
    WHEN 'reviewer@clika.com' THEN 'Password: Reviewer123!'
    WHEN 'user@clika.com' THEN 'Password: User123!'
  END as password
FROM auth.users u
JOIN public.user_profile p ON u.id = p.user_id
WHERE u.email IN ('admin@clika.com', 'editor@clika.com', 'reviewer@clika.com', 'user@clika.com');
```

## Troubleshooting

### If you get "duplicate key" errors:
Run this cleanup script first:
```sql
DELETE FROM public.user_profile WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'dashboard@clika.com'
);
DELETE FROM auth.users WHERE email = 'dashboard@clika.com';
```

### If login still doesn't work:
1. Make sure you've restarted your development server after the environment variable changes
2. Clear your browser's local storage and cookies for localhost:3000
3. Check the browser console for any errors
4. Verify the user exists by running:
   ```sql
   SELECT email, created_at FROM auth.users WHERE email = 'dashboard@clika.com';
   ```

## Dashboard Features

Once logged in as admin, you'll have access to:
- **Content Management** - Create and manage game content
- **Content Packs** - Organize content into packs with workflow states
- **Campaigns** - Manage advertising campaigns and creatives
- **Analytics** - View game performance and usage metrics
- **Users** - Manage user accounts and permissions
- **Settings** - Configure dashboard settings

## User Roles

- **Admin** - Full access to all features
- **Editor** - Can manage content and campaigns
- **Reviewer** - Can review and approve content
- **User** - Basic access only