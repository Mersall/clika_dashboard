import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdrgxkflxurntyjtfjan.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o'
);

async function testQuery() {
  console.log('Testing content_item query...');
  
  const { data, error } = await supabase
    .from('content_item')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('Query error:', error);
  } else {
    console.log('Query successful!');
    console.log('Number of items:', data.length);
    if (data.length > 0) {
      console.log('First item:', data[0]);
    }
  }
}

testQuery();