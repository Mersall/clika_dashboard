const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing authentication directly with Supabase...\n');
  
  const testCredentials = [
    { email: 'merssss12345@gmail.com', password: 'Clika@2025Admin' },
    { email: 'dashboard@clika.com', password: 'Dashboard123!' },
    { email: 'newadmin@clika.com', password: 'Admin123!' },
    { email: 'test@clika.com', password: 'Test123456!' }
  ];
  
  for (const creds of testCredentials) {
    console.log(`Testing ${creds.email}...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });
      
      if (error) {
        console.log(`❌ Failed: ${error.message}`);
        if (error.message.includes('email not confirmed')) {
          console.log('   Note: Email confirmation required');
        }
      } else if (data.user) {
        console.log(`✅ Success! User ID: ${data.user.id}`);
        console.log(`   Email confirmed: ${data.user.confirmed_at ? 'Yes' : 'No'}`);
        
        // Sign out for next test
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
    
    console.log('');
  }
  
  // Try to create a new test user with known password
  console.log('Attempting to create new test user...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@clika.io',
      password: 'TestUser123!',
      options: {
        data: {
          display_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.log(`❌ Signup failed: ${error.message}`);
    } else if (data.user) {
      console.log(`✅ User created! ID: ${data.user.id}`);
      console.log(`   Confirmation required: ${!data.user.confirmed_at}`);
      console.log('\n   You can now login with:');
      console.log('   Email: testuser@clika.io');
      console.log('   Password: TestUser123!');
      console.log('   (After email confirmation)');
    }
  } catch (err) {
    console.log(`❌ Signup error: ${err.message}`);
  }
}

testAuth().catch(console.error);