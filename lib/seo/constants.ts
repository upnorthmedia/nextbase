import { SiteConfig } from '@/types/seo';

export const siteConfig: SiteConfig = {
  name: 'NextBase',
  description: 'A modern Next.js starter template with best practices, SEO optimization, and beautiful UI components.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nextbase.com',
  ogImage: '/og-image.svg', // TODO: Convert to PNG for better social media support
  links: {
    twitter: '@nextbase',
    github: 'https://github.com/nextbase',
    linkedin: 'https://linkedin.com/company/nextbase',
  },
  creator: 'NextBase Team',
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Starter Template',
    'SEO',
    'Web Development',
    'Full Stack',
    'Modern Web',
    'Performance'
  ],
};

export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Social Media Handles
export const TWITTER_HANDLE = '@nextbase';
export const TWITTER_SITE = '@nextbase';

// SEO Defaults
export const DEFAULT_ROBOTS = 'index, follow';
export const DEFAULT_LOCALE = 'en_US';

// Sitemap Configuration
export const SITEMAP_HOST = process.env.NEXT_PUBLIC_SITE_URL || 'https://nextbase.com';
export const SITEMAP_PRIORITY = {
  home: 1.0,
  page: 0.8,
  blog: 0.6,
  legal: 0.3,
};

export const SITEMAP_CHANGE_FREQUENCY = {
  home: 'weekly' as const,
  page: 'monthly' as const,
  blog: 'weekly' as const,
  legal: 'yearly' as const,
};