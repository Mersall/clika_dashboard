import { chromium } from 'playwright';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/content', name: 'Content' },
  { path: '/campaigns', name: 'Campaigns' },
  { path: '/analytics', name: 'Analytics' },
  { path: '/users', name: 'Users' },
  { path: '/settings', name: 'Settings' }
];

async function testDashboard() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Testing CLIKA Dashboard with Playwright...\n');
  
  // Capture console messages and errors
  const consoleMessages = [];
  const pageErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(`Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    pageErrors.push(`Page Error: ${error.message}`);
  });
  
  for (const pageInfo of pages) {
    console.log(`Testing ${pageInfo.name} page (${pageInfo.path})...`);
    
    try {
      // Navigate to the page
      await page.goto(`http://localhost:3001${pageInfo.path}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // Wait a bit for any async operations
      await page.waitForTimeout(1000);
      
      // Check page title
      const title = await page.title();
      
      // Check for loading spinners
      const loadingSpinners = await page.locator('.animate-spin').count();
      
      // Check for error messages
      const errorMessages = await page.locator('text=/error|failed/i').count();
      
      // Get main content
      const hasContent = await page.locator('main').count() > 0;
      
      console.log(`  ✓ Loaded successfully`);
      console.log(`  - Title: ${title}`);
      console.log(`  - Loading spinners: ${loadingSpinners}`);
      console.log(`  - Error messages: ${errorMessages}`);
      console.log(`  - Has main content: ${hasContent}`);
      
      // Page-specific checks
      if (pageInfo.path === '/content') {
        const contentItems = await page.locator('table tbody tr').count();
        console.log(`  - Content items: ${contentItems}`);
      }
      
      if (pageInfo.path === '/campaigns') {
        const campaigns = await page.locator('table tbody tr').count();
        console.log(`  - Campaigns: ${campaigns}`);
      }
      
      if (pageInfo.path === '/users') {
        const users = await page.locator('table tbody tr').count();
        console.log(`  - Users: ${users}`);
      }
      
    } catch (error) {
      console.log(`  ✗ Failed to load: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Report console errors
  if (consoleMessages.length > 0) {
    console.log('\nConsole Errors Found:');
    consoleMessages.forEach(msg => console.log(`  - ${msg}`));
  }
  
  if (pageErrors.length > 0) {
    console.log('\nPage Errors Found:');
    pageErrors.forEach(msg => console.log(`  - ${msg}`));
  }
  
  await browser.close();
}

testDashboard().catch(console.error);