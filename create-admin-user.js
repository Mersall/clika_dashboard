import { createClient } from '@supabase/supabase-js';

// Admin service role key is needed to create users
// You can find this in your Supabase dashboard under Settings > API
const supabaseUrl = 'https://iwfgkwjqwxqbcjimqmxv.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('Creating admin user...\n');

  try {
    // Create the user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@clika.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        display_name: 'Admin User'
      }
    });

    if (createError) {
      console.error('Error creating user:', createError.message);
      return;
    }

    console.log('✓ Admin user created successfully!');
    console.log('  Email: admin@clika.com');
    console.log('  Password: Admin123!');
    console.log('  User ID:', user.user.id);

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profile')
      .insert({
        user_id: user.user.id,
        display_name: 'Admin User',
        geo_consent: true,
        personalized_ads: true
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError.message);
    } else {
      console.log('✓ User profile created');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Instructions if service key is not available
console.log(`
If you don't have the service role key, you can create the admin user manually:

1. Go to your Supabase dashboard: https://app.supabase.com/project/iwfgkwjqwxqbcjimqmxv
2. Navigate to Authentication > Users
3. Click "Invite user" button
4. Enter:
   - Email: admin@clika.com
   - Password: Admin123!
5. Click "Create user"

The user will have admin privileges and can access all dashboard features.
`);

// Uncomment this after adding your service role key
// createAdminUser();