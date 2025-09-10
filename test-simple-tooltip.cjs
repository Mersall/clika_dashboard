const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page-tooltip-test.png' });
    
    // Login
    console.log('Logging in...');
    await page.fill('input[type="email"]', 'admin@clika.com');
    await page.fill('input[type="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login-tooltip-test.png' });
    
    // Check current URL
    console.log('Current URL:', page.url());
    
    // Look for tooltips - try different selectors
    const tooltips1 = await page.$$('button svg[class*="h-4"]');
    console.log(`Found ${tooltips1.length} buttons with h-4 svg`);
    
    const tooltips2 = await page.$$('[class*="QuestionMarkCircleIcon"]');
    console.log(`Found ${tooltips2.length} QuestionMarkCircleIcon elements`);
    
    const tooltips3 = await page.$$('button:has(svg)');
    console.log(`Found ${tooltips3.length} buttons with any svg`);
    
    // Check page content
    const pageContent = await page.content();
    const hasHelpTooltip = pageContent.includes('HelpTooltip');
    console.log('Page contains HelpTooltip:', hasHelpTooltip);
    
    const tooltips = tooltips3;
    
    if (tooltips.length > 0) {
      // Test first tooltip
      console.log('Testing first tooltip...');
      await tooltips[0].hover();
      await page.waitForTimeout(500);
      
      // Look for tooltip content
      const tooltipContent = await page.$('div[style*="position: fixed"]');
      if (tooltipContent) {
        const text = await tooltipContent.textContent();
        console.log('Tooltip content:', text);
        
        // Check positioning
        const box = await tooltipContent.boundingBox();
        console.log('Tooltip position:', box);
      } else {
        console.log('No tooltip appeared');
      }
      
      await page.screenshot({ path: 'tooltip-hover-test.png' });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'error-tooltip-test.png' });
  }
  
  await browser.close();
})();