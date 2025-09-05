# Test Authentication Integration

## Test Script

Create a file called `test-auth.html` and open it in your browser:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Clika Dashboard Auth</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <h1>Test Authentication</h1>
  <button onclick="testAuth()">Test Login</button>
  <button onclick="testFetch()">Test Fetch Data</button>
  <button onclick="checkSession()">Check Session</button>
  <button onclick="clearAuth()">Clear Auth</button>
  
  <pre id="output"></pre>

  <script>
    const SUPABASE_URL = 'https://iwfgkwjqwxqbcjimqmxv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Zmdrb2pxd3hxYmNqaW1xbXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjQ4MDEsImV4cCI6MjA1MTUwMDgwMX0.zzCdMilENJd5HKMz7rJqmiJkJBvzYnP72iOCDqcG7Sc';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    function log(message, data) {
      const output = document.getElementById('output');
      output.textContent += `\n${new Date().toISOString()} - ${message}\n`;
      if (data) {
        output.textContent += JSON.stringify(data, null, 2) + '\n';
      }
      output.textContent += '---\n';
    }
    
    async function testAuth() {
      log('Testing authentication...');
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'dashboard@clika.com',
          password: 'Dashboard2024!'
        });
        
        if (error) {
          log('Login failed:', error);
          return;
        }
        
        log('Login successful:', {
          user: data.user?.email,
          role: data.user?.user_metadata?.role,
          session: !!data.session
        });
        
        // Check JWT contents
        if (data.session?.access_token) {
          const payload = JSON.parse(atob(data.session.access_token.split('.')[1]));
          log('JWT payload:', payload);
        }
      } catch (err) {
        log('Error during login:', err);
      }
    }
    
    async function testFetch() {
      log('Testing data fetch...');
      
      try {
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        log('Current session:', session ? 'Active' : 'None');
        
        // Try fetching data
        const { data, error } = await supabase
          .from('user_profile')
          .select('*')
          .limit(1);
          
        if (error) {
          log('Fetch failed:', error);
          
          // Try with service role key if available
          log('Note: This might be an RLS issue. Tables might need policies.');
        } else {
          log('Fetch successful:', data);
        }
        
        // Try other tables
        const tables = ['content_item', 'content_pack', 'ad_campaign'];
        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          log(`Fetch ${table}:`, error ? `Failed - ${error.message}` : 'Success');
        }
      } catch (err) {
        log('Error during fetch:', err);
      }
    }
    
    async function checkSession() {
      log('Checking session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          log('Session check error:', error);
          return;
        }
        
        if (!session) {
          log('No active session');
          return;
        }
        
        log('Active session:', {
          user: session.user?.email,
          role: session.user?.user_metadata?.role,
          expires: new Date(session.expires_at * 1000).toISOString()
        });
      } catch (err) {
        log('Error checking session:', err);
      }
    }
    
    async function clearAuth() {
      log('Clearing authentication...');
      
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          log('Sign out error:', error);
        } else {
          log('Signed out successfully');
        }
      } catch (err) {
        log('Error signing out:', err);
      }
    }
    
    // Check initial state
    checkSession();
  </script>
</body>
</html>
```

## Quick Diagnosis Steps

1. Open this HTML file in your browser
2. Click "Test Login" to verify authentication works
3. Click "Test Fetch Data" to see if RLS is blocking access
4. Check the output for specific error messages

## Fix Integration in React

Update your QueryClient configuration to handle errors better:

```typescript
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      onError: (error: any) => {
        console.error('Query error:', error);
        // Check for auth errors
        if (error.code === '401' || error.message?.includes('JWT')) {
          // Session expired, redirect to login
          window.location.href = '/login';
        } else if (error.message?.includes('row-level security')) {
          console.error('RLS Policy Issue:', error.message);
          toast.error('Access denied. Please check your permissions.');
        } else {
          toast.error(error.message || 'Failed to fetch data');
        }
      }
    },
    mutations: {
      onError: (error: any) => {
        console.error('Mutation error:', error);
        toast.error(error.message || 'Operation failed');
      }
    }
  },
});
```

## Common Integration Issues

1. **CORS Issues**
   - Check if Supabase URL is correct
   - Verify anon key is valid

2. **RLS Policies**
   - Tables have RLS enabled but no policies
   - User role not properly set in JWT

3. **Session Management**
   - Session expired
   - Auth state not synced between tabs

4. **Network Issues**
   - Firewall blocking Supabase
   - DNS resolution issues