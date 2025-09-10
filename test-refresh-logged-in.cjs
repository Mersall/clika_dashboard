const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });

  page.on('pageerror', error => {
    console.error('[PAGE ERROR]', error);
  });

  console.log('Testing refresh while logged in...');

  try {
    // First, login
    console.log('\n1. Logging in...');
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'admin@clika.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('http://localhost:3001/', { timeout: 5000 });
    console.log('✓ Login successful, now on dashboard');
    
    // Now refresh the page
    console.log('\n2. Refreshing the page...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait a bit to see what happens
    await page.waitForTimeout(3000);
    
    // Check if we're stuck on loading
    const loadingText = await page.locator('text=Loading authentication').count();
    if (loadingText > 0) {
      console.log('⚠️  App is stuck on loading screen after refresh');
      
      // Take a screenshot
      await page.screenshot({ path: 'refresh-loading-stuck.png' });
      console.log('Screenshot saved as refresh-loading-stuck.png');
    } else {
      console.log('✓ Page loaded successfully after refresh');
    }
    
    // Check current URL
    const currentUrl = page.url();
    console.log('\nCurrent URL after refresh:', currentUrl);
    
    // Check for dashboard content
    const dashboardTitle = await page.locator('h1').textContent();
    console.log('Page title:', dashboardTitle);
    
    console.log('\nWaiting 10 seconds for observation...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();