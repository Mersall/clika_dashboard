import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCRUDOperations() {
  console.log('Testing CRUD Operations with Real Data...\n');

  // Test Content Item CRUD
  console.log('1. Testing Content Item CRUD:');
  try {
    // Create
    const newContent = {
      game_key: 'who_among_us',
      payload: { question: 'Test CRUD Question: What is your favorite color?' },
      difficulty_or_depth: '1',
      tags: ['test', 'crud'],
      active: true,
      status: 'draft'
    };

    const { data: created, error: createError } = await supabase
      .from('content_item')
      .insert([newContent])
      .select()
      .single();

    if (createError) throw createError;
    console.log('   ✓ CREATE: Content item created with ID:', created.id);

    // Read
    const { data: read, error: readError } = await supabase
      .from('content_item')
      .select('*')
      .eq('id', created.id)
      .single();

    if (readError) throw readError;
    console.log('   ✓ READ: Content item retrieved:', read.payload.question);

    // Update
    const { data: updated, error: updateError } = await supabase
      .from('content_item')
      .update({ 
        payload: { question: 'Updated Question: What is your favorite hobby?' },
        status: 'approved'
      })
      .eq('id', created.id)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log('   ✓ UPDATE: Content item updated:', updated.payload.question);

    // Delete
    const { error: deleteError } = await supabase
      .from('content_item')
      .delete()
      .eq('id', created.id);

    if (deleteError) throw deleteError;
    console.log('   ✓ DELETE: Content item deleted');

  } catch (error) {
    console.error('   ✗ Content Item CRUD Error:', error.message);
  }

  // Test Campaign CRUD
  console.log('\n2. Testing Campaign CRUD:');
  try {
    // Create
    const newCampaign = {
      name: 'Test CRUD Campaign',
      status: 'draft',
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      daily_cap: 100,
      sov_pct: 25.5,
      priority: 5
    };

    const { data: created, error: createError } = await supabase
      .from('ad_campaign')
      .insert([newCampaign])
      .select()
      .single();

    if (createError) throw createError;
    console.log('   ✓ CREATE: Campaign created with ID:', created.id);

    // Read
    const { data: read, error: readError } = await supabase
      .from('ad_campaign')
      .select('*')
      .eq('id', created.id)
      .single();

    if (readError) throw readError;
    console.log('   ✓ READ: Campaign retrieved:', read.name);

    // Update
    const { data: updated, error: updateError } = await supabase
      .from('ad_campaign')
      .update({ 
        name: 'Updated Test Campaign',
        status: 'active',
        daily_cap: 200
      })
      .eq('id', created.id)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log('   ✓ UPDATE: Campaign updated:', updated.name, 'Status:', updated.status);

    // Delete
    const { error: deleteError } = await supabase
      .from('ad_campaign')
      .delete()
      .eq('id', created.id);

    if (deleteError) throw deleteError;
    console.log('   ✓ DELETE: Campaign deleted');

  } catch (error) {
    console.error('   ✗ Campaign CRUD Error:', error.message);
  }

  // Test User Profile Read and Update (no create/delete for user profiles)
  console.log('\n3. Testing User Profile Read/Update:');
  try {
    // First get a user
    const { data: users, error: listError } = await supabase
      .from('user_profile')
      .select('*')
      .limit(1);

    if (listError) throw listError;
    
    if (users && users.length > 0) {
      const testUser = users[0];
      console.log('   ✓ READ: User profile retrieved:', testUser.display_name || 'No name');

      // Update
      const originalName = testUser.display_name;
      const { data: updated, error: updateError } = await supabase
        .from('user_profile')
        .update({ 
          display_name: 'CRUD Test User ' + Date.now()
        })
        .eq('user_id', testUser.user_id)
        .select()
        .single();

      if (updateError) throw updateError;
      console.log('   ✓ UPDATE: User profile updated:', updated.display_name);

      // Restore original
      await supabase
        .from('user_profile')
        .update({ display_name: originalName })
        .eq('user_id', testUser.user_id);
      console.log('   ✓ RESTORE: User profile restored to original');
    } else {
      console.log('   ⚠ No users found to test update');
    }

  } catch (error) {
    console.error('   ✗ User Profile Error:', error.message);
  }

  // Test Real-time subscriptions
  console.log('\n4. Testing Real-time Subscriptions:');
  try {
    let received = false;
    
    // Subscribe to content_item changes
    const channel = supabase
      .channel('test-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_item'
        },
        (payload) => {
          console.log('   ✓ REALTIME: Received event:', payload.eventType);
          received = true;
        }
      )
      .subscribe();

    // Wait for subscription to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a content item to trigger realtime
    const { data, error } = await supabase
      .from('content_item')
      .insert([{
        game_key: 'who_among_us',
        payload: { question: 'Realtime test question' },
        difficulty_or_depth: '0',
        active: true
      }])
      .select()
      .single();

    if (!error && data) {
      // Wait for realtime event
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (received) {
        console.log('   ✓ Real-time subscription working!');
      } else {
        console.log('   ⚠ Real-time event not received (may need auth)');
      }

      // Cleanup
      await supabase.from('content_item').delete().eq('id', data.id);
    }

    // Unsubscribe
    await supabase.removeChannel(channel);

  } catch (error) {
    console.error('   ✗ Real-time Error:', error.message);
  }

  console.log('\n✅ CRUD Operations Test Complete!');
}

testCRUDOperations().catch(console.error);