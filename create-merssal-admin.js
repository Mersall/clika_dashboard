import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createMerssalAdmin() {
  const email = 'merssss12345@gmail.com';
  const password = 'Clika@2025Admin';
  
  console.log('Creating admin account for Merssal...');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\n');
  
  try {
    // First, try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          display_name: 'Merssal Admin',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      // If user already exists, try to sign in instead
      if (signUpError.message.includes('already registered')) {
        console.log('User already exists. Updating to admin role...');
        
        // Sign in to get the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (signInError) {
          console.error('Sign in error:', signInError.message);
          console.log('\nTrying to just update the existing user profile...');
          
          // Try to find the user by email
          const { data: authUser } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single();
            
          if (authUser) {
            await updateUserProfile(authUser.id);
          }
          return;
        }

        if (signInData.user) {
          await updateUserProfile(signInData.user.id);
        }
      } else {
        console.error('Sign up error:', signUpError.message);
      }
      return;
    }

    // If sign up was successful
    if (signUpData.user) {
      console.log('✅ Account created successfully!');
      console.log('User ID:', signUpData.user.id);
      
      // Create/update user profile
      await updateUserProfile(signUpData.user.id);
      
      console.log('\n🎉 SUCCESS! Admin account created:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: ' + email);
      console.log('🔑 Password: ' + password);
      console.log('👤 Role: Admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Check if email confirmation is required
      if (signUpData.user.identities?.length === 0) {
        console.log('\n⚠️  IMPORTANT: Please check your email (' + email + ') to confirm your account before logging in.');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Sign out to clean up
    await supabase.auth.signOut();
  }
}

async function updateUserProfile(userId) {
  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({
          role: 'admin',
          display_name: 'Merssal Admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      } else {
        console.log('✅ User profile updated to admin role!');
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profile')
        .insert({
          user_id: userId,
          display_name: 'Merssal Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        console.log('\nNote: You may need to manually update the role in the database after confirming your email.');
      } else {
        console.log('✅ User profile created with admin role!');
      }
    }
  } catch (error) {
    console.error('Profile update error:', error);
  }
}

createMerssalAdmin().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
});