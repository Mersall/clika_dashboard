const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Please set SUPABASE_SERVICE_KEY environment variable');
  console.log('You can find this in your Supabase project settings under API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('Creating test user...');
  
  try {
    // Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@clika.io',
      password: 'Test123456!',
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profile')
      .insert({
        user_id: authData.user.id,
        display_name: 'Test User',
        role: 'admin',
        geo_consent: true,
        personalized_ads: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('\n✅ Test user created successfully!');
    console.log('Email: test@clika.io');
    console.log('Password: Test123456!');
    console.log('Role: admin');
    console.log('User ID:', authData.user.id);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Check if user already exists
async function checkExistingUser() {
  const { data, error } = await supabase.auth.admin.getUserByEmail('test@clika.io');
  
  if (data?.user) {
    console.log('User test@clika.io already exists');
    console.log('User ID:', data.user.id);
    console.log('Created at:', data.user.created_at);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    return true;
  }
  
  return false;
}

// Main execution
(async () => {
  const exists = await checkExistingUser();
  if (!exists) {
    await createTestUser();
  } else {
    console.log('\nTo reset the password, use the Supabase dashboard or auth.admin.updateUserById()');
  }
})();