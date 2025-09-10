import { createClient } from '@supabase/supabase-js';

// Using anon key - should be restricted by RLS
const supabaseAnon = createClient(
  'https://mdrgxkflxurntyjtfjan.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o'
);

async function testRLS() {
  console.log('Testing with anon key (RLS active)...');
  
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('content_item')
    .select('*')
    .limit(5);
    
  if (anonError) {
    console.error('Anon query error:', anonError);
  } else {
    console.log('Anon query successful!');
    console.log('Number of items:', anonData.length);
  }
  
  // Test with authenticated user
  console.log('\nTesting authenticated query...');
  const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession();
  
  console.log('Current session:', session ? 'Active' : 'None');
  if (sessionError) {
    console.error('Session error:', sessionError);
  }
}

testRLS();