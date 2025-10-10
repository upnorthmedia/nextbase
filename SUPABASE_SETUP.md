# Supabase Integration Guide for Nextbase

This guide explains how to set up and use Supabase with your Nextbase boilerplate application.

## Table of Contents
- [Overview](#overview)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Storage](#storage)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Switching Supabase Instances](#switching-supabase-instances)
- [Troubleshooting](#troubleshooting)

## Overview

Nextbase comes pre-integrated with Supabase for:
- **Authentication**: Email/password, OAuth (Google, GitHub), magic links
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: File uploads with access control
- **Real-time**: Subscriptions (ready to implement)

The integration is **environment-agnostic**, meaning you can switch between different Supabase instances (development, staging, production) by simply changing environment variables.

## Initial Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Click "New Project" and fill in:
   - Project name
   - Database password (save this!)
   - Region (choose closest to your users)
3. Wait for the project to be created (~2 minutes)

### 2. Get Your API Keys

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://YOUR_PROJECT.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key** (optional): Keep this secret!

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For admin operations (keep secret!)
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Direct database connection (for migrations)
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

## Database Setup

### Apply the Initial Migration

The project includes a migration to set up user profiles and storage. Apply it to your Supabase database:

1. **Option A: Using Supabase Dashboard**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/20240101000000_create_profiles.sql`
   - Paste and run the SQL

2. **Option B: Using Supabase CLI** (recommended for production)
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref YOUR_PROJECT_REF

   # Push migrations
   supabase db push
   ```

### Database Schema

The migration creates:
- **profiles table**: Stores user profile information
  - `id`: References auth.users
  - `username`: Unique username
  - `full_name`: Display name
  - `avatar_url`: Profile picture URL
  - `website`: Personal website
  - `created_at`, `updated_at`: Timestamps

- **Storage bucket**: `avatars` for profile pictures

- **RLS Policies**:
  - Public profiles are viewable by everyone
  - Users can only edit their own profile
  - Authenticated users can upload avatars

## Authentication

### Available Authentication Methods

1. **Email/Password**: Traditional signup with email confirmation
2. **OAuth Providers**: Google and GitHub (pre-configured)
3. **Magic Links**: Passwordless login (ready to implement)

### Setting Up OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized redirect URIs:
     - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/confirm` (for local development)
5. Copy Client ID and Client Secret
6. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Add Client ID and Client Secret

#### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App:
   - Homepage URL: `https://your-app.com`
   - Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret
4. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Add Client ID and Client Secret

### Authentication Flow

The app uses Next.js App Router with:
- **Server Actions** for authentication (`app/auth/actions.ts`)
- **Middleware** for session management (`middleware.ts`)
- **Server Components** for protected pages

Protected routes automatically redirect to login if no user is authenticated.

## Storage

### File Upload Implementation

Basic storage setup is included. To implement file uploads:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/${file.name}`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/${file.name}`)
```

## Development Workflow

### Local Development

1. Start the development server:
```bash
pnpm dev
```

2. Access the app at `http://localhost:3000`

### Testing Authentication

1. Sign up with email/password at `/signup`
2. Check your email for confirmation link (if email confirmation is enabled)
3. Sign in at `/login`
4. Access protected dashboard at `/dashboard`

### Type Safety

Generate TypeScript types from your database schema:

```bash
# Using Supabase CLI
npx supabase gen types typescript --linked > types/database.types.ts

# Or with project ID
npx supabase gen types typescript --project-id "YOUR_PROJECT_REF" > types/database.types.ts
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SITE_URL`: Your production URL
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key

### Other Platforms

The app works with any platform that supports Next.js:
- Netlify
- Railway
- Fly.io
- Self-hosted

Just ensure environment variables are properly configured.

## Switching Supabase Instances

One of the key features of this integration is the ability to easily switch between different Supabase instances.

### Use Cases

- **Development**: Local Supabase instance
- **Staging**: Separate staging database
- **Production**: Production database
- **Client Projects**: Different Supabase project per client

### How to Switch

Simply update the environment variables:

```env
# Development
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key

# Staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key

# Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

No code changes required!

### Managing Multiple Environments

Use `.env` files for different environments:
- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Load them with tools like `dotenv-cli`:
```bash
# Install dotenv-cli
pnpm add -D dotenv-cli

# Run with specific environment
dotenv -e .env.staging -- pnpm build
```

## Troubleshooting

### Common Issues

#### "Invalid API key"
- Check that your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Ensure there are no extra spaces or quotes

#### "User already exists" error
- User might already be registered
- Check if email confirmation is required

#### Session not persisting
- Ensure middleware is running (check `middleware.ts`)
- Clear browser cookies and try again

#### OAuth redirect not working
- Update redirect URLs in OAuth provider settings
- For production, use your actual domain

#### Database connection issues
- Check if RLS policies are correctly set up
- Verify the user has proper permissions

### Debug Mode

Enable debug logging in development:

```typescript
// lib/supabase/client.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        debug: process.env.NODE_ENV === 'development',
      },
    }
  )
}
```

## Next Steps

### Implement Real-time Features

```typescript
// Subscribe to changes
const channel = supabase
  .channel('profiles')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Add Email Templates

Customize email templates in Supabase Dashboard → Authentication → Email Templates

### Implement Role-Based Access Control (RBAC)

Create roles and permissions in your database and use RLS policies to enforce them.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

For issues with:
- **Nextbase**: Open an issue on GitHub
- **Supabase**: Check [Supabase Discord](https://discord.supabase.com/) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)