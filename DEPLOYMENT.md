# Clika Dashboard Deployment Guide

## Deploying to Vercel

### Prerequisites
- Vercel account (sign up at vercel.com)
- Git repository with the dashboard code
- Supabase project credentials

### Step 1: Prepare for Deployment

1. Ensure all dependencies are installed:
```bash
npm install
```

2. Build the project locally to test:
```bash
npm run build
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# In the project directory
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Select the team (if applicable)
# - Confirm project settings
```

#### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add the following:
```
VITE_SUPABASE_URL=https://mdrgxkflxurntyjtfjan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmd4a2ZseHVybnR5anRmamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzE0NDEsImV4cCI6MjA3MjUwNzQ0MX0.FAEWes2gHOvhT3fJEiNXTG_gjzRBFt-hbujREtcF86o
```

### Step 4: Configure Custom Domain (Optional)

1. In Vercel Dashboard > Domains
2. Add your custom domain (e.g., dashboard.clika.com)
3. Update DNS records as instructed

### Step 5: Post-Deployment Setup

#### Security Headers
Already configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

#### Authentication
Users can log in with:
- Email: ahmedmersal44@gmail.com
- Role: Admin (has full access)

### Production URLs
- Dashboard: `https://your-project.vercel.app`
- Custom Domain: `https://dashboard.clika.com` (after configuration)

## Monitoring & Analytics

### Vercel Analytics
Enable in Project Settings > Analytics

### Error Monitoring
Consider adding Sentry:
```bash
npm install @sentry/react
```

Then configure in your app:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

## Troubleshooting

### Build Failures
- Check Node version compatibility
- Ensure all dependencies are listed in package.json
- Verify environment variables are set

### Authentication Issues
- Verify Supabase URL and Anon Key
- Check user roles in Supabase
- Ensure RLS policies are configured correctly

### Performance
- Enable caching in Vercel
- Use CDN for static assets
- Implement lazy loading for routes

## Maintenance

### Updating the Dashboard
```bash
# Make changes locally
git add .
git commit -m "Update dashboard"
git push

# Vercel will automatically deploy
```

### Database Migrations
Run migrations in Supabase Dashboard or using Supabase CLI:
```bash
supabase db push
```