'use server';

import { createBlogPost } from '@/lib/blog/api';
import { revalidateAfterPostCreate } from '@/lib/blog/revalidation';
import type { BlogPostFormData } from '@/lib/blog/types';

export async function createBlogPostAction(data: BlogPostFormData) {
  try {
    const post = await createBlogPost(data);

    // Trigger revalidation
    await revalidateAfterPostCreate(post.slug);

    return { success: true, post };
  } catch {
    return { success: false, error: 'Failed to create post' };
  }
}
