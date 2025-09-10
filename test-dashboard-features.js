import { chromium } from 'playwright';

async function testDashboard() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test environment variables
  const SUPABASE_URL = 'https://mdrgxkflxurntyjtfjan.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MDk4NDEsImV4cCI6MjA0MDk4NTg0MX0.ovSRfeGUBPSrGx7c4XqkBm4Sh1hGGD0SI3xmJ7KKSJA';
  
  console.log('Testing dashboard features...');
  
  // Check if app is running
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✓ App is running');
  } catch (error) {
    console.log('✗ App is not running. Start the app first with: yarn dev');
    await browser.close();
    return;
  }
  
  // Test existing features
  const existingFeatures = [
    { name: 'Login Page', path: '/login' },
    { name: 'Content Management', path: '/content' },
    { name: 'Content Review', path: '/content/review' },
    { name: 'Campaigns Management', path: '/campaigns' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Users Management', path: '/users' },
    { name: 'Settings', path: '/settings' }
  ];
  
  for (const feature of existingFeatures) {
    await page.goto(`http://localhost:3000${feature.path}`, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`✓ ${feature.name} - ${title}`);
  }
  
  // List missing features based on database schema
  console.log('\nMissing features to implement:');
  console.log('1. Content Packs Management (content_pack, pack_item tables)');
  console.log('2. Game Sessions Analytics (session, round tables)');
  console.log('3. Game Configuration (game_config table)');
  console.log('4. Feature Flags Management (feature_flag table)');
  console.log('5. Ad Delivery Logs (ad_delivery_log table - add to analytics)');
  console.log('6. User Content Tracking (user_seen_today table - add to analytics)');
  
  await browser.close();
}

testDashboard().catch(console.error);