'use server';

import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/blog/api';
import { revalidateAfterPostUpdate, revalidateAfterPostDelete } from '@/lib/blog/revalidation';
import { deleteImage, extractStoragePath, extractImageUrls } from '@/lib/supabase/storage';
import type { BlogPostFormData } from '@/lib/blog/types';

export async function getBlogPostAction(id: string) {
  try {
    const post = await getBlogPostById(id);
    return { success: true, post };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { success: false, error: 'Failed to fetch post' };
  }
}

export async function updateBlogPostAction(id: string, data: Partial<BlogPostFormData>) {
  console.log('🟣 Server Action: updateBlogPostAction called');
  console.log('🟣 ID:', id);
  console.log('🟣 Data:', JSON.stringify(data, null, 2));

  try {
    console.log('🟣 Calling updateBlogPost...');
    const post = await updateBlogPost(id, data);
    console.log('🟢 updateBlogPost successful, post:', post);

    // Trigger revalidation
    console.log('🟣 Calling revalidateAfterPostUpdate...');
    await revalidateAfterPostUpdate(post.slug);
    console.log('🟢 Revalidation complete');

    return { success: true, post };
  } catch (error: unknown) {
    console.error('❌ Error updating post in action - Full details:');
    console.error('❌ Error object:', error);

    if (error && typeof error === 'object') {
      console.error('❌ Error message:', 'message' in error ? error.message : 'Unknown');
      console.error('❌ Error code:', 'code' in error ? error.code : 'Unknown');
      console.error('❌ Error details:', 'details' in error ? error.details : 'Unknown');
      console.error('❌ Error hint:', 'hint' in error ? error.hint : 'Unknown');
      console.error('❌ Error stack:', 'stack' in error ? error.stack : 'Unknown');
      console.error('❌ Complete error JSON:', JSON.stringify(error, null, 2));
    }
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
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}
