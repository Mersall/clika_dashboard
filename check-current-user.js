import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Get current user
const { data: { user }, error: userError } = await supabase.auth.getUser();

if (userError) {
  console.error('Error getting user:', userError);
  process.exit(1);
}

if (!user) {
  console.log('No user logged in');
  process.exit(0);
}

console.log('\nCurrent user:', user.email);
console.log('User ID:', user.id);

// Check user profile
const { data: profile, error: profileError } = await supabase
  .from('user_profile')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (profileError) {
  console.error('Error fetching profile:', profileError);
} else {
  console.log('\nUser profile:');
  console.log('- Display name:', profile.display_name);
  console.log('- Role:', profile.role);
  console.log('- Created at:', profile.created_at);
}

// Check if admin account exists
const { data: adminProfile, error: adminError } = await supabase
  .from('user_profile')
  .select('*')
  .eq('role', 'admin');

if (!adminError && adminProfile && adminProfile.length > 0) {
  console.log('\nAdmin accounts found:', adminProfile.length);
  adminProfile.forEach(admin => {
    console.log(`- ${admin.display_name} (ID: ${admin.user_id})`);
  });
} else {
  console.log('\nNo admin accounts found');
}