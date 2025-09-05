# CLIKA Dashboard

A React-based admin dashboard for managing CLIKA content, campaigns, and analytics.

## Features

- 📊 Real-time analytics and metrics
- 📝 Content management for all game types
- 🎯 Ad campaign management
- 👥 User management and roles
- ⚙️ System settings and configuration

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Headless UI, Heroicons
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Charts**: Chart.js, react-chartjs-2

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Copy `.env.example` to `.env` and update with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── pages/          # Page components
├── services/       # API services (Supabase)
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Features Overview

### Authentication
- Email/password login
- Role-based access control (Admin, Editor, Reviewer)
- Protected routes

### Content Management
- Create/edit/delete game content
- Filter by game type
- Bulk operations
- Status workflow (draft → live)

### Campaign Management
- Create ad campaigns
- Manage creatives
- Set targeting and scheduling
- Track performance

### Analytics
- Session metrics
- Game distribution
- User engagement
- Real-time updates

## Development

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint
```

### Code Style

- ESLint + Prettier configured
- TypeScript strict mode
- Tailwind CSS for styling

## Deployment

The dashboard can be deployed to any static hosting service:

- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## Security

- Row Level Security (RLS) enabled on all tables
- Admin role required for write operations
- Secure authentication with Supabase Auth

## License

Private - All rights reserved