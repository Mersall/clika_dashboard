import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminAccount() {
  const email = 'admin@clika.com';
  const password = 'Admin@123456';
  
  console.log('Creating admin account...');
  console.log('Email:', email);
  console.log('Password:', password);
  
  try {
    // First, try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          display_name: 'Admin User',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      // If user already exists, try to sign in instead
      if (signUpError.message.includes('already registered')) {
        console.log('\nUser already exists. Updating role to admin...');
        
        // Sign in to get the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (signInError) {
          console.error('Sign in error:', signInError.message);
          return;
        }

        // Update the user profile to admin role
        const { error: updateError } = await supabase
          .from('user_profile')
          .upsert({
            user_id: signInData.user.id,
            display_name: 'Admin User',
            role: 'admin',
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error('Error updating user role:', updateError);
        } else {
          console.log('\n✅ Admin account updated successfully!');
          console.log('\n📧 Email:', email);
          console.log('🔑 Password:', password);
        }
      } else {
        console.error('Sign up error:', signUpError.message);
      }
      return;
    }

    // If sign up was successful
    if (signUpData.user) {
      console.log('\n✅ Admin account created successfully!');
      console.log('\n📧 Email:', email);
      console.log('🔑 Password:', password);
      
      // Create/update user profile
      const { error: profileError } = await supabase
        .from('user_profile')
        .upsert({
          user_id: signUpData.user.id,
          display_name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      // Check if email confirmation is required
      if (signUpData.user.identities?.length === 0) {
        console.log('\n⚠️  Please check your email to confirm your account.');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Sign out to clean up
    await supabase.auth.signOut();
  }
}

createAdminAccount().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
});