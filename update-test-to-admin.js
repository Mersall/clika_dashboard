import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function makeTestUserAdmin() {
  const email = 'test@example.com';
  const password = 'testpassword';
  
  console.log('Updating test user to admin...');
  console.log('Email:', email);
  console.log('Password:', password);
  
  try {
    // Sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (signInError) {
      console.error('Sign in error:', signInError.message);
      return;
    }

    if (signInData.user) {
      console.log('User ID:', signInData.user.id);
      
      // Update the user profile to admin role
      const { data: updateData, error: updateError } = await supabase
        .from('user_profile')
        .update({
          role: 'admin',
          display_name: 'Test Admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', signInData.user.id)
        .select();

      if (updateError) {
        console.error('Error updating user role:', updateError);
      } else {
        console.log('\n✅ Test user updated to admin successfully!');
        console.log('Updated profile:', updateData);
        console.log('\n📧 Admin Email:', email);
        console.log('🔑 Admin Password:', password);
        console.log('\n✨ You can now log in with these credentials to access all admin features!');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Sign out to clean up
    await supabase.auth.signOut();
  }
}

makeTestUserAdmin().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
});