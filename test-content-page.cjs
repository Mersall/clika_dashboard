const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type}] ${text}`);
  });
  
  try {
    // Navigate to app
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('Logging in...');
      await page.fill('input[type="email"]', 'merssss12345@gmail.com');
      await page.fill('input[type="password"]', 'Clika@2025Admin');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Navigate to content page
    console.log('Navigating to content page...');
    await page.click('text=Content');
    await page.waitForTimeout(3000);
    
    // Check for content
    const contentRows = await page.$$('tbody tr');
    console.log(`\nContent rows found: ${contentRows.length}`);
    
    // Check for error messages
    const errorElement = await page.$('.text-red-500');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log('Error message:', errorText);
    }
    
    // Check for loading state
    const loadingElement = await page.$('.animate-spin');
    if (loadingElement) {
      console.log('Loading spinner detected');
    }
    
    // Check for no content message
    const noContentElement = await page.$('text=No content found');
    if (noContentElement) {
      console.log('No content message displayed');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'content-page.png' });
    
    // Check network requests to Supabase
    page.on('response', response => {
      if (response.url().includes('supabase.co')) {
        console.log(`Supabase response: ${response.status()} ${response.url()}`);
      }
    });
    
  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'content-error.png' });
  }
  
  // Keep browser open
  console.log('\nKeeping browser open for inspection...');
  await new Promise(() => {});
})();