'use client';

import Link from 'next/link';
import type { Category } from '@/lib/blog/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  className?: string;
  showCount?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  className,
  showCount = true
}: CategoryFilterProps) {
  // Helper to create URL - use dedicated category pages for cleaner URLs
  const createCategoryURL = (categorySlug: string | null) => {
    if (categorySlug) {
      // Use dedicated category page: /blog/category/slug
      return `/blog/category/${categorySlug}`;
    } else {
      // Return to main blog listing
      return '/blog';
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* All Posts button */}
      <Button
        variant={!selectedCategory ? 'default' : 'outline'}
        size="sm"
        className="transition-all"
        asChild
      >
        <Link href={createCategoryURL(null)}>
          All Posts
        </Link>
      </Button>

      {/* Category buttons */}
      {categories.map((category) => {
        const isActive = selectedCategory === category.slug;

        return (
          <Button
            key={category.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="transition-all"
            asChild
          >
            <Link href={createCategoryURL(category.slug)}>
              <span className="flex items-center gap-1.5">
                {category.name}
                {showCount && category.post_count !== undefined && (
                  <span className="ml-1 opacity-70">
                    ({category.post_count})
                  </span>
                )}
              </span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

// Alternative chip-style filter for compact spaces
export function CategoryChips({
  categories,
  selectedCategory,
  className
}: CategoryFilterProps) {
  const createCategoryURL = (categorySlug: string | null) => {
    if (categorySlug) {
      return `/blog/category/${categorySlug}`;
    } else {
      return '/blog';
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Link
        href={createCategoryURL(null)}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all',
          !selectedCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80'
        )}
      >
        All
      </Link>

      {categories.map((category) => {
        const isActive = selectedCategory === category.slug;

        return (
          <Link
            key={category.id}
            href={createCategoryURL(category.slug)}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}

// Dropdown filter for mobile
export function CategoryDropdown({
  categories,
  selectedCategory,
  className
}: CategoryFilterProps) {
  const createCategoryURL = (categorySlug: string | null) => {
    if (categorySlug) {
      return `/blog/category/${categorySlug}`;
    } else {
      return '/blog';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <select
        value={selectedCategory || ''}
        onChange={(e) => {
          const url = createCategoryURL(e.target.value || null);
          window.location.href = url;
        }}
        className="w-full appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}