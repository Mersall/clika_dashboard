const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions to see what's happening
  });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]`, msg.text());
  });
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('auth')) {
      console.log(`[Network Request] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('auth')) {
      console.log(`[Network Response] ${response.status()} ${response.url()}`);
      if (response.status() !== 200) {
        response.text().then(text => {
          console.log('[Response Body]', text);
        });
      }
    }
  });
  
  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    // Try with the known working account
    const testAccounts = [
      { email: 'merssss12345@gmail.com', password: 'Clika@2025Admin', name: 'Merssal Admin' },
      { email: 'dashboard@clika.com', password: 'Dashboard123!', name: 'Dashboard Admin' },
      { email: 'test@clika.com', password: 'Test123456!', name: 'Test User' }
    ];
    
    for (const account of testAccounts) {
      console.log(`\n--- Testing login with ${account.name} ---`);
      
      // Clear fields
      await page.fill('input[type="email"]', '');
      await page.fill('input[type="password"]', '');
      
      // Fill credentials
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      
      // Take screenshot before submit
      await page.screenshot({ path: `login-attempt-${account.name.replace(/\s+/g, '-')}.png` });
      
      // Submit form
      console.log('Submitting form...');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(5000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);
      
      // Check for error messages
      const toastError = await page.$('.text-red-500');
      if (toastError) {
        const errorText = await toastError.textContent();
        console.log('Error message:', errorText);
      }
      
      const errorDiv = await page.$('[role="alert"]');
      if (errorDiv) {
        const errorText = await errorDiv.textContent();
        console.log('Alert message:', errorText);
      }
      
      // If login successful
      if (currentUrl.includes('http://localhost:3000/') && !currentUrl.includes('login')) {
        console.log('✅ Login successful!');
        await page.screenshot({ path: `dashboard-logged-in-${account.name.replace(/\s+/g, '-')}.png` });
        
        // Check dashboard content
        const dashboardTitle = await page.$('h1');
        if (dashboardTitle) {
          const titleText = await dashboardTitle.textContent();
          console.log('Dashboard title:', titleText);
        }
        
        // Logout for next test
        await page.click('text=Logout');
        await page.waitForTimeout(2000);
        break;
      } else {
        console.log('❌ Login failed');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'login-error.png' });
  }
  
  console.log('\nTest complete. Browser will stay open for manual inspection.');
  await new Promise(() => {}); // Keep browser open
})();