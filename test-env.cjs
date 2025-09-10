const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Inject script to check environment variables
    const envCheck = await page.evaluate(() => {
      // Check if import.meta.env exists
      if (typeof import !== 'undefined' && import.meta && import.meta.env) {
        return {
          url: import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          allEnv: Object.keys(import.meta.env)
        };
      } else {
        return {
          error: 'import.meta.env not available',
          // Try window object
          windowUrl: window.VITE_SUPABASE_URL
        };
      }
    });
    
    console.log('\nEnvironment Variables Check:');
    console.log('Supabase URL:', envCheck.url);
    console.log('Has Anon Key:', envCheck.hasKey);
    console.log('All env vars:', envCheck.allEnv);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();