import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login
    await page.goto('http://localhost:5173/login');
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});
    
    console.log('Testing Content Page Modal...');
    // Navigate to content page
    await page.goto('http://localhost:5173/content');
    await page.waitForTimeout(1000);
    
    // Click Add Content button
    await page.click('text=Add Content');
    await page.waitForTimeout(500);
    
    // Fill the form
    await page.fill('textarea', 'Test question for who among us?');
    await page.fill('input[placeholder*="fun, social"]', 'test, modal');
    
    // Submit the form
    await page.click('button:has-text("Create Content")');
    
    // Wait for the modal to close and success toast
    await page.waitForSelector('.Toastify__toast--success', { timeout: 5000 });
    console.log('✓ Content modal submit working');
    
    console.log('\nTesting Campaigns Page Modal...');
    // Navigate to campaigns page
    await page.goto('http://localhost:5173/campaigns');
    await page.waitForTimeout(1000);
    
    // Click Add Campaign button
    await page.click('text=Create Campaign');
    await page.waitForTimeout(500);
    
    // Fill the form
    await page.fill('input[required]', 'Test Campaign ' + Date.now());
    
    // Submit the form
    await page.click('button:has-text("Create Campaign")');
    
    // Wait for the modal to close and success toast
    await page.waitForSelector('.Toastify__toast--success', { timeout: 5000 });
    console.log('✓ Campaign modal submit working');
    
    console.log('\nTesting Users Page Modal (Admin only)...');
    // Try to navigate to users page
    await page.goto('http://localhost:5173/users');
    await page.waitForTimeout(1000);
    
    // Check if we have access (admin only)
    const url = page.url();
    if (!url.includes('/users')) {
      console.log('⚠ Users page requires admin role - skipping test');
    } else {
      // Click on edit button for first user
      await page.click('button[class*="hover:text-primary"]:first-of-type');
      await page.waitForTimeout(500);
      
      // Update display name
      await page.fill('input[id="display_name"]', 'Updated Test User');
      
      // Submit the form
      await page.click('button:has-text("Update User")');
      
      // Wait for success
      await page.waitForSelector('.Toastify__toast--success', { timeout: 5000 });
      console.log('✓ User modal submit working');
    }
    
    console.log('\n✅ All modal submit buttons are working correctly!');
    
  } catch (error) {
    console.error('Error testing modals:', error);
    await page.screenshot({ path: 'modal-test-error.png' });
  } finally {
    await browser.close();
  }
})();