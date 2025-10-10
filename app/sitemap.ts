import { MetadataRoute } from 'next';
import { generateURL } from '@/lib/seo/config';
import { SITEMAP_PRIORITY, SITEMAP_CHANGE_FREQUENCY } from '@/lib/seo/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Define your actual app routes
  const staticRoutes = [
    {
      url: generateURL('/'),
      lastModified: currentDate,
      changeFrequency: SITEMAP_CHANGE_FREQUENCY.home,
      priority: SITEMAP_PRIORITY.home,
    },
    {
      url: generateURL('/login'),
      lastModified: currentDate,
      changeFrequency: 'yearly' as const, // Auth pages rarely change
      priority: 0.5, // Lower priority for auth pages
    },
    {
      url: generateURL('/signup'),
      lastModified: currentDate,
      changeFrequency: 'yearly' as const, // Auth pages rarely change
      priority: 0.5, // Lower priority for auth pages
    },
  ];

  // If you have dynamic routes (e.g., blog posts, user profiles), you can fetch them here
  // const dynamicRoutes = await fetchDynamicRoutes();

  // For now, we'll just return static routes
  // In production, you would combine static and dynamic routes
  return staticRoutes;
}

// Optional: If you need to split your sitemap into multiple files (for large sites)
// export async function generateSitemaps() {
//   // Fetch the total number of items and calculate the number of sitemaps needed
//   // Google's limit is 50,000 URLs per sitemap
//   return [{ id: 0 }, { id: 1 }, { id: 2 }];
// }

// Then modify the default export to handle multiple sitemaps:
// export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
//   const start = id * 50000;
//   const end = start + 50000;
//   // Fetch and return the URLs for this sitemap segment
// }