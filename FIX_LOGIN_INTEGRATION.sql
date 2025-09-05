-- Fix Login Integration Issues
-- Run these commands in your Supabase SQL Editor

-- Step 1: Check current user and fix metadata
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'dashboard@clika.com';
    
    IF user_id IS NOT NULL THEN
        -- Update user metadata to ensure admin role is properly set
        UPDATE auth.users
        SET 
            raw_user_meta_data = jsonb_set(
                COALESCE(raw_user_meta_data, '{}'::jsonb),
                '{role}',
                '"admin"'
            ),
            raw_app_meta_data = jsonb_set(
                COALESCE(raw_app_meta_data, '{}'::jsonb),
                '{role}',
                '"admin"'
            )
        WHERE id = user_id;
        
        RAISE NOTICE 'Updated user metadata for dashboard@clika.com';
    ELSE
        RAISE NOTICE 'User dashboard@clika.com not found';
    END IF;
END $$;

-- Step 2: Create a function to check auth context
CREATE OR REPLACE FUNCTION check_auth_context()
RETURNS TABLE (
    current_user_id uuid,
    current_user_email text,
    current_user_role text,
    jwt_role text,
    is_authenticated boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as current_user_id,
        auth.jwt() ->> 'email' as current_user_email,
        auth.jwt() -> 'user_metadata' ->> 'role' as current_user_role,
        auth.jwt() ->> 'role' as jwt_role,
        (auth.role() = 'authenticated') as is_authenticated;
END;
$$;

-- Step 3: Create simple public policies that work
-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create new simplified policies
-- User profiles - everyone can read their own, admins can do everything
CREATE POLICY "Users can read own profile" ON public.user_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on user_profile" ON public.user_profile
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Content items - authenticated users can read, admins can do everything  
CREATE POLICY "Authenticated users can read content" ON public.content_item
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage content" ON public.content_item
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Content packs - same as content items
CREATE POLICY "Authenticated users can read packs" ON public.content_pack
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage packs" ON public.content_pack
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Ad campaigns - authenticated can read, admins can manage
CREATE POLICY "Authenticated users can read campaigns" ON public.ad_campaign
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage campaigns" ON public.ad_campaign
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Ad creatives - same as campaigns
CREATE POLICY "Authenticated users can read creatives" ON public.ad_creative
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage creatives" ON public.ad_creative
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Sessions and rounds - authenticated can read, admins can manage
CREATE POLICY "Authenticated users can read sessions" ON public.session
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sessions" ON public.session
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

CREATE POLICY "Authenticated users can read rounds" ON public.round
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage rounds" ON public.round
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Game config and feature flags - only admins
CREATE POLICY "Admins can manage game_config" ON public.game_config
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage feature_flag" ON public.feature_flag
    FOR ALL USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin'
    );

-- Step 4: Grant proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 5: Test the auth context
SELECT * FROM check_auth_context();

-- Step 6: Verify the user exists with correct metadata
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as user_role,
    raw_app_meta_data->>'role' as app_role,
    created_at
FROM auth.users 
WHERE email = 'dashboard@clika.com';

-- If everything looks good, you should be able to login!