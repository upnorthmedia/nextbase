'use server';

import { createClient } from '@/lib/supabase/server';
import {
  type UploadImageParams,
  type UploadImageResult,
  type DeleteImageResult,
  type FileValidationResult,
  type StoragePath,
  FILE_VALIDATION,
} from './storage.types';

/**
 * Validate file before upload
 */
function validateFile(file: File, path: StoragePath): FileValidationResult {
  const validation = FILE_VALIDATION[path];

  // Check file type
  const isValidType = validation.allowedTypes.some(type => file.type === type);
  if (!isValidType) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${validation.allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > validation.maxSize) {
    const maxSizeMB = Math.round(validation.maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique filename with user context
 */
function generateUniqueFileName(userId: string, originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${userId}-${timestamp}-${random}.${ext}`;
}

/**
 * Upload an image to Supabase Storage
 * Server-side only - uses authenticated Supabase client
 */
export async function uploadImage(
  params: UploadImageParams
): Promise<UploadImageResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate file
    const validation = validateFile(params.file, params.path);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const fileName =
      params.fileName || generateUniqueFileName(user.id, params.file.name);
    const filePath = `${params.path}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, params.file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('blog-images').getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * Server-side only - uses authenticated Supabase client
 */
export async function deleteImage(path: string): Promise<DeleteImageResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('blog-images')
      .remove([path]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get public URL for a storage path
 */
export async function getPublicUrl(path: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from('blog-images').getPublicUrl(path);
  return publicUrl;
}

/**
 * Extract storage path from a Supabase Storage public URL
 */
export async function extractStoragePath(url: string): Promise<string | null> {
  try {
    // Match pattern: .../storage/v1/object/public/blog-images/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/blog-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extract image URLs from markdown content
 */
export async function extractImageUrls(markdown: string): Promise<string[]> {
  const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}
