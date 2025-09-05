# Fix Row Level Security (RLS) Policies for Admin Access

The "failed to fetch" error is likely caused by Row Level Security policies blocking admin access. Run these scripts in your Supabase SQL Editor to fix the issue.

## Step 1: Check Current RLS Status

First, let's see which tables have RLS enabled:

```sql
-- Check RLS status on all public tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Step 2: Create Admin Access Policies

Run this script to create proper admin access policies:

```sql
-- Disable RLS temporarily to add policies
ALTER TABLE public.user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pack DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creative DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.round DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creative ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Enable all access for admins" ON public.user_profile;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.content_item;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.content_pack;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.ad_campaign;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.ad_creative;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.session;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.round;

-- Create admin access policies for all tables
CREATE POLICY "Enable all access for admins" ON public.user_profile
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Enable all access for admins" ON public.content_item
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Enable all access for admins" ON public.content_pack
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Enable all access for admins" ON public.ad_campaign
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Enable all access for admins" ON public.ad_creative
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Enable all access for admins" ON public.session
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Enable all access for admins" ON public.round
  FOR ALL USING (
    auth.jwt() ->> 'email' IS NOT NULL AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
  );

-- Also create read policies for authenticated users (non-admins)
CREATE POLICY "Users can view content" ON public.content_item
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view campaigns" ON public.ad_campaign
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view content packs" ON public.content_pack
  FOR SELECT USING (auth.role() = 'authenticated');
```

## Step 3: Alternative - Disable RLS Completely (Development Only)

If you're just developing locally and don't need RLS, you can disable it entirely:

```sql
-- CAUTION: Only use this for development!
ALTER TABLE public.user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pack DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creative DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.round DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag DISABLE ROW LEVEL SECURITY;
```

## Step 4: Verify Your User's Admin Role

Check that your user actually has the admin role:

```sql
-- Check your user's role
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'dashboard@clika.com';
```

## Step 5: Test the Connection

After running these scripts, test if the dashboard works:

1. Log out of the dashboard
2. Log back in with your admin credentials
3. Check if the home page loads without "failed to fetch" errors

## Troubleshooting

If you still see errors:

1. **Check browser console** (F12) for specific error messages
2. **Check network tab** to see which API calls are failing
3. **Clear browser cache** and local storage
4. **Restart your development server**

## Understanding the Issue

The "failed to fetch" error happens when:
- RLS policies block access to tables
- The user's role is not properly recognized in the JWT
- The policies check for role in the wrong JWT field

The policies above check both `user_metadata` and `raw_user_meta_data` fields to ensure compatibility.