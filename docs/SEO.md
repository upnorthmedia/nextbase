# SEO Configuration Guide for NextBase

This document explains the SEO implementation in NextBase and how to use it effectively.

## Overview

NextBase includes a comprehensive SEO setup that provides:
- 🎯 Dynamic metadata generation
- 🗺️ Automatic sitemap creation
- 🤖 Dynamic robots.txt configuration
- 📱 Open Graph and Twitter Card support
- 🏗️ Structured data (Schema.org) support
- 📄 TypeScript support for type safety
- ⚡ Performance optimized

## Quick Start

### 1. Environment Setup

Copy the example environment file and update with your domain:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Basic Configuration

All SEO configuration is centralized in `/lib/seo/constants.ts`:

```typescript
export const siteConfig: SiteConfig = {
  name: 'Your Site Name',
  description: 'Your site description',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  ogImage: '/og-image.png',
  links: {
    twitter: '@yourhandle',
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/company/yourcompany',
  },
  creator: 'Your Name',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
};
```

## Page Metadata

### Homepage

The homepage metadata is configured in `/app/page.tsx`:

```typescript
export const metadata: Metadata = {
  title: siteConfig.name, // Just the site name, no template
  description: siteConfig.description,
  // ... other metadata
};
```

### Other Pages

For other pages, use the helper functions to generate metadata with the template pattern:

```typescript
import { createPageSEO } from '@/lib/seo/page-seo';

export const metadata = createPageSEO({
  title: 'About Us', // Will become "About Us | NextBase"
  description: 'Learn more about our company',
  image: '/about-og-image.png', // Optional custom OG image
  url: '/about',
});
```

### Dynamic Pages

For dynamic pages (like blog posts), use `generateMetadata`:

```typescript
import { createBlogSEO } from '@/lib/seo/page-seo';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return createBlogSEO({
    title: post.title,
    description: post.excerpt,
    author: post.author,
    publishDate: post.date,
    image: post.image,
    slug: params.slug,
  });
}
```

## Title Templates

The title template system works as follows:
- **Homepage**: Gets just the site name (e.g., "NextBase")
- **Other pages**: Get the pattern `%title% | NextBase`

This is configured in the root layout's metadata with the `template` property.

## Sitemap

The sitemap is automatically generated at `/sitemap.xml` through `/app/sitemap.ts`.

### Adding Pages to Sitemap

Edit `/app/sitemap.ts` to add new pages:

```typescript
const staticRoutes = [
  {
    url: generateURL('/new-page'),
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  // ... other routes
];
```

### Dynamic Pages in Sitemap

For dynamic content like blog posts:

```typescript
const posts = await getAllPosts();
const dynamicRoutes = posts.map(post => ({
  url: generateURL(`/blog/${post.slug}`),
  lastModified: post.updatedAt,
  changeFrequency: 'weekly',
  priority: 0.6,
}));

return [...staticRoutes, ...dynamicRoutes];
```

## Robots.txt

The robots.txt is dynamically generated at `/robots.txt` through `/app/robots.ts`.

Current configuration:
- Allows all crawlers to access the site
- Disallows access to `/api/`, `/admin/`, `/private/` paths
- Includes sitemap reference

## Structured Data (Schema.org)

NextBase includes helper functions for generating structured data:

### Organization Schema

Used on the homepage:

```typescript
const organizationSchema = generateOrganizationSchema();
```

### Article Schema

For blog posts:

```typescript
const articleSchema = generateArticleSchema({
  title: 'Article Title',
  description: 'Article description',
  author: 'Author Name',
  datePublished: '2024-01-01',
  dateModified: '2024-01-02',
  image: '/article-image.png',
  url: '/blog/article-slug',
});
```

### Product Schema

For e-commerce:

```typescript
const productSchema = generateProductSchema({
  name: 'Product Name',
  description: 'Product description',
  image: '/product-image.png',
  price: 99.99,
  currency: 'USD',
  availability: 'InStock',
  brand: 'Brand Name',
  rating: 4.5,
  reviewCount: 100,
});
```

### FAQ Schema

For FAQ pages:

```typescript
const faqSchema = generateFAQSchema([
  {
    question: 'What is NextBase?',
    answer: 'NextBase is a modern Next.js starter template.',
  },
  // ... more FAQs
]);
```

## Open Graph Images

### Default OG Image

Place your default Open Graph image at `/public/og-image.png` (1200x630px recommended).

### Dynamic OG Images

Next.js 15 supports dynamic OG image generation. Create `/app/og/route.tsx`:

```typescript
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Default Title';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'black',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

## Favicon and Icons

Place the following files in `/public`:
- `favicon.ico` - Standard favicon
- `favicon-16x16.png` - 16x16 favicon
- `favicon-32x32.png` - 32x32 favicon
- `apple-touch-icon.png` - 180x180 Apple touch icon
- `icon-192x192.png` - 192x192 PWA icon
- `icon-512x512.png` - 512x512 PWA icon

### Generating Icons

Use the provided script to generate placeholder icons:

```bash
node scripts/generate-favicons.js
```

For production, convert SVG to PNG using tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)
- ImageMagick: `convert favicon.svg favicon.ico`

## PWA Support

The site includes a web app manifest at `/public/manifest.json` for PWA support.

## Testing SEO

### Local Testing

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Check metadata in browser DevTools (Elements tab, inspect `<head>`)

3. Test Open Graph tags:
   - Use [OpenGraph.xyz](https://www.opengraph.xyz/)
   - Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

4. Test Twitter Cards:
   - Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

5. Test structured data:
   - Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
   - Use [Schema.org Validator](https://validator.schema.org/)

### Sitemap Testing

Visit these URLs locally:
- http://localhost:3000/sitemap.xml
- http://localhost:3000/robots.txt

### Build Testing

```bash
npm run build
npm run start
```

Then test the production build at http://localhost:3000

## Best Practices

1. **Always provide unique titles and descriptions** for each page
2. **Keep titles under 60 characters** for optimal display
3. **Keep descriptions between 150-160 characters**
4. **Use high-quality images** for Open Graph (1200x630px)
5. **Update the sitemap** when adding new pages
6. **Test with real social media platforms** before launching
7. **Monitor with Google Search Console** after deployment
8. **Use structured data** appropriate for your content type

## Common Use Cases

### Adding a New Static Page

1. Create the page component
2. Add metadata using `createPageSEO`
3. Add to sitemap in `/app/sitemap.ts`

### Adding a Blog Section

1. Use `createBlogSEO` for blog post metadata
2. Add article structured data
3. Include blog posts in sitemap dynamically
4. Consider adding author pages with profile metadata

### E-commerce Integration

1. Use `createProductSEO` for product pages
2. Add product structured data
3. Include breadcrumb structured data for navigation
4. Add review/rating structured data if applicable

## Troubleshooting

### Metadata Not Showing

- Ensure you're exporting `metadata` or `generateMetadata` from your page
- Check that the metadata is not being overridden by child components
- Verify environment variables are loaded correctly

### OG Images Not Working

- Ensure images are in the correct format (PNG/JPG recommended)
- Check image dimensions (1200x630px recommended)
- Verify the full URL is correct in production
- Test with social media debuggers

### Sitemap Not Generating

- Check that `/app/sitemap.ts` exists and exports a default function
- Verify the function returns the correct format
- Check for build errors in the console

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)