import { chromium } from 'playwright';

async function testLogin() {
  console.log('Starting Playwright login test...');
  console.log('Email: merssss12345@gmail.com');
  console.log('Password: Clika@2025Admin\n');

  const browser = await chromium.launch({ 
    headless: false,  // Show browser window
    slowMo: 500      // Slow down actions to see what's happening
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // Log network errors
    page.on('requestfailed', request => {
      console.log('Request failed:', request.url(), request.failure().errorText);
    });

    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png' });
    console.log('   ✅ Login page loaded (screenshot: login-page.png)');
    
    // Wait for form elements
    console.log('\n2. Filling login form...');
    
    // Check if email field exists
    const emailField = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const emailCount = await emailField.count();
    if (emailCount === 0) {
      console.log('   ❌ Email field not found!');
      // Try to find any input field
      const allInputs = await page.locator('input').all();
      console.log(`   Found ${allInputs.length} input fields total`);
      for (let i = 0; i < allInputs.length; i++) {
        const type = await allInputs[i].getAttribute('type');
        const name = await allInputs[i].getAttribute('name');
        const id = await allInputs[i].getAttribute('id');
        console.log(`   Input ${i}: type="${type}", name="${name}", id="${id}"`);
      }
    } else {
      await emailField.fill('merssss12345@gmail.com');
      console.log('   ✅ Email entered');
    }
    
    // Check if password field exists
    const passwordField = await page.locator('input[type="password"]').first();
    const passwordCount = await passwordField.count();
    if (passwordCount === 0) {
      console.log('   ❌ Password field not found!');
    } else {
      await passwordField.fill('Clika@2025Admin');
      console.log('   ✅ Password entered');
    }
    
    // Take screenshot after filling form
    await page.screenshot({ path: 'login-filled.png' });
    console.log('   Screenshot saved: login-filled.png');
    
    console.log('\n3. Submitting form...');
    
    // Find submit button
    const submitButton = await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    const submitCount = await submitButton.count();
    if (submitCount === 0) {
      console.log('   ❌ Submit button not found!');
      // List all buttons
      const allButtons = await page.locator('button').all();
      console.log(`   Found ${allButtons.length} buttons:`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        console.log(`   Button ${i}: "${text}"`);
      }
    } else {
      // Intercept the login request
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/auth/') && response.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => null);
      
      await submitButton.click();
      console.log('   ✅ Submit button clicked');
      
      // Wait for response or navigation
      const response = await responsePromise;
      if (response) {
        console.log(`   API Response: ${response.status()} ${response.statusText()}`);
        if (response.status() >= 400) {
          const body = await response.text().catch(() => 'Could not read body');
          console.log('   Response body:', body);
        }
      }
    }
    
    console.log('\n4. Waiting for navigation or error...');
    
    // Wait for either navigation or error message
    await Promise.race([
      page.waitForURL('**/dashboard', { timeout: 10000 }).then(() => console.log('   ✅ Redirected to dashboard!')),
      page.waitForURL('**/', { timeout: 10000 }).then(() => console.log('   ✅ Redirected to home!')),
      page.waitForSelector('.text-red-500, .error, .alert-error, [role="alert"]', { timeout: 10000 })
        .then(async (error) => {
          const errorText = await error.textContent();
          console.log('   ❌ Error message displayed:', errorText);
        }),
      new Promise(resolve => setTimeout(resolve, 10000))
    ]);
    
    // Take final screenshot
    await page.screenshot({ path: 'login-result.png', fullPage: true });
    console.log('\n5. Final screenshot saved: login-result.png');
    console.log('   Current URL:', page.url());
    
    // Check if we're logged in by looking for user menu or logout button
    const userMenu = await page.locator('button:has-text("merssss12345@gmail.com"), button:has-text("Merssal Admin"), button:has-text("Logout"), button:has-text("تسجيل الخروج")').first();
    const userMenuCount = await userMenu.count();
    if (userMenuCount > 0) {
      console.log('\n✅ LOGIN SUCCESSFUL! User menu found.');
    } else {
      console.log('\n❌ Login appears to have failed - no user menu found');
      
      // Get page content for debugging
      const pageTitle = await page.title();
      console.log('Page title:', pageTitle);
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\nTest completed. Browser will close in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

testLogin().catch(console.error);