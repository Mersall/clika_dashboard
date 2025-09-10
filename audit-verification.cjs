const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const auditResults = {
    authentication: {},
    dataIntegration: {},
    functionality: {},
    tooltips: {},
    contentOrdering: {},
    errors: []
  };
  
  try {
    console.log('🔍 Starting Deep Application Audit...\n');
    
    // 1. Test Authentication
    console.log('📋 Testing Authentication...');
    await page.goto('http://localhost:3000');
    
    // Try weak password
    await page.fill('input[type="email"]', 'testaudit@example.com');
    await page.fill('input[type="password"]', '123'); // Weak password
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    const weakPasswordAccepted = await page.$('text=Invalid login credentials') === null;
    auditResults.authentication.weakPasswordAccepted = weakPasswordAccepted;
    console.log(`  ❌ Weak passwords accepted: ${weakPasswordAccepted}`);
    
    // Test login without email verification
    await page.fill('input[type="email"]', 'admin@clika.com');
    await page.fill('input[type="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
      auditResults.authentication.loginSuccess = true;
      console.log('  ✅ Login successful');
    } catch (error) {
      auditResults.authentication.loginSuccess = false;
      console.log('  ❌ Login failed');
    }
    
    // 2. Test Dashboard Data Integration
    console.log('\n📊 Testing Dashboard Data Integration...');
    
    // Check stats
    const stats = await page.$$eval('.card p.text-xl', elements => 
      elements.map(el => el.textContent.trim())
    );
    
    auditResults.dataIntegration.dashboardStats = stats;
    const hasRealData = stats.some(stat => stat !== '0' && stat !== '-');
    console.log(`  ${hasRealData ? '✅' : '❌'} Dashboard stats: ${stats.join(', ')}`);
    
    // Check recent sessions
    const recentSessions = await page.$('text=Session activity will appear here');
    auditResults.dataIntegration.hasRecentSessions = !recentSessions;
    console.log(`  ${recentSessions ? '❌' : '✅'} Recent sessions: ${recentSessions ? 'Empty placeholder' : 'Has data'}`);
    
    // 3. Test Content Page
    console.log('\n📝 Testing Content Management...');
    await page.click('text=Content');
    await page.waitForTimeout(2000);
    
    // Check if content loads
    const contentRows = await page.$$('tbody tr');
    auditResults.dataIntegration.contentCount = contentRows.length;
    console.log(`  ${contentRows.length > 0 ? '✅' : '❌'} Content items: ${contentRows.length}`);
    
    // Test search
    await page.fill('input[placeholder*="Search"]', 'test');
    await page.waitForTimeout(1000);
    const searchWorking = (await page.$$('tbody tr')).length !== contentRows.length;
    auditResults.functionality.searchWorking = searchWorking;
    console.log(`  ${searchWorking ? '✅' : '❌'} Search functionality: ${searchWorking ? 'Working' : 'Not working'}`);
    
    // Test sorting
    const sortButton = await page.$('th button');
    if (sortButton) {
      await sortButton.click();
      await page.waitForTimeout(500);
      auditResults.functionality.sortingExists = true;
      console.log('  ✅ Sorting functionality exists');
    } else {
      auditResults.functionality.sortingExists = false;
      console.log('  ❌ No sorting functionality');
    }
    
    // 4. Test Tooltips Coverage
    console.log('\n💬 Testing Tooltip Coverage...');
    
    const pages = [
      { name: 'Dashboard', path: '/' },
      { name: 'Content', path: '/content' },
      { name: 'Campaigns', path: '/campaigns' },
      { name: 'Analytics', path: '/analytics' },
      { name: 'Users', path: '/users' },
      { name: 'Settings', path: '/settings' }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3000${pageInfo.path}`);
      await page.waitForTimeout(1000);
      
      const tooltips = await page.$$('button svg[class*="h-4"]');
      auditResults.tooltips[pageInfo.name] = tooltips.length;
      console.log(`  ${pageInfo.name}: ${tooltips.length} tooltips`);
    }
    
    // 5. Test Export Functionality
    console.log('\n📥 Testing Export Functionality...');
    await page.goto('http://localhost:3000/content');
    await page.waitForTimeout(1000);
    
    const exportButton = await page.$('button:has-text("Export")');
    if (exportButton) {
      await exportButton.click();
      await page.waitForTimeout(1000);
      // Check if download started
      auditResults.functionality.exportWorking = false; // Would need to check downloads
      console.log('  ❌ Export button exists but functionality not verified');
    } else {
      auditResults.functionality.exportWorking = false;
      console.log('  ❌ No export button found');
    }
    
    // 6. Test Campaign Creation
    console.log('\n🎯 Testing Campaign Management...');
    await page.goto('http://localhost:3000/campaigns');
    await page.waitForTimeout(1000);
    
    const campaignRows = await page.$$('tbody tr');
    auditResults.dataIntegration.campaignCount = campaignRows.length;
    console.log(`  ${campaignRows.length > 0 ? '✅' : '❌'} Campaigns: ${campaignRows.length}`);
    
    // 7. Test User Management
    console.log('\n👥 Testing User Management...');
    await page.goto('http://localhost:3000/users');
    await page.waitForTimeout(1000);
    
    const userRows = await page.$$('tbody tr');
    auditResults.dataIntegration.userCount = userRows.length;
    console.log(`  ${userRows.length > 0 ? '✅' : '❌'} Users displayed: ${userRows.length}`);
    
    // Test create user
    const createButton = await page.$('button:has-text("Create")');
    if (createButton) {
      await createButton.click();
      await page.waitForTimeout(1000);
      const modal = await page.$('[role="dialog"]');
      auditResults.functionality.userCreateModal = !!modal;
      console.log(`  ${modal ? '✅' : '❌'} User creation modal: ${modal ? 'Opens' : 'Doesn\'t open'}`);
      
      if (modal) {
        await page.keyboard.press('Escape');
      }
    }
    
    // 8. Test Settings Persistence
    console.log('\n⚙️ Testing Settings...');
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(1000);
    
    // Try to change a setting
    const toggles = await page.$$('input[type="checkbox"]');
    if (toggles.length > 0) {
      const initialState = await toggles[0].isChecked();
      await toggles[0].click();
      await page.waitForTimeout(500);
      
      // Refresh page
      await page.reload();
      await page.waitForTimeout(1000);
      
      const newState = await toggles[0].isChecked();
      auditResults.functionality.settingsPersist = initialState !== newState;
      console.log(`  ${initialState !== newState ? '✅' : '❌'} Settings persistence: ${initialState !== newState ? 'Working' : 'Not working'}`);
    }
    
    // 9. Test Analytics Real Data
    console.log('\n📈 Testing Analytics Data...');
    await page.goto('http://localhost:3000/analytics');
    await page.waitForTimeout(2000);
    
    // Check if charts have data
    const chartElements = await page.$$('canvas, svg.recharts-surface');
    auditResults.dataIntegration.chartsPresent = chartElements.length;
    console.log(`  ${chartElements.length > 0 ? '✅' : '❌'} Charts rendered: ${chartElements.length}`);
    
    // 10. Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    auditResults.errors = consoleErrors;
    console.log(`\n🚨 Console errors: ${consoleErrors.length}`);
    consoleErrors.forEach(err => console.log(`  - ${err}`));
    
  } catch (error) {
    console.error('Audit error:', error);
    auditResults.errors.push(error.message);
  }
  
  // Generate summary
  console.log('\n📊 AUDIT SUMMARY:');
  console.log('==================');
  console.log(JSON.stringify(auditResults, null, 2));
  
  await browser.close();
})();