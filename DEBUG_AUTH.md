# Debug Authentication Issues

## Step 1: Add Debug Logging

Add this temporary debug code to your `AuthContext.tsx` to see what's happening:

```typescript
// In AuthContext.tsx, update the useEffect to add logging:
useEffect(() => {
  // Normal auth flow
  console.log('🔍 Starting auth check...');
  
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('🔍 Get session result:', { session, error });
    
    if (session?.user) {
      console.log('🔍 User data:', {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        app_metadata: session.user.app_metadata,
      });
    }
    
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔍 Auth state changed:', event, session);
    setSession(session);
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

// Also update the signIn function:
const signIn = async (email: string, password: string) => {
  console.log('🔍 Attempting sign in with:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('🔍 Sign in result:', { data, error });
  
  if (error) throw error;
  navigate('/');
};
```

## Step 2: Check Browser Console

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Clear the console
4. Try to login
5. Look for the debug messages starting with 🔍

## Step 3: Test Authentication Directly

Run this in your browser console while on the dashboard:

```javascript
// Test if Supabase is working
const testAuth = async () => {
  // Check current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', session, 'Error:', sessionError);
  
  // Try to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dashboard@clika.com',
    password: 'Dashboard2024!'
  });
  
  console.log('Sign in result:', data, 'Error:', error);
  
  // Check session again
  const { data: { session: newSession } } = await supabase.auth.getSession();
  console.log('New session:', newSession);
  
  // Test a simple query
  const { data: testData, error: queryError } = await supabase
    .from('user_profile')
    .select('*')
    .limit(1);
    
  console.log('Test query:', testData, 'Error:', queryError);
};

// Import supabase first
const { createClient } = window['@supabase/supabase-js'];
const supabase = createClient(
  'https://iwfgkwjqwxqbcjimqmxv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Zmdrb2pxd3hxYmNqaW1xbXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjQ4MDEsImV4cCI6MjA1MTUwMDgwMX0.zzCdMilENJd5HKMz7rJqmiJkJBvzYnP72iOCDqcG7Sc'
);

testAuth();
```

## Step 4: Check Network Tab

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Clear the network log
4. Try to login
5. Look for requests to `iwfgkwjqwxqbcjimqmxv.supabase.co`
6. Check if any return 401, 403, or other error codes

## Step 5: Verify Database Tables

Let's check if the tables exist and have the correct structure:

```sql
-- Run this in Supabase SQL Editor
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if user exists and has correct role
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at
FROM auth.users 
WHERE email = 'dashboard@clika.com';

-- Check if profile exists
SELECT * FROM public.user_profile 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'dashboard@clika.com'
);
```

## Step 6: Reset Everything

If nothing else works, let's reset the authentication:

1. **Clear browser data:**
   - Open browser developer tools (F12)
   - Go to Application tab
   - Clear Local Storage for localhost:3000
   - Clear Session Storage
   - Clear Cookies

2. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

3. **Create a fresh user:**
   ```sql
   -- Delete old user completely
   DELETE FROM public.user_profile WHERE user_id IN (
     SELECT id FROM auth.users WHERE email = 'test@clika.com'
   );
   DELETE FROM auth.users WHERE email = 'test@clika.com';

   -- Create new test user
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
     'test@clika.com',
     crypt('Test123!', gen_salt('bf')),
     now(),
     '{"provider": "email", "providers": ["email"]}'::jsonb,
     '{"role": "admin"}'::jsonb,
     'authenticated',
     'authenticated'
   ) RETURNING id;
   ```

## Common Issues and Solutions

1. **Wrong Supabase project**: Verify the URL in .env matches your project
2. **Expired anon key**: Check if the anon key is still valid
3. **CORS issues**: Check browser console for CORS errors
4. **RLS blocking**: Tables have RLS enabled but no policies
5. **User metadata not set**: The user exists but doesn't have admin role

The most likely issue is #4 - RLS is enabled but there are no policies allowing access.