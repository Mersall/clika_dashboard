import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MDk4NDEsImV4cCI6MjA0MDk4NTg0MX0.ovSRfeGUBPSrGx7c4XqkBm4Sh1hGGD0SI3xmJ7KKSJA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function makeUserAdmin(email) {
  try {
    // First, get the user by email
    const { data: users, error: fetchError } = await supabase
      .from('user_profile')
      .select('*');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return;
    }

    console.log('Current users:', users);

    // If you know the user_id, update it directly
    // Replace this with the actual user_id you want to make admin
    const userId = '395a044f-eeb5-4b88-a14f-c6f43ad899e2'; // This is from the test data
    
    const { error: updateError } = await supabase
      .from('user_profile')
      .update({ role: 'admin' })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
    } else {
      console.log('Successfully updated user to admin role!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
makeUserAdmin().then(() => {
  console.log('Script completed');
  process.exit(0);
});