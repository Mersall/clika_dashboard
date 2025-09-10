const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3001');
    
    // Login
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'merssal@clika.io');
    await page.fill('input[type="password"]', 'abc123456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });
    
    // Test dashboard stats tooltips
    console.log('Testing dashboard stats tooltips...');
    const statTooltips = await page.$$('[class*="HelpTooltip"]');
    console.log(`Found ${statTooltips.length} help tooltips on dashboard`);
    
    // Test first tooltip
    if (statTooltips.length > 0) {
      await statTooltips[0].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tooltip-hover-1.png' });
      
      // Check if tooltip is visible
      const tooltipContent = await page.$('[class*="bg-gray-900"]');
      if (tooltipContent) {
        const isVisible = await tooltipContent.isVisible();
        console.log('Tooltip visible after hover:', isVisible);
        
        // Get computed styles
        const styles = await tooltipContent.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            zIndex: computed.zIndex,
            position: computed.position,
            bottom: computed.bottom,
            display: computed.display
          };
        });
        console.log('Tooltip styles:', styles);
      }
    }
    
    // Navigate to content page
    await page.click('text=Content');
    await page.waitForSelector('text=Content Management');
    
    // Test table header tooltips
    console.log('\nTesting content table tooltips...');
    const tableTooltips = await page.$$('th [class*="HelpTooltip"]');
    console.log(`Found ${tableTooltips.length} help tooltips in table headers`);
    
    if (tableTooltips.length > 0) {
      await tableTooltips[0].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tooltip-table-1.png' });
    }
    
    // Switch to Arabic
    console.log('\nSwitching to Arabic...');
    await page.click('button:has-text("English")');
    await page.click('text=العربية');
    await page.waitForTimeout(1000);
    
    // Test RTL tooltips
    const rtlTooltips = await page.$$('[class*="HelpTooltip"]');
    if (rtlTooltips.length > 0) {
      await rtlTooltips[0].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tooltip-rtl-1.png' });
      
      // Check RTL positioning
      const tooltipContent = await page.$('[class*="bg-gray-900"]');
      if (tooltipContent) {
        const box = await tooltipContent.boundingBox();
        console.log('RTL tooltip position:', box);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-state.png' });
  }
  
  await browser.close();
})();