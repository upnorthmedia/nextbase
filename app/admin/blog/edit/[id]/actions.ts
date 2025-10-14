'use server';

import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/blog/api';
import { revalidateAfterPostUpdate, revalidateAfterPostDelete } from '@/lib/blog/revalidation';
import { deleteImage, extractStoragePath, extractImageUrls } from '@/lib/supabase/storage';
import type { BlogPostFormData } from '@/lib/blog/types';

export async function getBlogPostAction(id: string) {
  try {
    const post = await getBlogPostById(id);
    return { success: true, post };
  } catch {
    return { success: false, error: 'Failed to fetch post' };
  }
}

export async function updateBlogPostAction(id: string, data: Partial<BlogPostFormData>) {
  try {
    const post = await updateBlogPost(id, data);

    // Trigger revalidation
    await revalidateAfterPostUpdate(post.slug);

    return { success: true, post };
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : 'Failed to update post';
    return { success: false, error: errorMessage };
  }
}

export async function deleteBlogPostAction(id: string) {
  try {
    // Get post data to find associated images
    const result = await getBlogPostAction(id);

    if (result.success && result.post) {
      const { post } = result;

      // Delete featured image from storage if it's a Supabase Storage URL
      if (post.featured_image && post.featured_image.includes('supabase.co/storage')) {
        const storagePath = await extractStoragePath(post.featured_image);
        if (storagePath) {
          await deleteImage(storagePath);
        }
      }

      // Delete content images from storage
      const imageUrls = await extractImageUrls(post.content || '');
      for (const url of imageUrls) {
        if (url.includes('supabase.co/storage')) {
          const storagePath = await extractStoragePath(url);
          if (storagePath) {
            await deleteImage(storagePath);
          }
        }
      }
    }

    // Delete the post from database
    await deleteBlogPost(id);

    // Trigger revalidation
    await revalidateAfterPostDelete();

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete post' };
  }
}
