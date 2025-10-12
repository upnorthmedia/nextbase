import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getBlogPosts, getCategoryBySlug } from '@/lib/blog/api';
import { BlogCard, BlogCardSkeleton } from '@/components/blog/BlogCard';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { siteConfig } from '@/lib/seo/constants';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const title = `${category.name} Articles`;
  const description = category.description || `Browse all articles in the ${category.name} category`;
  const url = `${siteConfig.url}/blog/category/${category.slug}`;

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

// Generate static params for categories (optional)
// export async function generateStaticParams() {
//   const categories = await getCategories();
//   return categories.map((category) => ({
//     slug: category.slug,
//   }));
// }

async function CategoryContent({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

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
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
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

// Loading skeleton
function CategorySkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

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
