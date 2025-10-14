# NextBase

## 📖 100% Open Source NextJS + Supabase Boiler Plate

**NextBase** is a modern, production-ready Next.js SaaS boilerplate designed to help you launch your web application in hours, not weeks. It combines the latest web technologies with best practices for authentication, content management, and scalability.

![Next Base Screenshot](https://nextbasebp.vercel.app/screenshot1.png)


**Live Demo:** [nextbasebp.vercel.app](https://nextbasebp.vercel.app)

**Admin Credentials**
**User:** `demo@nextbasebp.vercel.app`
**Pass:** `Password123`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/codyswain/nextbase&env=NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Required%20environment%20variables%20for%20NextBase&envLink=https://github.com/codyswain/nextbase%23environment-variables&project-name=nextbase&repository-name=nextbase)

Built on **Next.js 15** with the App Router, NextBase provides everything you need to start building your product:

- **Complete Authentication Flow** - Secure email/password and OAuth (Google) authentication powered by Supabase Auth
- **Role-Based Access Control** - User roles (user, admin, editor) with Row Level Security (RLS) policies
- **Full-Featured Blog/CMS** - Content management system with categories, authors, full-text search, and SEO optimization
- **File Storage** - Secure image uploads with Supabase Storage (avatars, blog images)
- **Beautiful UI** - Modern design with Tailwind CSS 4, Radix UI components, and dark mode support
- **SEO Optimized** - Meta tags, OpenGraph, Twitter Cards, dynamic sitemaps, and robots.txt
- **Type-Safe** - End-to-end TypeScript with Supabase generated types
- **Zero Configuration** - All settings via environment variables, no hardcoded values

Whether you're building a SaaS product, a blog, a marketing site, or a full-stack application, NextBase gives you a solid foundation to build on.



## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router, Server Components, and Server Actions
- **[React 19](https://react.dev/)** - Latest React with concurrent features and improved performance
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety across the entire stack

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL database
- **[Supabase Auth](https://supabase.com/auth)** - Authentication with email, OAuth providers, and magic links
- **[Supabase Storage](https://supabase.com/storage)** - File storage with CDN delivery
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database with full-text search

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, customizable components built on Radix UI
- **[Lucide Icons](https://lucide.dev/)** - Modern, consistent icon set
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Perfect dark mode support

### Content & SEO
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering with syntax highlighting
- **[rehype](https://github.com/rehypejs/rehype)** & **[remark](https://github.com/remarkjs/remark)** - Content processing pipelines
- **Next.js Metadata API** - Dynamic SEO optimization
- **Dynamic Sitemaps** - Auto-generated XML sitemaps for search engines

### Development Tools
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Prettier](https://prettier.io/)** - Code formatting (via ESLint config)
- **[Turbopack](https://turbo.build/pack)** - Next-generation bundler (dev mode)

### Deployment & Hosting
- **[Vercel](https://vercel.com/)** - Optimized for Next.js deployment (recommended)
- **Edge-Ready** - Works on any platform supporting Next.js



## 📋 What's Included

NextBase comes with a complete, production-ready setup:

- ✅ **Authentication System** - Email/password + OAuth (Google)
- ✅ **User Management** - Profiles with role-based access (user, admin, editor)
- ✅ **Blog System** - Full-featured blog with categories, authors, search
- ✅ **Storage** - Avatar uploads and blog image management
- ✅ **SEO Ready** - Optimized metadata, sitemaps, and social sharing
- ✅ **Dark Mode** - Beautiful theme system with Tailwind CSS 4
- ✅ **Zero Hardcoded Values** - Everything configurable via environment variables



## 🚀 Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)
- [Supabase](https://supabase.com/) account (free tier works great)
- [Git](https://git-scm.com/) installed

### Overview

1. Fork/clone this repository
2. Create a Supabase project
3. Run database migrations
4. Configure environment variables
5. Start developing!

Time estimate: **10-15 minutes**



## 1️⃣ Supabase Project Setup

### Create New Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: Your project name (e.g., "MyApp")
   - **Database Password**: Strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values (you'll need them soon):
   - **Project URL** - `https://xxxxx.supabase.co`
   - **anon/public key** - Long JWT token starting with `eyJ...`

> 💡 **Tip**: Keep this tab open - you'll reference it during setup



## 2️⃣ Database Setup

**New in this setup**: We've consolidated all migrations into a **single, comprehensive migration file** that creates your entire database schema in one go. No more running 9 separate migrations!

### Method A: SQL Editor (Recommended for Fresh Setup)

**For new Supabase projects**, this is the easiest method:

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the sidebar
3. Click **"New query"**
4. Copy the **entire contents** of `supabase/migrations/00000000000000_complete_schema.sql`
5. Paste into the SQL editor
6. Click **"Run"** or press `Cmd/Ctrl + Enter`
7. Wait for success confirmation (should take 5-10 seconds)

✅ Done! Your entire database schema is set up.

### Method B: Supabase CLI

**Install Supabase CLI**:

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (with Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (all platforms)
npm install -g supabase
```

**Run Migration**:

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project (you'll be prompted to select it)
supabase link

# 3. Push the migration to your database
supabase db push
```

✅ Done! Your database is fully set up.

### What Gets Created

The migration sets up:
- ✅ **Profiles table** with user roles (user/admin/editor)
- ✅ **Email verification audit** for security monitoring
- ✅ **Blog system** (authors, categories, posts, relationships)
- ✅ **Storage buckets** (avatars, blog-images) with policies
- ✅ **Helper functions** for automation (new user handling, view counts, etc.)
- ✅ **Triggers** for automatic profile creation and timestamps
- ✅ **RLS policies** for secure, role-based access control
- ✅ **Indexes** for optimal query performance
- ✅ **Sample categories** to get started quickly

### Migrating from Old Setup

If you've been using the old multi-file migration system:

**Option 1: Fresh Start (Recommended)**
1. Create a new Supabase project
2. Run the consolidated migration above
3. Export/import your data if needed

**Option 2: Keep Existing Setup**
1. Keep using your existing migrations
2. The old migrations still work fine
3. The consolidated file is for new projects only

> 💡 **Note**: The consolidated migration (`00000000000000_complete_schema.sql`) is designed for **fresh Supabase projects**. If you've already run the individual migrations, you don't need to run this one.



## 3️⃣ Authentication Configuration

### Email Templates

Supabase sends emails for signup confirmations and password resets. Customize them:

1. Go to **Authentication** > **Email Templates**
2. Customize these templates (optional but recommended):
   - **Confirm signup** - Welcome message
   - **Reset password** - Password reset instructions
   - **Magic Link** - Passwordless login (if you want to enable it)

### URL Configuration

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

> 📝 **Note**: When deploying to production, add your production URLs here too!



## 4️⃣ OAuth Setup (Optional)

Want to enable "Sign in with Google"? Here's how:

### Enable Google OAuth

1. Go to **Authentication** > **Providers**
2. Find **Google** and click **Enable**
3. You'll need to create a Google OAuth app:

**Get Google Credentials**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Replace `xxxxx` with your project reference from Supabase URL)
7. Copy **Client ID** and **Client Secret**

**Configure in Supabase**:

1. Paste **Client ID** and **Client Secret** into Supabase
2. Click **Save**

✅ Google OAuth is now enabled!



## 5️⃣ Environment Variables

### Create `.env.local`

In your project root, create `.env.local`:

```bash
cp .env.local.example .env.local
```

### Configure Your Environment

Open `.env.local` and fill in your values:

```bash
# ============================================
# SITE CONFIGURATION
# ============================================
# Your site's public URL (use http://localhost:3000 for development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Customize your site's branding
NEXT_PUBLIC_SITE_NAME=NextBase
NEXT_PUBLIC_SITE_DESCRIPTION=A modern Next.js starter template with best practices
NEXT_PUBLIC_CREATOR_NAME=Your Name

# ============================================
# SOCIAL MEDIA LINKS (Optional)
# ============================================
NEXT_PUBLIC_TWITTER_HANDLE=@yourhandle
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourprofile

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Your Supabase anonymous/public key (safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🎉 What Happens Automatically

NextBase automatically configures:

✅ **Supabase Image Domains** - Extracted from your `NEXT_PUBLIC_SUPABASE_URL`
✅ **SEO Metadata** - Uses your site name, description, and creator
✅ **Social Media Links** - Integrated throughout the UI
✅ **Branding** - Applied across all pages and components

**No hardcoded values!** Just set your `.env.local` and everything works.



## 6️⃣ Install & Run

### Install Dependencies

```bash
pnpm install
```

> Don't have pnpm? Install it: `npm install -g pnpm`

### Start Development Server

```bash
pnpm dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000) 🎉



## 7️⃣ Post-Setup Tasks

### Make Yourself an Admin

By default, the **first user to sign up** gets the admin role automatically. But if you need to manually set admin access:

1. Sign up for an account on your app
2. Go to Supabase Dashboard > **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
```

### Test the Setup

**Authentication Flow**:
- ✅ Sign up with email/password
- ✅ Check email for confirmation link
- ✅ Confirm email and auto-login
- ✅ Sign out and sign in again
- ✅ Try "Forgot Password" flow
- ✅ Try Google OAuth (if enabled)

**Admin Panel**:
1. Go to `/admin` (you should see the admin panel)
2. Try creating a blog post
3. Upload a featured image
4. Publish the post
5. View it at `/blog/your-post-slug`

**Blog System**:
- ✅ View blog at `/blog`
- ✅ Browse categories at `/blog/technology`, `/blog/tutorial`, etc.
- ✅ Search for posts
- ✅ Filter by category

### Create Your First Blog Post

1. Go to `/admin`
2. Click **"New Post"**
3. Fill in the details:
   - Title, content, excerpt
   - Select categories
   - Upload featured image
   - Set as "Published"
4. Click **"Save"**
5. Visit `/blog` to see your post!



## 8️⃣ Troubleshooting

### "Invalid Project URL"

**Problem**: Can't connect to Supabase
**Solution**: Double-check your `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

### "Session Expired" on Every Refresh

**Problem**: Authentication not persisting
**Solution**:
1. Check that your Supabase URL and anon key are correct
2. Clear browser cookies and try again
3. Verify redirect URLs in Supabase Authentication settings

### Images Not Loading

**Problem**: Blog images or avatars return 404
**Solution**:
1. Check that storage buckets were created (run migrations again)
2. Verify bucket policies in Supabase Dashboard > **Storage**
3. Confirm `NEXT_PUBLIC_SUPABASE_URL` is set correctly

### "Unauthorized" When Accessing `/admin`

**Problem**: Can't access admin panel
**Solution**:
1. Verify your user has `admin` or `editor` role in the `profiles` table
2. Run the admin SQL query from "Post-Setup Tasks" section
3. Sign out and sign back in

### Email Confirmations Not Sending

**Problem**: Not receiving signup/reset emails
**Solution**:
1. Check Supabase Dashboard > **Authentication** > **Email Templates**
2. Verify SMTP settings (default uses Supabase's built-in email)
3. For production, configure custom SMTP in Supabase settings

### TypeScript Errors

**Problem**: Type errors in your IDE
**Solution**:
```bash
# Regenerate Supabase types
pnpm supabase gen types typescript --local > lib/supabase/database.types.ts

# Or if linked to cloud project
pnpm supabase gen types typescript --linked > lib/supabase/database.types.ts
```

### Build Failures

**Problem**: `pnpm build` fails
**Solution**:
1. Ensure all environment variables are set
2. Run `pnpm lint` to check for errors
3. Check that migrations ran successfully
4. Clear `.next` folder: `rm -rf .next` and rebuild



## 🚀 Deployment

### Vercel (Recommended)

**Quick Deploy:**

Click the button below to deploy your own copy of NextBase to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/codyswain/nextbase&env=NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Required%20environment%20variables%20for%20NextBase&envLink=https://github.com/codyswain/nextbase%23environment-variables&project-name=nextbase&repository-name=nextbase)

This will:
- Clone the repository to your GitHub account
- Set up a new Vercel project
- Prompt you to configure required environment variables
- Deploy your application automatically

**Manual Deployment:**

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy!

**Update Supabase URLs**:
1. After deployment, go to Supabase Dashboard
2. Update **Site URL** to your production domain
3. Add production domain to **Redirect URLs**

### Other Platforms

NextBase works on any platform that supports Next.js:
- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [Fly.io](https://fly.io/)
- Self-hosted with Docker



## 📚 Next Steps

Now that you're set up, explore these features:

- **Customize UI**: Edit components in `components/`
- **Add Pages**: Create new routes in `app/`
- **Extend Database**: Add new migrations in `supabase/migrations/`
- **Configure SEO**: Update metadata in `lib/seo/constants.ts`
- **Add Features**: Build on top of the authentication and blog system



## 🆘 Need Help?

- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 📖 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com/)
- 🐛 [Report Issues](https://github.com/yourusername/nextbase/issues)



**Happy Building! 🎉**
