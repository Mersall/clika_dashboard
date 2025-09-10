import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdrgxkflxurntyjtfjan.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o'
);

async function createTestUser() {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test@clika.com',
    password: 'Test123!',
    options: {
      emailRedirectTo: 'http://localhost:3001/auth/callback',
      data: {
        display_name: 'Test User'
      }
    }
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('User created:', authData.user.email);
  console.log('User ID:', authData.user.id);
  
  // Create user profile
  const { error: profileError } = await supabase
    .from('user_profile')
    .insert({
      user_id: authData.user.id,
      display_name: 'Test User',
      role: 'admin',
      geo_consent: false,
      personalized_ads: false
    });

  if (profileError) {
    console.error('Profile error:', profileError);
  } else {
    console.log('Profile created successfully');
  }
}

createTestUser();