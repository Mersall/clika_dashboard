import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwfgkwjqwxqbcjimqmxv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Zmdrb2pxd3hxYmNqaW1xbXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjQ4MDEsImV4cCI6MjA1MTUwMDgwMX0.zzCdMilENJd5HKMz7rJqmiJkJBvzYnP72iOCDqcG7Sc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCRUDOperations() {
  console.log('Testing Supabase CRUD operations...\n');

  try {
    // Test 1: Fetch content items
    console.log('1. Fetching content items...');
    const { data: items, error: itemsError } = await supabase
      .from('content_item')
      .select('*')
      .limit(5);
    
    if (itemsError) throw itemsError;
    console.log(`✓ Fetched ${items.length} content items`);

    // Test 2: Fetch campaigns
    console.log('\n2. Fetching ad campaigns...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('ad_campaign')
      .select('*')
      .limit(5);
    
    if (campaignsError) throw campaignsError;
    console.log(`✓ Fetched ${campaigns.length} campaigns`);

    // Test 3: Fetch content packs
    console.log('\n3. Fetching content packs...');
    const { data: packs, error: packsError } = await supabase
      .from('content_pack')
      .select('*')
      .limit(5);
    
    if (packsError) throw packsError;
    console.log(`✓ Fetched ${packs.length} content packs`);

    // Test 4: Test content item creation
    console.log('\n4. Testing content item creation...');
    const testItem = {
      game_key: 'who_among_us',
      difficulty_or_depth: 2,
      tags: ['test', 'integration'],
      active: false,
      payload: {
        question: 'Test question for integration testing'
      }
    };

    const { data: newItem, error: createError } = await supabase
      .from('content_item')
      .insert(testItem)
      .select()
      .single();
    
    if (createError) {
      console.log('✗ Failed to create content item:', createError.message);
    } else {
      console.log('✓ Created content item:', newItem.id);
      
      // Test 5: Delete the test item
      console.log('\n5. Cleaning up test item...');
      const { error: deleteError } = await supabase
        .from('content_item')
        .delete()
        .eq('id', newItem.id);
      
      if (deleteError) {
        console.log('✗ Failed to delete test item:', deleteError.message);
      } else {
        console.log('✓ Deleted test item');
      }
    }

    // Test 6: Check views
    console.log('\n6. Testing views...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('game_analytics')
      .select('*')
      .limit(5);
    
    if (analyticsError) {
      console.log('✗ Failed to fetch game_analytics:', analyticsError.message);
    } else {
      console.log(`✓ Fetched ${analytics?.length || 0} game analytics records`);
    }

    const { data: performance, error: perfError } = await supabase
      .from('ad_performance')
      .select('*')
      .limit(5);
    
    if (perfError) {
      console.log('✗ Failed to fetch ad_performance:', perfError.message);
    } else {
      console.log(`✓ Fetched ${performance?.length || 0} ad performance records`);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testCRUDOperations();