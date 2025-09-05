# Make Any User Admin - CLIKA Dashboard

This script allows you to grant admin privileges to any existing user in your CLIKA dashboard.

## Quick Script - Make User Admin by Email

Replace `user@example.com` with the actual user's email address:

```sql
-- Update user role to admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'user@example.com';

-- Verify the update
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  updated_at
FROM auth.users 
WHERE email = 'user@example.com';
```

## Interactive Script - List Users and Choose

This script lists all users first, then you can update a specific one:

```sql
-- Step 1: List all users with their current roles
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as current_role,
  p.display_name,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_profile p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- Step 2: Copy the email or ID of the user you want to make admin
-- Then run this query with the correct email:
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
  ),
  updated_at = now()
WHERE email = 'YOUR_USER_EMAIL_HERE';
```

## Make User Admin by User ID

If you have the user's ID instead of email:

```sql
-- Update by user ID
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE id = 'YOUR-USER-ID-HERE';
```

## Bulk Update - Make Multiple Users Admin

To make multiple users admin at once:

```sql
-- Update multiple users by email
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
);

-- Verify the updates
SELECT 
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
);
```

## Change User Roles - All Options

Script to change a user to any role (admin, editor, reviewer, or user):

```sql
-- Change to different roles
-- Replace 'user@example.com' with the target email
-- Replace 'admin' with desired role: 'admin', 'editor', 'reviewer', or 'user'

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb  -- Change this to '"editor"', '"reviewer"', or '"user"' as needed
)
WHERE email = 'user@example.com';
```

## View All Users and Their Roles

To see all users and their current roles:

```sql
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'user') as role,
  p.display_name,
  u.created_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Unconfirmed'
  END as email_status
FROM auth.users u
LEFT JOIN public.user_profile p ON u.id = p.user_id
ORDER BY 
  CASE COALESCE(u.raw_user_meta_data->>'role', 'user')
    WHEN 'admin' THEN 1
    WHEN 'editor' THEN 2
    WHEN 'reviewer' THEN 3
    ELSE 4
  END,
  u.created_at DESC;
```

## Important Notes

1. **Immediate Effect**: Role changes take effect immediately. The user may need to log out and log back in to see the changes.

2. **Role Hierarchy**:
   - **Admin**: Full access to all features
   - **Editor**: Can manage content and campaigns
   - **Reviewer**: Can review and approve content  
   - **User**: Basic access only

3. **Safety**: Always verify the user's email before granting admin privileges.

4. **Audit Trail**: Consider keeping track of who was given admin access and when for security purposes.