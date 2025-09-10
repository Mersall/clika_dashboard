const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable detailed console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`[CONSOLE ERROR]`, text);
    } else {
      console.log(`[CONSOLE ${type.toUpperCase()}]`, text);
    }
  });

  page.on('pageerror', error => {
    console.error('[PAGE ERROR]', error);
  });

  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('supabase')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('supabase')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    console.error(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Testing auth persistence and refresh behavior...');

  try {
    // First, login
    console.log('\n1. Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@clika.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✓ Login successful, now on dashboard');
    
    // Check localStorage
    console.log('\n2. Checking localStorage after login...');
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    console.log('LocalStorage auth data:', Object.keys(localStorageData));
    
    // Check if session exists
    const hasSession = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(key => key.includes('supabase.auth.token'));
    });
    console.log('Has auth session in localStorage:', hasSession);
    
    // Now refresh the page
    console.log('\n3. Refreshing the page...');
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait a bit to see what happens
    await page.waitForTimeout(2000);
    
    // Check localStorage after refresh
    console.log('\n4. Checking localStorage after refresh...');
    const localStorageAfterRefresh = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    console.log('LocalStorage auth data after refresh:', Object.keys(localStorageAfterRefresh));
    
    // Check if we're stuck on loading
    const loadingText = await page.locator('text=Loading authentication').count();
    if (loadingText > 0) {
      console.log('\n⚠️  App is stuck on loading screen after refresh');
      
      // Check network tab for failed requests
      console.log('\n5. Checking for failed requests...');
      
      // Take a screenshot
      await page.screenshot({ path: 'auth-persistence-issue.png' });
      console.log('Screenshot saved as auth-persistence-issue.png');
      
      // Try to get more debug info
      const debugInfo = await page.evaluate(() => {
        return {
          windowLocation: window.location.href,
          hasLocalStorage: typeof localStorage !== 'undefined',
          localStorageLength: localStorage.length,
        };
      });
      console.log('\nDebug info:', debugInfo);
      
    } else {
      console.log('✓ Page loaded successfully after refresh');
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);
    }
    
    console.log('\nWaiting 5 seconds for observation...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();