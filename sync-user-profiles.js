import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // You need to add your service role key here

console.log('⚠️  Note: This script requires the service role key to access auth.users table.');
console.log('You can find it in your Supabase project settings > API > Service role key');
console.log('\nFor now, I\'ll create the SQL queries you can run in Supabase SQL editor:\n');

const missingProfiles = [
  { id: '1dc5f91e-3aca-4d67-8289-33b3973956a2', email: 'omarmersal8@gmail.com' },
  { id: '09c8639d-3085-499a-beb4-9935f42c4126', email: 'a.mersall444@gmail.com' },
  { id: '395a044f-139f-4afe-b9c5-7fbe3ca5940a', email: 'a.mersall44@gmail.com' },
  { id: 'c8cb374a-60d9-4871-b890-edd4f840ddee', email: 'test@clika.com' }
];

console.log('-- Run this SQL in your Supabase SQL editor to create profiles for all users:\n');

console.log(`INSERT INTO user_profile (user_id, display_name, role, created_at, updated_at)
VALUES`);

missingProfiles.forEach((user, index) => {
  const displayName = user.email.split('@')[0];
  const comma = index < missingProfiles.length - 1 ? ',' : ';';
  console.log(`  ('${user.id}', '${displayName}', 'reviewer', NOW(), NOW())${comma}`);
});

console.log('\n-- After running the above SQL, all users will appear in the Users Management page.');
console.log('-- You can then change their roles from the dashboard UI.');