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
  process.env.VITE_SUPABASE_SERVICE_KEY // Use service key for admin operations
);

// Get current auth user
const { data: { user }, error: userError } = await supabase.auth.getUser();

if (userError || !user) {
  console.error('Error getting user:', userError);
  process.exit(1);
}

console.log('Current user:', user.email);
console.log('User ID:', user.id);

// Update user role to admin
const { data, error } = await supabase
  .from('user_profile')
  .update({ role: 'admin' })
  .eq('user_id', user.id);

if (error) {
  console.error('Error updating role:', error);
} else {
  console.log('Successfully updated user role to admin!');
  
  // Verify the update
  const { data: profile, error: profileError } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (!profileError) {
    console.log('\nUpdated profile:');
    console.log('- Display name:', profile.display_name);
    console.log('- Role:', profile.role);
  }
}