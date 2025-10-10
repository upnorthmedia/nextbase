# NextBase Blog System Implementation Prompt

## Project Overview
Build a production-ready, SEO-optimized markdown blog system for NextBase (NextJS + Supabase starter app) with beautiful rendering, admin management, and full-featured blog functionality.

## Core Requirements

### 1. Database Schema (Supabase)
Create the following tables in Supabase:

```sql
-- Authors table
CREATE TABLE authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog post categories junction table
CREATE TABLE blog_post_categories (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read authors" ON authors
  FOR SELECT USING (true);

CREATE POLICY "Public can read post categories" ON blog_post_categories
  FOR SELECT USING (true);
```

### 2. File Structure
```
app/
├── blog/
│   ├── page.tsx                 # Main blog listing with pagination
│   ├── [slug]/
│   │   └── page.tsx             # Individual blog post
│   ├── category/
│   │   └── [category]/
│   │       └── page.tsx         # Category listing
│   └── layout.tsx               # Blog layout wrapper
├── admin/
│   └── blog/
│       ├── page.tsx             # Blog management dashboard
│       ├── new/
│       │   └── page.tsx         # Create new post
│       └── edit/
│           └── [id]/
│               └── page.tsx     # Edit existing post
├── api/
│   ├── blog/
│   │   ├── posts/
│   │   │   └── route.ts        # CRUD operations for posts
│   │   └── revalidate/
│   │       └── route.ts        # Revalidation endpoint
│   └── sitemap/
│       └── route.ts            # Dynamic sitemap generation
components/
├── blog/
│   ├── BlogCard.tsx            # Post preview card
│   ├── BlogPagination.tsx      # Pagination component
│   ├── CategoryFilter.tsx      # Category filtering
│   ├── AuthorCard.tsx          # Author bio section
│   ├── ShareButtons.tsx        # Social sharing
│   ├── TableOfContents.tsx     # Dynamic TOC for posts
│   └── ReadingProgress.tsx     # Reading progress bar
├── markdown/
│   ├── MarkdownRenderer.tsx    # Custom markdown renderer
│   ├── CodeBlock.tsx           # Syntax highlighted code
│   └── YouTubeEmbed.tsx        # YouTube embed component
└── admin/
    ├── BlogEditor.tsx          # Markdown editor with preview
    └── ImageUploader.tsx       # Supabase storage uploader
lib/
├── blog/
│   ├── api.ts                  # Blog API functions
│   ├── utils.ts                # Helper functions
│   └── types.ts                # TypeScript interfaces
├── markdown/
│   ├── processor.ts            # Markdown processing
│   └── plugins.ts              # Custom remark/rehype plugins
└── supabase/
    ├── client.ts               # Supabase client
    └── storage.ts              # Storage helpers
```

### 3. Package Dependencies
Install required packages:

```bash
npm install @mdx-js/react remark remark-html remark-gfm rehype-highlight rehype-slug rehype-autolink-headings reading-time gray-matter sharp plaiceholder @vercel/og react-markdown react-intersection-observer date-fns zod @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-youtube
```

### 4. Core Implementation Details

#### A. Markdown Processing (`lib/markdown/processor.ts`)
```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import readingTime from 'reading-time';
import matter from 'gray-matter';

// Process markdown with frontmatter, syntax highlighting, and TOC generation
// Extract headings for table of contents
// Calculate reading time
// Support GitHub Flavored Markdown
// Auto-generate slugs for headings
// Transform image URLs to use Supabase storage
```

#### B. SEO Implementation
1. **Dynamic Metadata Generation**:
   - Use `generateMetadata` in each page
   - Include Open Graph tags
   - Twitter Card support
   - JSON-LD structured data for blog posts
   - Canonical URLs

2. **Structured Data Schema**:
```typescript
// BlogPosting schema
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": excerpt,
  "image": featuredImage,
  "datePublished": publishedAt,
  "dateModified": updatedAt,
  "author": {
    "@type": "Person",
    "name": authorName,
    "url": authorUrl
  },
  "publisher": {
    "@type": "Organization",
    "name": "NextBase",
    "logo": {
      "@type": "ImageObject",
      "url": logoUrl
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": postUrl
  }
}
```

#### C. Image Optimization
```typescript
// Use Next.js Image component with blur placeholder
// Generate blur data URL using plaiceholder
// Implement lazy loading for images
// Store images in Supabase Storage with proper bucket policies
// Automatic image optimization through Next.js

const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  return supabase.storage.from('blog-images').getPublicUrl(fileName);
};
```

