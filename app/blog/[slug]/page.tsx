import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getBlogPostBySlug, getRelatedPosts, incrementViewCount, getBlogPosts, getCategoryBySlug } from '@/lib/blog/api';
import { Category } from '@/lib/blog/types';
import { MarkdownRenderer, MarkdownSkeleton } from '@/components/markdown/MarkdownRenderer';
import { TableOfContents } from '@/components/markdown/TableOfContents';
import { ReadingProgress } from '@/components/markdown/ReadingProgress';
import { AuthorCard, AuthorMeta } from '@/components/blog/AuthorCard';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { BlogCard, BlogCardSkeleton } from '@/components/blog/BlogCard';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { siteConfig } from '@/lib/seo/constants';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface BlogSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  // First check if it's a category
  const category = await getCategoryBySlug(slug);

  if (category) {
    const title = `${category.name} Articles`;
    const description = category.description || `Browse all articles in the ${category.name} category`;
    const url = `${siteConfig.url}/blog/${category.slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: siteConfig.name,
        locale: 'en_US',
        type: 'website',
      },
      alternates: {
        canonical: url,
      },
    };
  }

  // Otherwise, try to get the blog post
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Not Found',
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

// Category Content Component
async function CategoryContent({ params, searchParams }: BlogSlugPageProps) {
  const { slug } = await params;
  const { page } = await searchParams || {};

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const currentPage = Number(page) || 1;

  // Fetch posts for this category
  const { posts, totalPages } = await getBlogPosts({
    page: currentPage,
    limit: 12,
    status: 'published',
    category: category.id,
  });

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <span className="text-3xl text-muted-foreground">
            #
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
        <p className="text-muted-foreground mb-6">
          There are no published posts in the {category.name} category yet.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Blog Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard
            key={post.id}
            post={post}
            featured={index === 0}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <BlogPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </>
  );
}

// Loading skeleton for categories
function CategorySkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Category Page Component
async function CategoryPage({ params, searchParams, category }: BlogSlugPageProps & { category: Category }) {

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-2xl font-bold text-primary">
              #
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
          </div>
        </div>

        {category.description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        )}

        {category.post_count !== undefined && (
          <p className="mt-4 text-sm text-muted-foreground">
            {category.post_count} {category.post_count === 1 ? 'article' : 'articles'}
          </p>
        )}
      </div>

      {/* Category Content with Suspense */}
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>

      {/* Back to Blog Link */}
      <div className="mt-12 pt-8 border-t">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          View all categories
        </Link>
      </div>
    </div>
  );
}

// Blog Post Page Component
async function BlogPostPage({ params }: BlogSlugPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementViewCount(post.id).catch(() => {});

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
                    href={`/blog/${cat.category?.slug}`}
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
                    priority
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

// Main component that routes to either category or blog post
export default async function BlogSlugPage({ params, searchParams }: BlogSlugPageProps) {
  const { slug } = await params;

  // First check if it's a category
  const category = await getCategoryBySlug(slug);

  if (category) {
    return <CategoryPage params={params} searchParams={searchParams} category={category} />;
  }

  // Otherwise, render as blog post
  return <BlogPostPage params={params} />;
}
