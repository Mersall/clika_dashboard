-- First, let's check if the user exists and get their ID
-- You'll need to run this after confirming your email

-- Find the user by email
SELECT id, email FROM auth.users WHERE email = 'admin@clika.com';

-- Once you have the user_id from above, insert/update the user_profile
-- Replace 'USER_ID_HERE' with the actual ID from the query above
INSERT INTO user_profile (user_id, display_name, role, created_at, updated_at)
VALUES ('USER_ID_HERE', 'Admin User', 'admin', NOW(), NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  display_name = 'Admin User',
  updated_at = NOW();