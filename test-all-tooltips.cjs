const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const tooltipIssues = [];
  let totalTooltips = 0;
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Login
    console.log('Logging in...');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'admin@clika.com');
    await page.fill('input[type="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    console.log('Login successful!');
    
    // Test function to check tooltip visibility
    async function testTooltips(pageName) {
      console.log(`\n--- Testing ${pageName} ---`);
      
      // Find all help tooltips on the page
      const tooltips = await page.$$('button:has(svg[class*="h-4 w-4"]), button:has(svg[class*="h-5 w-5"]), button:has(svg[class*="h-6 w-6"])');
      const pageTooltipCount = tooltips.length;
      totalTooltips += pageTooltipCount;
      console.log(`Found ${pageTooltipCount} tooltips on ${pageName}`);
      
      for (let i = 0; i < tooltips.length; i++) {
        try {
          // Get button position
          const buttonBox = await tooltips[i].boundingBox();
          if (!buttonBox) continue;
          
          // Hover over tooltip button
          await tooltips[i].hover();
          await page.waitForTimeout(300);
          
          // Check if tooltip appeared
          const tooltipContent = await page.$('div[style*="position: fixed"][style*="z-index: 9999"]');
          
          if (tooltipContent) {
            // Check visibility
            const isVisible = await tooltipContent.isVisible();
            const tooltipBox = await tooltipContent.boundingBox();
            
            if (!isVisible || !tooltipBox) {
              tooltipIssues.push({
                page: pageName,
                index: i,
                issue: 'Tooltip not visible after hover',
                buttonPosition: buttonBox
              });
              console.log(`  ❌ Tooltip ${i + 1}: Not visible`);
            } else {
              // Check if tooltip is within viewport
              const viewport = page.viewportSize();
              if (tooltipBox.x < 0 || tooltipBox.y < 0 || 
                  tooltipBox.x + tooltipBox.width > viewport.width ||
                  tooltipBox.y + tooltipBox.height > viewport.height) {
                tooltipIssues.push({
                  page: pageName,
                  index: i,
                  issue: 'Tooltip partially outside viewport',
                  tooltipPosition: tooltipBox
                });
                console.log(`  ⚠️  Tooltip ${i + 1}: Partially outside viewport`);
              } else {
                console.log(`  ✅ Tooltip ${i + 1}: Visible and positioned correctly`);
              }
              
              // Check content
              const content = await tooltipContent.textContent();
              if (!content || content.trim() === '' || content.includes('help.')) {
                tooltipIssues.push({
                  page: pageName,
                  index: i,
                  issue: 'Missing translation',
                  content: content
                });
                console.log(`  ⚠️  Tooltip ${i + 1}: Missing translation - "${content}"`);
              }
            }
          } else {
            tooltipIssues.push({
              page: pageName,
              index: i,
              issue: 'Tooltip did not appear on hover'
            });
            console.log(`  ❌ Tooltip ${i + 1}: Did not appear`);
          }
          
          // Move away to hide tooltip
          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
          
        } catch (error) {
          tooltipIssues.push({
            page: pageName,
            index: i,
            issue: `Error testing tooltip: ${error.message}`
          });
          console.log(`  ❌ Tooltip ${i + 1}: Error - ${error.message}`);
        }
      }
      
      // Take screenshot of the page
      await page.screenshot({ path: `tooltips-${pageName.toLowerCase().replace(/\s+/g, '-')}.png` });
    }
    
    // Test Dashboard
    await testTooltips('Dashboard');
    
    // Test Content page
    await page.click('text=Content');
    await page.waitForSelector('text=Content Management');
    await testTooltips('Content Page');
    
    // Test Campaigns page
    await page.click('text=Campaigns');
    await page.waitForSelector('text=Ad Campaigns');
    await testTooltips('Campaigns Page');
    
    // Test Analytics page
    await page.click('text=Analytics');
    await page.waitForSelector('h1:has-text("Analytics")');
    await testTooltips('Analytics Page');
    
    // Test Users page
    await page.click('text=Users');
    await page.waitForSelector('text=User Management');
    await testTooltips('Users Page');
    
    // Test Settings page
    await page.click('text=Settings');
    await page.waitForSelector('h1:has-text("Settings")');
    await testTooltips('Settings Page');
    
    // Now test in Arabic
    console.log('\n=== TESTING ARABIC (RTL) ===');
    
    // Switch to Arabic
    await page.click('button:has-text("English")');
    await page.click('text=العربية');
    await page.waitForTimeout(1000);
    
    // Re-test Dashboard in Arabic
    await page.click('text=الرئيسية');
    await page.waitForTimeout(500);
    await testTooltips('Dashboard (Arabic)');
    
    // Test Content page in Arabic
    const contentBtn = await page.$('text=المحتوى');
    if (contentBtn) {
      await contentBtn.click();
      await page.waitForTimeout(500);
      await testTooltips('Content Page (Arabic)');
    }
    
    // Test Users page in Arabic
    const usersBtn = await page.$('text=المستخدمين');
    if (usersBtn) {
      await usersBtn.click();
      await page.waitForTimeout(500);
      await testTooltips('Users Page (Arabic)');
    }
    
    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total tooltips tested: ${totalTooltips}`);
    console.log(`Issues found: ${tooltipIssues.length}`);
    
    if (tooltipIssues.length > 0) {
      console.log('\nDetailed issues:');
      tooltipIssues.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.page} - Tooltip ${issue.index + 1}: ${issue.issue}`);
        if (issue.content) console.log(`   Content: "${issue.content}"`);
        if (issue.buttonPosition) console.log(`   Button position:`, issue.buttonPosition);
        if (issue.tooltipPosition) console.log(`   Tooltip position:`, issue.tooltipPosition);
      });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'error-state.png' });
  }
  
  await browser.close();
})();