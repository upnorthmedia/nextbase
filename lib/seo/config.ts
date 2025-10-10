import { Metadata } from 'next';
import {
  siteConfig,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  TWITTER_HANDLE,
  TWITTER_SITE,
  DEFAULT_LOCALE
} from './constants';
import { PageSEOProps } from '@/types/seo';

/**
 * Generate page title with template
 * Homepage gets just the site name, other pages get "Page Title | NextBase"
 */
export function generateTitle(title?: string, isHomepage = false): string {
  if (isHomepage || !title) {
    return siteConfig.name;
  }
  return `${title} | ${siteConfig.name}`;
}

/**
 * Generate the full URL for a page
 */
export function generateURL(path: string = ''): string {
  const baseURL = siteConfig.url.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return path ? `${baseURL}${cleanPath}` : baseURL;
}

/**
 * Generate canonical URL
 */
export function generateCanonical(path: string = ''): string {
  return generateURL(path);
}

/**
 * Generate default metadata for the site
 */
export function generateDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: siteConfig.name,
        },
      ],
      locale: DEFAULT_LOCALE,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      site: TWITTER_SITE,
      creator: TWITTER_HANDLE,
      images: [generateURL(siteConfig.ogImage)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
      other: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
    },
    manifest: '/manifest.json',
  };
}

/**
 * Generate page-specific metadata
 */
export function generatePageMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
  keywords,
}: PageSEOProps): Metadata {
  const pageTitle = title ? generateTitle(title) : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const pageImage = image || siteConfig.ogImage;
  const pageURL = url || siteConfig.url;
  const pageKeywords = keywords || siteConfig.keywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageURL,
      siteName: siteConfig.name,
      images: [
        {
          url: generateURL(pageImage),
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: pageTitle,
        },
      ],
      locale: DEFAULT_LOCALE,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: TWITTER_SITE,
      creator: TWITTER_HANDLE,
      images: [generateURL(pageImage)],
    },
    alternates: {
      canonical: pageURL,
    },
  };
}