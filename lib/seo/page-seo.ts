import { Metadata } from 'next';
import { generatePageMetadata } from './config';
import { PageSEOProps } from '@/types/seo';

/**
 * Helper function to generate metadata for different page types
 */

// For a standard page
export function createPageSEO(props: PageSEOProps): Metadata {
  return generatePageMetadata(props);
}

// For a blog post
export function createBlogSEO({
  title,
  description,
  author,
  publishDate,
  image,
  slug,
}: {
  title: string;
  description: string;
  author?: string;
  publishDate: string;
  image?: string;
  slug: string;
}): Metadata {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nextbase.com'}/blog/${slug}`;

  const metadata = generatePageMetadata({
    title,
    description,
    image,
    url,
  });

  // For article type, we need to structure it differently
  return {
    ...metadata,
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'NextBase',
      images: image ? [image] : undefined,
      publishedTime: publishDate,
      authors: author ? [author] : undefined,
    },
  };
}

// For a product page
export function createProductSEO({
  name,
  description,
  price,
  image,
  availability,
  slug,
}: {
  name: string;
  description: string;
  price: number;
  image?: string;
  availability?: 'InStock' | 'OutOfStock';
  slug: string;
}): Metadata {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nextbase.com'}/products/${slug}`;

  return {
    ...generatePageMetadata({
      title: name,
      description,
      image,
      url,
    }),
    openGraph: {
      type: 'website',
      title: name,
      description,
      url,
      images: image ? [image] : undefined,
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'USD',
      'product:availability': availability || 'InStock',
    },
  };
}

// For an author/profile page
export function createProfileSEO({
  name,
  bio,
  image,
  username,
}: {
  name: string;
  bio: string;
  image?: string;
  username: string;
}): Metadata {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nextbase.com'}/profile/${username}`;

  const metadata = generatePageMetadata({
    title: name,
    description: bio,
    image,
    url,
  });

  // For profile type, include username in the metadata
  return {
    ...metadata,
    openGraph: {
      type: 'profile',
      title: name,
      description: bio,
      url,
      siteName: 'NextBase',
      images: image ? [image] : undefined,
      username,
    },
  };
}