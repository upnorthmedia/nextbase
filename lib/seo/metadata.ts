import { StructuredData } from '@/types/seo';
import { siteConfig } from './constants';
import { generateURL } from './config';

/**
 * Generate Organization structured data for Schema.org
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: generateURL('/logo.png'),
    sameAs: [
      siteConfig.links.twitter ? `https://twitter.com/${siteConfig.links.twitter.replace('@', '')}` : '',
      siteConfig.links.github || '',
      siteConfig.links.linkedin || '',
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

/**
 * Generate Article structured data
 */
export function generateArticleSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: {
  title: string;
  description: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author || siteConfig.creator,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image: image ? generateURL(image) : generateURL(siteConfig.ogImage),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: generateURL('/logo.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generate Product structured data
 */
export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = 'USD',
  availability = 'InStock',
  brand,
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  rating?: number;
  reviewCount?: number;
}): StructuredData {
  const schema: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: generateURL(image),
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
  };

  if (brand) {
    schema.brand = {
      '@type': 'Brand',
      name: brand,
    };
  }

  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
    };
  }

  return schema;
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Local Business structured data
 */
export function generateLocalBusinessSchema({
  name,
  description,
  address,
  telephone,
  openingHours,
  priceRange,
}: {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  openingHours?: string[];
  priceRange?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    ...(telephone && { telephone }),
    ...(openingHours && { openingHours }),
    ...(priceRange && { priceRange }),
    url: siteConfig.url,
    image: generateURL(siteConfig.ogImage),
  };
}