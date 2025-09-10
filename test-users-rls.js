import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdrgxkflxurntyjtfjan.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o'
);

async function testUsersQuery() {
  console.log('Testing user_profile query with anon key...');
  
  // First test auth.users
  const { data: authUsers, error: authError } = await supabase
    .from('auth.users')
    .select('id, email')
    .limit(5);
    
  console.log('Auth users query:', { data: authUsers, error: authError });
  
  // Then test user_profile
  const { data: profiles, error: profileError } = await supabase
    .from('user_profile')
    .select('*');
    
  console.log('User profiles query:', { data: profiles, error: profileError });
  
  // Test with count
  const { count, error: countError } = await supabase
    .from('user_profile')
    .select('*', { count: 'exact', head: true });
    
  console.log('User profiles count:', { count, error: countError });
}

testUsersQuery();