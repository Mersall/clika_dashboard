-- Create a test user with a known password for development
-- This should be run in Supabase SQL editor

-- First, let's check if test user exists
SELECT id, email, confirmed_at FROM auth.users WHERE email = 'test@clika.com';

-- Update the test user to be confirmed (if not already)
UPDATE auth.users 
SET 
    confirmed_at = COALESCE(confirmed_at, NOW()),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'test@clika.com';

-- Check if user profile exists
SELECT * FROM public.user_profile WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@clika.com');

-- Create user profile if it doesn't exist
INSERT INTO public.user_profile (user_id, display_name, role, geo_consent, personalized_ads)
SELECT 
    id,
    'Test User',
    'admin',
    true,
    true
FROM auth.users 
WHERE email = 'test@clika.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- Note: You'll need to use Supabase dashboard to reset the password for test@clika.com
-- Or use the auth.users table update if you have the proper permissions