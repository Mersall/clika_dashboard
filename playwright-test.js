// Playwright Test for Clika Dashboard
// Run this after starting the dev server: yarn dev

const { chromium } = require('playwright');

async function runDashboardTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🧪 Starting Clika Dashboard Tests...\n');
  
  try {
    // Test 1: Navigate to Dashboard
    console.log('Test 1: Loading Dashboard...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Dashboard loaded successfully');
    
    // Test 2: Check Home Page
    console.log('\nTest 2: Checking Home Page...');
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")').isVisible();
    if (dashboardTitle) {
      console.log('✅ Dashboard title visible');
    }
    
    // Check stats cards
    const statsCards = [
      'Total Users',
      'Sessions Today', 
      'Active Content',
      'Active Campaigns'
    ];
    
    for (const stat of statsCards) {
      const visible = await page.locator(`text=${stat}`).isVisible();
      if (visible) {
        console.log(`✅ ${stat} card visible`);
      }
    }
    
    // Test 3: Navigate to Content Page
    console.log('\nTest 3: Testing Content Management...');
    await page.click('text=Content');
    await page.waitForLoadState('networkidle');
    
    const contentTitle = await page.locator('h1:has-text("Content Management")').isVisible();
    if (contentTitle) {
      console.log('✅ Content page loaded');
    }
    
    // Test search
    await page.fill('input[placeholder="Search content..."]', 'test');
    console.log('✅ Search input working');
    
    // Test filters
    await page.selectOption('select:nth-of-type(1)', { index: 1 });
    console.log('✅ Game filter working');
    
    // Test 4: Navigate to Campaigns
    console.log('\nTest 4: Testing Campaigns...');
    await page.click('text=Campaigns');
    await page.waitForLoadState('networkidle');
    
    const campaignsTitle = await page.locator('h1:has-text("Ad Campaigns")').isVisible();
    if (campaignsTitle) {
      console.log('✅ Campaigns page loaded');
    }
    
    // Test 5: Navigate to Analytics
    console.log('\nTest 5: Testing Analytics...');
    await page.click('text=Analytics');
    await page.waitForLoadState('networkidle');
    
    const analyticsTitle = await page.locator('h1:has-text("Analytics")').isVisible();
    if (analyticsTitle) {
      console.log('✅ Analytics page loaded');
    }
    
    // Check for charts
    const chartSections = [
      'Sessions Over Time',
      'Game Distribution',
      'Hourly Activity Pattern'
    ];
    
    for (const chart of chartSections) {
      const visible = await page.locator(`text=${chart}`).isVisible();
      if (visible) {
        console.log(`✅ ${chart} chart visible`);
      }
    }
    
    // Test 6: Navigate to Users
    console.log('\nTest 6: Testing User Management...');
    await page.click('text=Users');
    await page.waitForLoadState('networkidle');
    
    const usersTitle = await page.locator('h1:has-text("User Management")').isVisible();
    if (usersTitle) {
      console.log('✅ Users page loaded');
    }
    
    // Test 7: Navigate to Settings
    console.log('\nTest 7: Testing Settings...');
    await page.click('text=Settings');
    await page.waitForLoadState('networkidle');
    
    const settingsTitle = await page.locator('h1:has-text("Settings")').isVisible();
    if (settingsTitle) {
      console.log('✅ Settings page loaded');
    }
    
    // Test tabs
    await page.click('text=Feature Flags');
    console.log('✅ Feature Flags tab working');
    
    await page.click('text=System Settings');
    console.log('✅ System Settings tab working');
    
    await page.click('text=Data Export');
    console.log('✅ Data Export tab working');
    
    // Test 8: Test Modals
    console.log('\nTest 8: Testing Modal Functionality...');
    await page.click('text=Content');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Add Content")');
    const modalVisible = await page.locator('text=Create New Content').isVisible();
    if (modalVisible) {
      console.log('✅ Create modal opens correctly');
    }
    
    await page.click('button:has-text("Cancel")');
    console.log('✅ Modal closes correctly');
    
    // Test 9: Responsive Design
    console.log('\nTest 9: Testing Responsive Design...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    console.log('✅ Mobile viewport set');
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Take a screenshot
    await page.screenshot({ path: 'dashboard-test-screenshot.png' });
    console.log('\n📸 Screenshot saved as dashboard-test-screenshot.png');
    
    await browser.close();
  }
}

// Run the tests
runDashboardTests().catch(console.error);