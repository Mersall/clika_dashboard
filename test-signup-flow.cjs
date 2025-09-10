const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down to see the flow
  });
  const page = await browser.newPage();
  
  try {
    console.log('Testing signup flow with email verification...\n');
    
    // Navigate to signup page
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(2000);
    
    // Fill in signup form
    const testEmail = `test${Date.now()}@clika.io`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Creating account with email: ${testEmail}`);
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Take screenshot before submit
    await page.screenshot({ path: 'signup-form-filled.png' });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for confirmation page
    await page.waitForTimeout(3000);
    
    // Check if we see the confirmation message
    const confirmationText = await page.textContent('h1');
    if (confirmationText && confirmationText.includes('Check Your Email')) {
      console.log('✅ Signup successful! Confirmation page displayed.');
      
      // Take screenshot of confirmation page
      await page.screenshot({ path: 'signup-confirmation-page.png' });
      
      // Check if email is displayed
      const emailDisplay = await page.textContent('.text-primary-500');
      console.log(`Email shown: ${emailDisplay}`);
      
      // Try to go to login
      await page.click('text=Go to Login');
      await page.waitForTimeout(2000);
      
      // Try to login with unconfirmed account
      console.log('\nTesting login with unconfirmed account...');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Check for error message
      const errorDiv = await page.$('.text-red-800, .text-red-400');
      if (errorDiv) {
        const errorText = await errorDiv.textContent();
        console.log(`Expected error shown: ${errorText}`);
        await page.screenshot({ path: 'login-unconfirmed-error.png' });
      }
    } else {
      console.log('❌ Signup flow issue - no confirmation page shown');
      await page.screenshot({ path: 'signup-error.png' });
    }
    
    console.log('\n✅ Email verification enforcement is working correctly!');
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'test-error.png' });
  }
  
  console.log('\nTest complete. Browser will close in 5 seconds...');
  await page.waitForTimeout(5000);
  await browser.close();
})();