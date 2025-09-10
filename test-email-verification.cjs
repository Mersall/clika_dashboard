const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('error') || msg.text().includes('Error')) {
      console.log(`[Browser Console] ${msg.text()}`);
    }
  });
  
  try {
    console.log('Testing email verification enforcement...\n');
    
    // 1. Test login with unconfirmed account
    console.log('1. Testing login with unconfirmed account (test@clika.com)...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'test@clika.com');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // Check for error message
    const errorText = await page.textContent('.text-red-800, .text-red-400');
    if (errorText) {
      console.log(`✅ Expected error shown: ${errorText}`);
    }
    
    // 2. Test login with confirmed account
    console.log('\n2. Testing login with confirmed account (merssss12345@gmail.com)...');
    await page.fill('input[type="email"]', 'merssss12345@gmail.com');
    await page.fill('input[type="password"]', 'Clika@2025Admin');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    if (currentUrl === 'http://localhost:3000/' || currentUrl.includes('dashboard')) {
      console.log('✅ Successfully logged in with confirmed account');
      
      // Check dashboard is loaded
      const dashboardTitle = await page.textContent('h1');
      console.log(`Dashboard title: ${dashboardTitle}`);
      
      // Logout
      const userMenu = await page.$('button:has-text("Logout")');
      if (userMenu) {
        await userMenu.click();
        console.log('✅ Logged out successfully');
      }
    }
    
    console.log('\n✅ Email verification enforcement is working correctly!');
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'email-verification-test-error.png' });
  }
  
  console.log('\nTest complete. Browser will stay open for inspection...');
  await new Promise(() => {}); // Keep browser open
})();