-- Add role column to user_profile if it doesn't exist
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'editor', 'reviewer', 'advertiser', 'analyst'));

-- Update existing users to have a default role
UPDATE user_profile 
SET role = 'reviewer' 
WHERE role IS NULL;

-- Make the dashboard user an admin
UPDATE user_profile
SET role = 'admin'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'dashboard@clika.com'
);

-- Ensure RLS is properly configured for user_profile
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);