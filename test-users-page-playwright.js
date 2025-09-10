import { chromium } from 'playwright';

async function testUsersPage() {
  console.log('Testing Users Management page with admin account...\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. Logging in as admin...');
    await page.goto('http://localhost:3000/login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'merssss12345@gmail.com');
    await page.fill('input[type="password"]', 'Clika@2025Admin');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('   ✅ Logged in successfully');
    
    console.log('\n2. Navigating to Users page...');
    await page.click('a[href="/users"], button:has-text("Users"), span:has-text("Users")');
    
    // Wait for users page to load
    await page.waitForURL('**/users', { timeout: 10000 });
    console.log('   ✅ Users page loaded');
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    console.log('\n3. Checking user table content...');
    
    // Count table rows (excluding header)
    const rowCount = await page.locator('tbody tr').count();
    console.log(`   Found ${rowCount} users in the table`);
    
    // Get all user emails
    const emails = await page.locator('tbody tr td:nth-child(2)').allTextContents();
    console.log('\n   User emails found:');
    emails.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'users-page-after-fix.png', fullPage: true });
    console.log('\n4. Screenshot saved: users-page-after-fix.png');
    
    if (rowCount >= 9) {
      console.log('\n✅ SUCCESS! All users are now visible!');
    } else {
      console.log('\n⚠️  Still showing limited users. May need to refresh or check queries.');
      
      // Check for any error messages
      const errorElement = await page.locator('.text-red-500, .error, [role="alert"]').first();
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.textContent();
        console.log('   Error found:', errorText);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    console.log('\nTest completed. Browser will close in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

testUsersPage().catch(console.error);