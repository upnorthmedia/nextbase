'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate, getReadingTimeText, truncateText } from '@/lib/blog/utils';
import type { BlogPost } from '@/lib/blog/types';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  featured?: boolean;
}

export function BlogCard({ post, className, featured = false }: BlogCardProps) {
  const formattedDate = formatDate(post.published_at || post.created_at);
  const readingTimeText = post.reading_time ? getReadingTimeText(post.reading_time) : null;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg dark:hover:shadow-primary/5',
        featured && 'md:col-span-2 md:row-span-2',
        className
      )}
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Read {post.title}</span>
      </Link>

      {/* Featured Image */}
      {post.featured_image && (
        <div className={cn(
          'relative overflow-hidden bg-muted',
          featured ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[16/9]'
        )}>
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            priority={featured}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 md:p-6">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <Link
                key={cat.category?.id}
                href={`/blog/${cat.category?.slug}`}
                className="relative z-20 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                onClick={(e) => e.stopPropagation()}
              >
                {cat.category?.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className={cn(
          'font-bold leading-tight tracking-tight',
          featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
          'mb-2 group-hover:text-primary transition-colors'
        )}>
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className={cn(
            'text-muted-foreground line-clamp-3 mb-4',
            featured && 'md:line-clamp-4 md:text-lg'
          )}>
            {truncateText(post.excerpt, featured ? 200 : 150)}
          </p>
        )}

        {/* Metadata */}
        <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
          {/* Author */}
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium">{post.author.name}</span>
            </div>
          )}

          {/* Date */}
          <time dateTime={post.published_at || post.created_at}>
            {formattedDate}
          </time>

          {/* Reading Time */}
          {readingTimeText && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{readingTimeText}</span>
            </>
          )}

          {/* View Count */}
          {post.view_count > 0 && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{post.view_count.toLocaleString()} views</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// Skeleton loader for BlogCard
export function BlogCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-card',
        featured && 'md:col-span-2 md:row-span-2'
      )}
    >
      {/* Image skeleton */}
      <div className={cn(
        'animate-pulse bg-muted',
        featured ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[16/9]'
      )} />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-4 md:p-6">
        {/* Category skeleton */}
        <div className="mb-2 flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Title skeleton */}
        <div className={cn(
          'mb-2 animate-pulse rounded bg-muted',
          featured ? 'h-8 md:h-10' : 'h-6 md:h-8'
        )} />

        {/* Excerpt skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>

        {/* Metadata skeleton */}
        <div className="mt-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}