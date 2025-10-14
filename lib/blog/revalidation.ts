/**
 * Server-side utility for triggering on-demand revalidation
 * Uses Next.js revalidatePath and revalidateTag
 */

import { revalidatePath, revalidateTag } from 'next/cache';

interface RevalidationOptions {
  type: 'post' | 'category' | 'author' | 'all';
  slug?: string;
  tags?: string[];
}

/**
 * Trigger revalidation of blog pages using Next.js cache revalidation
 */
export async function revalidateBlogCache(options: RevalidationOptions): Promise<boolean> {
  try {
    // Revalidate based on type
    switch (options.type) {
      case 'post':
        // Revalidate the specific post page
        if (options.slug) {
          revalidatePath(`/blog/${options.slug}`);
        }
        // Also revalidate blog home and admin pages
        revalidatePath('/blog');
        revalidatePath('/admin/blog');
        break;

      case 'category':
        // Revalidate category page
        if (options.slug) {
          revalidatePath(`/blog/${options.slug}`);
        }
        // Also revalidate blog home
        revalidatePath('/blog');
        revalidatePath('/admin/blog');
        break;

      case 'author':
        // Revalidate all blog pages when author changes
        revalidatePath('/blog');
        revalidatePath('/admin/blog');
        break;

      case 'all':
        // Revalidate all blog-related paths
        revalidatePath('/blog', 'layout');
        revalidatePath('/admin/blog', 'layout');
        break;
    }

    // Revalidate any custom tags if provided
    if (options.tags) {
      options.tags.forEach(tag => revalidateTag(tag));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Revalidate after creating a new post
 */
export function revalidateAfterPostCreate(slug: string) {
  return revalidateBlogCache({ type: 'post', slug });
}

/**
 * Revalidate after updating a post
 */
export function revalidateAfterPostUpdate(slug: string) {
  return revalidateBlogCache({ type: 'post', slug });
}

/**
 * Revalidate after deleting a post
 */
export function revalidateAfterPostDelete() {
  return revalidateBlogCache({ type: 'all' });
}

/**
 * Revalidate after creating/updating a category
 */
export function revalidateAfterCategoryChange(slug: string) {
  return revalidateBlogCache({ type: 'category', slug });
}

/**
 * Revalidate after deleting a category
 */
export function revalidateAfterCategoryDelete() {
  return revalidateBlogCache({ type: 'all' });
}

/**
 * Revalidate after author changes
 */
export function revalidateAfterAuthorChange() {
  return revalidateBlogCache({ type: 'author' });
}
