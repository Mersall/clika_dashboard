-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profile 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profile;

-- Recreate policies with admin access
CREATE POLICY "Users can view own profile" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profile
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a view that joins auth.users with user_profile for admins
CREATE OR REPLACE VIEW all_users AS
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as auth_created_at,
  up.display_name,
  up.city_id,
  up.country_code,
  up.geo_consent,
  up.personalized_ads,
  up.role,
  up.created_at,
  up.updated_at
FROM auth.users u
LEFT JOIN user_profile up ON u.id = up.user_id;

-- Grant access to the view
GRANT SELECT ON all_users TO authenticated;