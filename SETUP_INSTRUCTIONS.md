# Setup Instructions for Clika Dashboard

## Missing Dependencies

The dashboard requires `@headlessui/react` which needs to be installed. Run:

```bash
npm install
# or
yarn install
```

This will install all dependencies including the newly added `@headlessui/react`.

## What's Been Implemented

### ✅ Completed Features:

1. **Home Page**
   - Real-time stats (users, sessions, content, campaigns)
   - Recent sessions list with user details
   - Top content by play count
   - Session trends visualization

2. **Content Management**
   - Full CRUD operations
   - Dynamic forms based on game type
   - Search and filtering (by game, status, depth)
   - Bulk tag management
   - Active/inactive status toggle

3. **Campaign Management**
   - Campaign creation with targeting options
   - Creative management (variants)
   - SOV% and daily cap controls
   - Start/end date scheduling
   - Geographic targeting

4. **Analytics Dashboard**
   - Sessions over time chart
   - Game distribution pie chart
   - Hourly activity patterns
   - Peak hours analysis
   - Performance metrics (completion rate, avg session time)
   - Export functionality

5. **User Management**
   - Search and filter by role
   - Edit user profiles
   - Manage consents (geo, personalized ads)
   - Invite new users
   - User activity tracking

6. **Settings Page**
   - Game configuration (exploration rate, max L4)
   - Feature flags with percentage rollout
   - System settings (maintenance mode, registration)
   - Data export (CSV) for all entities

7. **Authentication**
   - Role-based access control
   - Protected routes
   - Admin-only features
   - Development mode with auto-login

## What Still Might Be Missing

Based on the VibeCode.md specifications, these features might still be needed:

### 1. Content Review Workflow
- Two-eyes review process
- SPICE rubric scoring
- Review queue management
- Approval/rejection flow

### 2. Advanced Analytics
- Cohort analysis
- Retention metrics
- Funnel analysis
- Custom date ranges

### 3. Notification System
- Alert for review queue
- Campaign performance alerts
- System health monitoring

### 4. Bulk Operations
- Bulk content import
- Bulk status changes
- Bulk tag updates

### 5. API Integration Features
- Webhook management
- API key generation
- Rate limiting configuration

### 6. Advanced Filtering
- Date range filters on all tables
- Multi-select filters
- Saved filter presets

### 7. Audit Trail
- User action logging
- Content change history
- Campaign modification tracking

## To Run the Dashboard

1. Install dependencies:
   ```bash
   cd /Users/mersall/Desktop/Clika/clika-dashboard
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access at http://localhost:5173

## Environment Variables

Make sure `.env` file exists with:
```
VITE_SUPABASE_URL=https://mdrgxkflxurntyjtfjan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Authentication

In development mode, you're automatically logged in as admin.
In production, use your Supabase credentials.