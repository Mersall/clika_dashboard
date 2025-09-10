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

  console.log('Testing infinite loading issue...');

  try {
    // Clear local storage and cookies
    await context.clearCookies();
    
    // Go to the app
    console.log('\nNavigating to app...');
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait a bit to see what happens
    await page.waitForTimeout(3000);
    
    // Check if we're stuck on loading
    const loadingText = await page.locator('text=Loading authentication').count();
    if (loadingText > 0) {
      console.log('⚠️  App is stuck on loading screen');
      
      // Open devtools console
      console.log('\nChecking console for errors...');
      
      // Take a screenshot
      await page.screenshot({ path: 'infinite-loading.png' });
      console.log('Screenshot saved as infinite-loading.png');
    }
    
    // Check current URL
    const currentUrl = page.url();
    console.log('\nCurrent URL:', currentUrl);
    
    // Check for any visible errors
    const errorText = await page.locator('text=Error').count();
    if (errorText > 0) {
      console.log('⚠️  Error text found on page');
    }
    
    console.log('\nWaiting for manual inspection...');
    await page.waitForTimeout(60000); // Keep browser open for debugging
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
})();