#### D. Pagination Implementation
```typescript
// Server-side pagination with URL params
// Show 12 posts per page
// Include page numbers in URLs for SEO
// Implement infinite scroll as progressive enhancement

const POSTS_PER_PAGE = 12;

async function getBlogPosts(page: number = 1, category?: string) {
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  
  let query = supabase
    .from('blog_posts')
    .select('*, author:authors(*), categories:blog_post_categories(category:categories(*))', { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, to);

  if (category) {
    // Filter by category using join
  }

  return query;
}
```

#### E. Admin Features
```typescript
// Rich markdown editor using TipTap
// Live preview with split view
// Drag-and-drop image upload
// SEO preview (Google SERP preview)
// Draft autosave every 30 seconds
// Publish scheduling
// Category management
// Bulk operations (publish, archive, delete)

interface BlogEditorProps {
  initialContent?: string;
  onSave: (content: BlogPost) => Promise<void>;
  autosave?: boolean;
}

// Implement role-based access control
// Only authenticated admins can access /admin routes
// Use Supabase RLS policies for data protection
```

#### F. YouTube Embed Component
```typescript
// Parse YouTube URLs and convert to embeds
// Support both youtube.com and youtu.be formats
// Lazy load embeds with thumbnail placeholder
// Responsive iframe with aspect ratio

const YouTubeEmbed = ({ url }: { url: string }) => {
  const videoId = extractYouTubeId(url);
  return (
    <div className="aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
        loading="lazy"
      />
    </div>
  );
};
```

#### G. Sitemap Generation (`app/sitemap.ts`)
```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedPosts();
  const categories = await getAllCategories();
  
  const blogPages = posts.map((post) => ({
    url: `https://nextbase.com/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryPages = categories.map((category) => ({
    url: `https://nextbase.com/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: 'https://nextbase.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogPages,
    ...categoryPages,
  ];
}
```

### 5. Performance Optimizations

1. **Static Generation with ISR**:
```typescript
// Use generateStaticParams for blog posts
export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

// Revalidate every hour
export const revalidate = 3600;
```

2. **View Count Tracking** (without blocking render):
```typescript
// Track views using server action or API route
// Debounce to prevent spam
// Use Supabase Edge Functions for better performance
```

3. **Search Implementation**:
```typescript
// Full-text search using Supabase
// Create GIN index on content and title
// Implement search suggestions
// Add search filters (date, category, author)

ALTER TABLE blog_posts ADD COLUMN fts tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED;
CREATE INDEX blog_posts_fts ON blog_posts USING GIN (fts);
```

### 6. Styling Requirements

Use Tailwind v4 with these design principles:
- Clean, readable typography (use prose classes)
- Dark mode support via next-themes
- Mobile-first responsive design
- Smooth animations with framer-motion
- Consistent spacing and visual hierarchy
- Custom code syntax highlighting theme
- Loading skeletons for better UX

### 7. Testing Checklist

- [ ] SEO meta tags render correctly
- [ ] Sitemap includes all published posts
- [ ] Images load with blur placeholder
- [ ] Pagination works with proper URLs
- [ ] Category filtering functions correctly
- [ ] Admin can create, edit, delete posts
- [ ] Markdown renders with all features
- [ ] YouTube embeds work
- [ ] Schema markup validates
- [ ] Mobile responsive design
- [ ] Dark mode toggles properly
- [ ] Search returns relevant results
- [ ] View counting works
- [ ] Reading time calculates accurately
- [ ] Draft posts don't appear publicly

### 8. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://nextbase.com
```

### 9. Additional Features to Implement

1. **RSS Feed** at `/blog/rss.xml`
2. **Related Posts** algorithm based on categories and tags
3. **Comments System** using Supabase real-time
4. **Newsletter Subscription** integration
5. **Social Share Preview** image generation
6. **Analytics Integration** for popular posts
7. **Content Preview Links** for draft sharing
8. **Revision History** for posts
9. **Keyboard Shortcuts** in editor
10. **Export/Import** functionality for content

### 10. Error Handling

- Graceful fallbacks for missing data
- 404 page for non-existent posts
- Error boundaries for component failures
- Retry logic for failed uploads
- Validation with Zod schemas
- Toast notifications for user feedback

## Implementation Order

1. Set up Supabase schema and RLS policies
2. Create type definitions and API functions
3. Build markdown processor with all plugins
4. Implement blog listing page with pagination
5. Create individual post page with SEO
6. Add category pages and filtering
7. Build admin dashboard and editor
8. Implement image upload to Supabase Storage
9. Add search functionality
10. Generate sitemap and RSS feed
11. Optimize performance with caching
12. Add finishing touches (animations, loading states)

## Success Criteria

- Lighthouse score > 95 for all metrics
- Core Web Vitals pass
- Valid structured data
- Accessible (WCAG 2.1 AA compliant)
- Works without JavaScript (progressive enhancement)
- Fast initial page load (< 2s)
- Smooth navigation between pages
- Professional, polished UI
