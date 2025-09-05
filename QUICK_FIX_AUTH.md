# Quick Fix for Authentication Issues

## Immediate Solution

1. **Navigate to Debug Page**
   ```
   http://localhost:3000/debug
   ```
   This page will help diagnose the exact issue.

2. **Run SQL Script**
   Copy and paste the contents of `FIX_LOGIN_INTEGRATION.sql` into your Supabase SQL Editor.

3. **Alternative: Disable RLS Temporarily**
   If you need to work immediately, run this in Supabase SQL Editor:
   ```sql
   -- DEVELOPMENT ONLY - Disable RLS
   DO $$ 
   DECLARE
     r RECORD;
   BEGIN
     FOR r IN (
       SELECT tablename 
       FROM pg_tables 
       WHERE schemaname = 'public'
     ) LOOP
       EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
     END LOOP;
   END $$;
   ```

4. **Clear Browser Cache**
   - Open Developer Tools (F12)
   - Go to Application tab
   - Clear Site Data

5. **Test Login**
   - Email: `dashboard@clika.com`
   - Password: `Dashboard2024!`

## Check if Authentication is Working

Run this in browser console while on dashboard:

```javascript
// Get current Supabase instance
const checkAuth = async () => {
  const { supabase } = await import('/src/services/supabase');
  
  // Check session
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Session:', session, 'Error:', error);
  
  // Try a simple query
  const { data, error: queryError } = await supabase
    .from('user_profile')
    .select('*')
    .limit(1);
    
  console.log('Query result:', data, 'Error:', queryError);
};

checkAuth();
```

## Most Common Fixes

1. **Wrong Supabase Project**
   - Verify URL in `.env` matches your Supabase project
   - Check anon key is from same project

2. **RLS Blocking Access**
   - Tables have RLS enabled but policies are incorrect
   - Run the SQL script to fix policies

3. **User Metadata Missing**
   - User exists but doesn't have admin role
   - SQL script updates user metadata

4. **Session Expired**
   - Clear browser storage and login again

## If Nothing Works

Create a new user with this SQL:

```sql
-- Create fresh admin user
INSERT INTO auth.users (
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
  '{"role": "admin"}'::jsonb,
  'authenticated',
  'authenticated'
) RETURNING id;

-- Disable RLS for testing
ALTER TABLE public.user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pack DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creative DISABLE ROW LEVEL SECURITY;
```

Then login with:
- Email: `admin@test.com`
- Password: `Admin123!`