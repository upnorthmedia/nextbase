export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  creator: string;
  keywords: string[];
}

export interface PageSEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export interface OpenGraphConfig {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }[];
  locale?: string;
  type?: 'website' | 'article' | 'book' | 'profile' | 'video' | 'music';
}

export interface TwitterConfig {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  images?: string[];
}

// Using unknown instead of any for better type safety
// Schema.org structured data can have various nested properties
export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}