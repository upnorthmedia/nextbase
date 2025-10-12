import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getBlogPostBySlug, getRelatedPosts, incrementViewCount } from '@/lib/blog/api';
import { MarkdownRenderer, MarkdownSkeleton } from '@/components/markdown/MarkdownRenderer';
import { TableOfContents } from '@/components/markdown/TableOfContents';
import { ReadingProgress } from '@/components/markdown/ReadingProgress';
import { AuthorCard, AuthorMeta } from '@/components/blog/AuthorCard';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { siteConfig } from '@/lib/seo/constants';
import Image from 'next/image';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const ogImage = post.featured_image || `${siteConfig.url}/og-image.png`;
  const publishedTime = post.published_at || post.created_at;
  const modifiedTime = post.updated_at;

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || post.title,
    keywords: post.meta_keywords,
    authors: post.author ? [{ name: post.author.name }] : [],
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || post.title,
      url: `${siteConfig.url}/blog/${post.slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: post.author ? [post.author.name] : [],
      tags: post.categories?.map((c) => c.category?.name).filter(Boolean) as string[],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || post.title,
      images: [ogImage],
      creator: post.author?.social_links?.twitter,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

// Generate static params for static generation (optional - for build-time generation)
// export async function generateStaticParams() {
//   const { posts } = await getBlogPosts({ limit: 100, status: 'published' });
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementViewCount(post.id).catch(console.error);

  // Fetch related posts
  const relatedPosts = await getRelatedPosts(post.id, 3);

  const publishedDate = post.published_at || post.created_at;
  const fullUrl = `${siteConfig.url}/blog/${post.slug}`;

  // Structured data for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featured_image || `${siteConfig.url}/og-image.png`,
    datePublished: publishedDate,
    dateModified: post.updated_at,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
          url: post.author.social_links?.website,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    keywords: post.meta_keywords?.join(', '),
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.category?.id}
                    href={`/blog/category/${cat.category?.slug}`}
                    className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {cat.category?.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta & Share Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-4">
              {/* Author - Right */}
              {post.author && (
                <AuthorMeta author={post.author} date={publishedDate} />
              )}
              {/* Spacer */}
              <div className="flex-1" />
              {/* Share Buttons - Left */}
              <ShareButtons
                url={fullUrl}
                title={post.title}
                description={post.excerpt}
              />
            </div>
          </header>

          {/* Layout with Sidebar for TOC */}
          <div className="grid lg:grid-cols-[1fr_250px] gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="min-w-0">
              {/* Featured Image */}
              {post.featured_image && (
                <div className="mb-8 -mx-4 md:mx-0">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full rounded-lg shadow-lg"
                    width={800}
                    height={400}  
                  />
                </div>
              )}

              {/* Markdown Content */}
              <Suspense fallback={<MarkdownSkeleton />}>
                <MarkdownRenderer content={post.content} />
              </Suspense>
            </div>

            {/* Sidebar - Table of Contents (Desktop Only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents />
              </div>
            </aside>
          </div>

          {/* Author Card */}
          {post.author && (
            <div className="mt-12 pt-8 border-t">
              <AuthorCard author={post.author} />
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mx-auto max-w-6xl mt-16">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}
      </article>
    </>
  );
}
