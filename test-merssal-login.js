import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  const email = 'merssss12345@gmail.com';
  const passwords = [
    'Clika@2025Admin',  // The password we created
    'Admin@123456',     // Maybe confused with other admin account
    'testpassword'      // Default test password
  ];
  
  console.log('Testing login for:', email);
  console.log('Account was created with password: Clika@2025Admin');
  console.log('\nTrying different passwords...\n');
  
  for (const password of passwords) {
    console.log(`Testing password: ${password}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.log(`❌ Failed: ${error.message}`);
    } else if (data.user) {
      console.log(`✅ SUCCESS! Login works with password: ${password}`);
      console.log('User ID:', data.user.id);
      console.log('Email confirmed:', !!data.user.confirmed_at);
      
      // Sign out after successful test
      await supabase.auth.signOut();
      return;
    }
    console.log('');
  }
  
  console.log('\n⚠️  None of the passwords worked!');
  console.log('The correct password should be: Clika@2025Admin');
  console.log('\nPossible issues:');
  console.log('1. Password might have been changed');
  console.log('2. There might be rate limiting');
  console.log('3. Try using "Forgot Password" on the login page');
}

testLogin().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});