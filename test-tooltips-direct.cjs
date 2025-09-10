const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate directly to login with URL hash to bypass auth
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Try to find and click the sign-up link
    const signupLink = await page.$('text=Sign up');
    if (signupLink) {
      console.log('Found sign up link, clicking...');
      await signupLink.click();
      await page.waitForTimeout(1000);
    }
    
    // Fill in sign up form
    console.log('Creating test account...');
    await page.fill('input[type="email"]', 'tooltiptest@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for any response
    await page.waitForTimeout(3000);
    
    // Check if we're logged in by looking for dashboard elements
    const dashboardTitle = await page.$('h1');
    if (dashboardTitle) {
      const text = await dashboardTitle.textContent();
      console.log('Page title:', text);
    }
    
    // Look for help tooltips
    console.log('\nSearching for tooltips...');
    
    // Try different selectors
    const selectors = [
      'button:has(svg)',
      '[class*="help"]',
      '[class*="tooltip"]',
      'svg[class*="h-4"]',
      'svg[class*="h-5"]',
      'button'
    ];
    
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements matching "${selector}"`);
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tooltip-search-result.png' });
    
    // Check page HTML for HelpTooltip
    const pageContent = await page.content();
    const hasHelpTooltip = pageContent.includes('HelpTooltip');
    const hasQuestionIcon = pageContent.includes('QuestionMarkCircleIcon');
    console.log('\nPage analysis:');
    console.log('Contains HelpTooltip:', hasHelpTooltip);
    console.log('Contains QuestionMarkCircleIcon:', hasQuestionIcon);
    
    // Try to navigate to different pages
    const navLinks = ['Content', 'Campaigns', 'Analytics', 'Users'];
    for (const link of navLinks) {
      const navElement = await page.$(`text=${link}`);
      if (navElement) {
        console.log(`\nNavigating to ${link}...`);
        await navElement.click();
        await page.waitForTimeout(2000);
        
        // Count tooltips
        const tooltips = await page.$$('button:has(svg[class*="h-4"])');
        console.log(`Found ${tooltips.length} potential tooltips on ${link} page`);
        
        if (tooltips.length > 0) {
          console.log('Testing first tooltip...');
          await tooltips[0].hover();
          await page.waitForTimeout(500);
          
          const tooltipPopup = await page.$('div[style*="position: fixed"][style*="z-index"]');
          if (tooltipPopup) {
            const content = await tooltipPopup.textContent();
            console.log('Tooltip content:', content);
          } else {
            console.log('No tooltip popup found');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'error-direct-test.png' });
  }
  
  await browser.close();
})();