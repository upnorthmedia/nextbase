import { Metadata } from 'next';
import { Suspense } from 'react';
import { getBlogPosts, getCategories } from '@/lib/blog/api';
import { BlogCard, BlogCardSkeleton } from '@/components/blog/BlogCard';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { CategoryFilter, CategoryDropdown } from '@/components/blog/CategoryFilter';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { siteConfig } from '@/lib/seo/constants';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles and insights',
  openGraph: {
    title: 'Blog | NextBase',
    description: 'Read our latest articles and insights',
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

async function BlogContent({ searchParams }: BlogPageProps) {
  // Parse query params
  const { page, category, search } = await searchParams;
  const currentPage = Number(page) || 1;

  // Fetch data in parallel
  const [postsData, categories] = await Promise.all([
    getBlogPosts({
      page: currentPage,
      limit: 12,
      status: 'published',
      category: category,
      search: search,
    }),
    getCategories(),
  ]);

  const { posts, totalPages } = postsData;

  // Show empty state if no posts
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No posts found</h2>
        <p className="text-muted-foreground">
          {search
            ? `No posts matching "${search}"`
            : category
            ? 'No posts in this category yet'
            : 'No blog posts have been published yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Category Filter - Desktop */}
      <div className="hidden md:block mb-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={category}
        />
      </div>

      {/* Category Filter - Mobile */}
      <div className="md:hidden mb-6">
        <CategoryDropdown
          categories={categories}
          selectedCategory={category}
        />
      </div>

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
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  );
}

// Loading skeleton
function BlogSkeleton() {
  return (
    <>
      {/* Category skeleton */}
      <div className="mb-8 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        ))}
      </div>

      {/* Posts skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { search } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover insights, tutorials, and updates from our team.
              Stay informed about the latest in web development and technology.
            </p>
          </div>
          <div className="w-full md:w-80">
            <BlogSearch />
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {search && (
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm">
            Showing results for: <span className="font-semibold">{search}</span>
          </p>
        </div>
      )}

      {/* Blog Content with Suspense */}
      <Suspense fallback={<BlogSkeleton />}>
        <BlogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}