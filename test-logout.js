import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogout() {
  console.log('Testing logout functionality...\n');
  
  // First login
  console.log('1. Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'merssss12345@gmail.com',
    password: 'Clika@2025Admin'
  });

  if (authError) {
    console.error('Login failed:', authError);
    return;
  }

  console.log('✅ Logged in successfully');
  console.log('User ID:', authData.user.id);
  console.log('Session:', authData.session ? 'Active' : 'None');
  
  // Check current session
  console.log('\n2. Checking current session...');
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  console.log('Current session:', currentSession ? 'Active' : 'None');
  
  // Now logout
  console.log('\n3. Logging out...');
  const { error: logoutError } = await supabase.auth.signOut();
  
  if (logoutError) {
    console.error('❌ Logout error:', logoutError);
    console.error('Error details:', logoutError.message);
  } else {
    console.log('✅ Logout successful');
  }
  
  // Check session after logout
  console.log('\n4. Checking session after logout...');
  const { data: { session: afterLogoutSession } } = await supabase.auth.getSession();
  console.log('Session after logout:', afterLogoutSession ? 'Still Active!' : 'None (logged out)');
  
  // Try to access authenticated endpoint
  console.log('\n5. Testing authenticated endpoint...');
  const { data: profileData, error: profileError } = await supabase
    .from('user_profile')
    .select('*')
    .limit(1);
    
  if (profileError) {
    console.log('✅ Cannot access protected data (expected after logout)');
    console.log('Error:', profileError.message);
  } else {
    console.log('⚠️  Still able to access protected data!');
    console.log('Data:', profileData);
  }
}

testLogout().catch(console.error).then(() => process.exit());