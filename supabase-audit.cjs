const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pihsgqjawbqyhxcwrvoc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpaHNncWphd2JxeWh4Y3dydm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTYzMDMsImV4cCI6MjA1MDAzMjMwM30.h-oL1ST6tTJ0bmm0kPQUX_dNXULdvVpSNX7cKYXfans'
);

async function auditSupabaseData() {
  console.log('🔍 SUPABASE DATA AUDIT\n');
  
  const tables = [
    'content_item',
    'ad_campaign',
    'ad_creative',
    'session',
    'round',
    'user_profile',
    'content_pack',
    'pack_item',
    'user_seen_today',
    'feature_flag',
    'game_config'
  ];
  
  const results = {};
  
  // Check each table
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results[table] = { error: error.message };
      } else {
        results[table] = { count: count || 0 };
      }
    } catch (err) {
      results[table] = { error: err.message };
    }
  }
  
  console.log('📊 Table Record Counts:');
  console.log('=====================');
  Object.entries(results).forEach(([table, data]) => {
    if (data.error) {
      console.log(`❌ ${table}: ERROR - ${data.error}`);
    } else {
      console.log(`${data.count > 0 ? '✅' : '⚠️'} ${table}: ${data.count} records`);
    }
  });
  
  // Test specific queries
  console.log('\n📈 Testing Specific Queries:');
  console.log('==========================');
  
  // Test dashboard stats
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { count: sessionsToday } = await supabase
      .from('session')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', today);
      
    console.log(`Sessions today: ${sessionsToday || 0}`);
  } catch (err) {
    console.log('❌ Sessions query failed:', err.message);
  }
  
  // Test user profiles
  try {
    const { data: profiles, error } = await supabase
      .from('user_profile')
      .select('*')
      .limit(5);
      
    if (error) {
      console.log('❌ User profiles error:', error.message);
    } else {
      console.log(`✅ User profiles accessible: ${profiles.length} samples retrieved`);
    }
  } catch (err) {
    console.log('❌ User profiles query failed:', err.message);
  }
  
  // Test content with game type
  try {
    const { data: content, error } = await supabase
      .from('content_item')
      .select('*')
      .limit(5);
      
    if (error) {
      console.log('❌ Content query error:', error.message);
    } else {
      console.log(`✅ Content items accessible: ${content.length} samples`);
      if (content.length > 0) {
        console.log('  Sample games:', [...new Set(content.map(c => c.game))].join(', '));
      }
    }
  } catch (err) {
    console.log('❌ Content query failed:', err.message);
  }
  
  // Test RLS policies
  console.log('\n🔒 Testing RLS Policies:');
  console.log('=======================');
  
  // Try to read without auth
  const { data: publicData, error: publicError } = await supabase
    .from('content_item')
    .select('*')
    .limit(1);
    
  console.log(`Public content access: ${publicError ? '🔒 Blocked' : '⚠️ Allowed'}`);
  
  // Test functions
  console.log('\n🔧 Testing Database Functions:');
  console.log('=============================');
  
  try {
    const { data: dau, error: dauError } = await supabase
      .rpc('get_daily_active_users', { days: 7 });
      
    if (dauError) {
      console.log('❌ DAU function error:', dauError.message);
    } else {
      console.log('✅ DAU function working');
    }
  } catch (err) {
    console.log('❌ DAU function failed:', err.message);
  }
  
  return results;
}

// Run the audit
auditSupabaseData().then(() => {
  console.log('\n✅ Audit complete');
}).catch(err => {
  console.error('❌ Audit failed:', err);
});