import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/blog/types';
import { formatDate } from '@/lib/blog/utils';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RelatedPostsProps {
  posts: BlogPost[];
  className?: string;
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={cn('mt-16', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Related Articles</h2>
        <p className="text-muted-foreground mt-1">
          Continue reading with these related posts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <RelatedPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Read {post.title}</span>
      </Link>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.category?.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${cat.category?.color}20`,
                  color: cat.category?.color,
                }}
              >
                {cat.category?.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold leading-tight tracking-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>

          <span className="flex items-center gap-1 font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read more
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
