import puppeteer from 'puppeteer';

const ADMIN_EMAIL = 'merssal@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function testAuthRefreshIssue() {
  console.log('🔍 Testing authentication refresh issue...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    } else if (msg.text().includes('Auth')) {
      console.log('🔐', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
  });
  
  try {
    // 1. Initial login
    console.log('1️⃣ Navigating to login page...');
    await page.goto('http://localhost:5173/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('2️⃣ Logging in...');
    await page.type('input[type="email"]', ADMIN_EMAIL);
    await page.type('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful, redirected to:', page.url());
    
    // Check localStorage
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('sb-mdrgxkflxurntyjtfjan-auth-token');
    });
    console.log('📦 Auth token exists:', !!authToken);
    
    if (authToken) {
      const parsed = JSON.parse(authToken);
      console.log('📦 Token expires at:', new Date(parsed.expires_at * 1000).toLocaleString());
      console.log('📦 Has refresh token:', !!parsed.refresh_token);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Refresh the page
    console.log('\n3️⃣ Refreshing page...');
    await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check if we're still on the dashboard or redirected
    console.log('📍 After refresh URL:', page.url());
    
    // Check for loading state
    const isLoading = await page.evaluate(() => {
      const loadingElement = document.querySelector('[class*="animate-spin"]');
      return !!loadingElement;
    });
    console.log('⏳ Page showing loading spinner:', isLoading);
    
    if (isLoading) {
      console.log('⏳ Waiting for loading to complete...');
      // Wait up to 10 seconds for loading to finish
      try {
        await page.waitForSelector('[class*="animate-spin"]', { 
          hidden: true, 
          timeout: 10000 
        });
        console.log('✅ Loading completed');
      } catch (e) {
        console.log('❌ Loading did not complete within 10 seconds');
        
        // Take a screenshot
        await page.screenshot({ path: 'stuck-loading.png', fullPage: true });
        console.log('📸 Screenshot saved as stuck-loading.png');
      }
    }
    
    // 3. Try to click logout
    console.log('\n4️⃣ Attempting to click logout...');
    try {
      await page.click('button:has-text("Logout")', { timeout: 5000 });
      console.log('✅ Logout button clicked');
    } catch (e) {
      console.log('❌ Could not click logout button');
      
      // Check if button exists but is disabled
      const logoutButtonState = await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Logout'));
        if (!button) return 'not found';
        return button.disabled ? 'disabled' : 'enabled';
      });
      console.log('🔘 Logout button state:', logoutButtonState);
    }
    
    // Check auth state from console
    const authState = await page.evaluate(() => {
      return {
        url: window.location.href,
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage)
      };
    });
    console.log('\n📊 Current state:');
    console.log('  URL:', authState.url);
    console.log('  localStorage keys:', authState.localStorage);
    console.log('  sessionStorage keys:', authState.sessionStorage);
    
    console.log('\n⏸️  Keeping browser open for manual inspection...');
    console.log('Press Ctrl+C to exit');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    await browser.close();
  }
}

testAuthRefreshIssue();