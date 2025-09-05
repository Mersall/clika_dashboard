# Clika Dashboard Test Scenarios with Playwright

## Prerequisites
1. Install dependencies: `yarn install` or `npm install`
2. Start dev server: `yarn dev` or `npm run dev`
3. Server should be running on http://localhost:5173

## Test Scenarios

### 1. Login Page Test
```javascript
// Navigate to dashboard
await page.goto('http://localhost:5173');

// Check if redirected to login (if not in dev mode)
await expect(page).toHaveURL(/\/login/);

// In dev mode, should auto-login and redirect to home
await expect(page).toHaveURL('http://localhost:5173/');
```

### 2. Home Page Test
```javascript
// Check main elements
await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

// Check stats cards
await expect(page.locator('text=Total Users')).toBeVisible();
await expect(page.locator('text=Sessions Today')).toBeVisible();
await expect(page.locator('text=Active Content')).toBeVisible();
await expect(page.locator('text=Active Campaigns')).toBeVisible();

// Check recent sessions
await expect(page.locator('text=Recent Sessions')).toBeVisible();

// Check top content
await expect(page.locator('text=Top Content')).toBeVisible();
```

### 3. Content Management Test
```javascript
// Navigate to content page
await page.click('text=Content');

// Test search
await page.fill('input[placeholder="Search content..."]', 'test');

// Test filters
await page.selectOption('select:has-text("All Games")', 'who_among_us');
await page.selectOption('select:has-text("All Status")', 'active');

// Test create button
await page.click('button:has-text("Add Content")');
await expect(page.locator('text=Create New Content')).toBeVisible();

// Fill form
await page.selectOption('select[name="game_key"]', 'who_among_us');
await page.fill('textarea[name="question"]', 'مين فينا بيحب القهوة؟');
await page.fill('input[name="tags"]', 'coffee, preferences');

// Cancel
await page.click('button:has-text("Cancel")');
```

### 4. Campaign Management Test
```javascript
// Navigate to campaigns
await page.click('text=Campaigns');

// Check table
await expect(page.locator('text=Campaign Name')).toBeVisible();

// Create campaign
await page.click('button:has-text("Create Campaign")');
await expect(page.locator('text=Create New Campaign')).toBeVisible();

// Fill campaign form
await page.fill('input[name="name"]', 'Test Campaign');
await page.selectOption('select[name="status"]', 'active');
await page.fill('input[name="priority"]', '50');

// Cancel
await page.click('button:has-text("Cancel")');
```

### 5. Analytics Test
```javascript
// Navigate to analytics
await page.click('text=Analytics');

// Check metrics
await expect(page.locator('text=Active Users')).toBeVisible();
await expect(page.locator('text=Total Sessions')).toBeVisible();

// Check charts
await expect(page.locator('text=Sessions Over Time')).toBeVisible();
await expect(page.locator('text=Game Distribution')).toBeVisible();
await expect(page.locator('text=Hourly Activity Pattern')).toBeVisible();

// Test date range selector
await page.selectOption('select', '30d');
```

### 6. User Management Test
```javascript
// Navigate to users
await page.click('text=Users');

// Test search
await page.fill('input[placeholder="Search users..."]', 'ahmed');

// Test role filter
await page.selectOption('select:has-text("All Roles")', 'admin');

// Check user stats
await expect(page.locator('text=Total Users')).toBeVisible();
await expect(page.locator('text=With Geo Consent')).toBeVisible();
```

### 7. Settings Test
```javascript
// Navigate to settings
await page.click('text=Settings');

// Test tabs
await page.click('text=Game Configuration');
await expect(page.locator('text=Exploration Rate')).toBeVisible();

await page.click('text=Feature Flags');
await page.click('text=System Settings');
await page.click('text=Data Export');

// Test export buttons
await expect(page.locator('button:has-text("Export Users")')).toBeVisible();
await expect(page.locator('button:has-text("Export Sessions")')).toBeVisible();
```

### 8. Navigation Test
```javascript
// Test all navigation links
const pages = ['Dashboard', 'Content', 'Campaigns', 'Analytics', 'Users', 'Settings'];

for (const pageName of pages) {
  await page.click(`text=${pageName}`);
  await page.waitForLoadState('networkidle');
  // Add specific checks for each page
}
```

### 9. Responsive Design Test
```javascript
// Test mobile viewport
await page.setViewportSize({ width: 375, height: 667 });

// Check if navigation is responsive
// Check if tables are scrollable
// Check if modals fit screen
```

### 10. Error Handling Test
```javascript
// Test network errors
// Intercept API calls and return errors
// Check if error toasts appear
// Check if loading states work
```

## Running Tests with Playwright

```bash
# Install Playwright
npm install -D @playwright/test

# Create test file
# dashboard.spec.ts

# Run tests
npx playwright test
```

## Expected Results
- All pages load without errors
- Data is fetched and displayed correctly
- Forms validate input properly
- Filters and search work as expected
- Navigation is smooth
- Responsive design works on mobile
- Error states are handled gracefully