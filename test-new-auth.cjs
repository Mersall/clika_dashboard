const { chromium } = require('@playwright/test');

const ADMIN_EMAIL = 'merssal@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function testNewAuth() {
  console.log('🧪 Testing new authentication implementation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Auth') || text.includes('error')) {
      console.log('📋', msg.type().toUpperCase(), ':', text);
    }
  });
  
  try {
    // Test 1: Initial page load
    console.log('📍 Test 1: Initial page load');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✅ Should redirect to login:', page.url().includes('/login'));
    
    // Test 2: Login
    console.log('\n📍 Test 2: Login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');
    
    // Check auth state
    const authState = await page.evaluate(() => {
      const token = localStorage.getItem('sb-mdrgxkflxurntyjtfjan-auth-token');
      return {
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      };
    });
    console.log('📦 Auth token:', authState);
    
    // Test 3: Page refresh
    console.log('\n📍 Test 3: Page refresh');
    await page.reload({ waitUntil: 'networkidle' });
    
    // Check if still on dashboard
    await page.waitForTimeout(2000);
    const urlAfterRefresh = page.url();
    console.log('📍 URL after refresh:', urlAfterRefresh);
    console.log('✅ Still authenticated:', !urlAfterRefresh.includes('/login'));
    
    // Check for loading state
    const hasLoadingSpinner = await page.isVisible('.animate-spin');
    console.log('⏳ Shows loading spinner:', hasLoadingSpinner);
    
    // Test 4: Navigate to different pages
    console.log('\n📍 Test 4: Navigation');
    await page.click('a[href="/content"]');
    await page.waitForTimeout(1000);
    console.log('✅ Navigated to content page');
    
    await page.click('a[href="/analytics"]');
    await page.waitForTimeout(1000);
    console.log('✅ Navigated to analytics page');
    
    // Test 5: Logout
    console.log('\n📍 Test 5: Logout');
    const logoutButton = page.locator('button[title*="Logout"]').first();
    await logoutButton.click();
    
    await page.waitForURL('**/login', { timeout: 5000 });
    console.log('✅ Logout successful, redirected to login');
    
    // Check auth cleared
    const authStateAfterLogout = await page.evaluate(() => {
      const token = localStorage.getItem('sb-mdrgxkflxurntyjtfjan-auth-token');
      return { hasToken: !!token };
    });
    console.log('📦 Auth token after logout:', authStateAfterLogout);
    
    // Test 6: Try to access protected route after logout
    console.log('\n📍 Test 6: Protected route after logout');
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✅ Redirected to login:', page.url().includes('/login'));
    
    console.log('\n✅ All tests passed!');
    console.log('⏸️  Keeping browser open for manual inspection...');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'test-failure.png', fullPage: true });
    await browser.close();
  }
}

testNewAuth();