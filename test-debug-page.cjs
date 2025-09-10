const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('Browser error:', text);
    } else if (type === 'log' && text.includes('Supabase')) {
      console.log('Browser log:', text);
    }
  });
  
  try {
    // Navigate to debug page
    console.log('Navigating to debug page...');
    await page.goto('http://localhost:3000/debug');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-page.png' });
    
    // Check if we're redirected to login
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('Redirected to login. Attempting login...');
      
      // Login with confirmed account
      await page.fill('input[type="email"]', 'merssss12345@gmail.com');
      await page.fill('input[type="password"]', 'Clika@2025Admin');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Try navigating to debug page again
      await page.goto('http://localhost:3000/debug');
      await page.waitForTimeout(3000);
    }
    
    // Check for debug info
    const envInfo = await page.textContent('.card');
    console.log('\nDebug page content:', envInfo);
    
    // Take final screenshot
    await page.screenshot({ path: 'debug-page-final.png' });
    
    // Look for the stats
    const stats = await page.$$eval('.bg-gray-100 p', elements => 
      elements.map(el => el.textContent.trim())
    );
    console.log('\nStats found:', stats);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open. Press Ctrl+C to exit.');
  await new Promise(() => {}); // Keep process alive
})();