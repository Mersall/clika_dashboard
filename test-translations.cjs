const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Testing translation functionality...');

  try {
    // Go to the login page
    await page.goto('http://localhost:3000/login');
    
    // Check for English text
    console.log('\nChecking English translations on login page:');
    const englishTitle = await page.textContent('h1');
    console.log('- Title:', englishTitle);
    
    const signInButton = await page.textContent('button[type="submit"]');
    console.log('- Sign in button:', signInButton);
    
    // Switch to Arabic
    console.log('\nSwitching to Arabic...');
    const languageSwitcher = await page.locator('button:has-text("English")').first();
    await languageSwitcher.click();
    await page.locator('button:has-text("العربية")').click();
    
    // Check for Arabic text
    console.log('\nChecking Arabic translations:');
    await page.waitForTimeout(500); // Wait for language change
    
    const arabicTitle = await page.textContent('h1');
    console.log('- Title:', arabicTitle);
    
    const arabicSignInButton = await page.textContent('button[type="submit"]');
    console.log('- Sign in button:', arabicSignInButton);
    
    // Check RTL direction
    const htmlDir = await page.getAttribute('html', 'dir');
    console.log('- HTML dir attribute:', htmlDir);
    
    // Login to check dashboard translations
    console.log('\nLogging in...');
    await page.fill('input[type="email"]', 'admin@clika.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    
    console.log('\nChecking dashboard translations:');
    const dashboardTitle = await page.textContent('h1');
    console.log('- Dashboard title (Arabic):', dashboardTitle);
    
    // Switch back to English
    const dashboardLangSwitcher = await page.locator('button:has-text("العربية")').first();
    await dashboardLangSwitcher.click();
    await page.locator('button:has-text("English")').click();
    
    await page.waitForTimeout(500);
    
    const dashboardTitleEn = await page.textContent('h1');
    console.log('- Dashboard title (English):', dashboardTitleEn);
    
    // Check navigation translations
    console.log('\nChecking navigation translations:');
    const navItems = await page.locator('nav a').allTextContents();
    console.log('- Navigation items:', navItems);
    
    console.log('\n✅ Translation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();