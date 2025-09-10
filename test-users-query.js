import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUsersQuery() {
  console.log('Testing user profile query as admin...\n');
  
  // First login as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'merssss12345@gmail.com',
    password: 'Clika@2025Admin'
  });

  if (authError) {
    console.error('Login failed:', authError);
    return;
  }

  console.log('✅ Logged in as admin');
  console.log('User ID:', authData.user.id);
  
  // Now query user profiles
  console.log('\nQuerying user_profile table...');
  const { data, error, count } = await supabase
    .from('user_profile')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Query error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
  } else {
    console.log(`✅ Query successful! Found ${data.length} users (total count: ${count})`);
    console.log('\nUsers:');
    data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.display_name || 'No name'} (${user.role}) - ${user.user_id}`);
    });
  }

  // Clean up
  await supabase.auth.signOut();
}

testUsersQuery().catch(console.error).then(() => process.exit());