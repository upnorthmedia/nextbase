/**
 * Storage types for Supabase Storage image uploads
 */

export type StoragePath = 'avatars' | 'featured' | 'content';

export interface UploadImageParams {
  file: File;
  path: StoragePath;
  fileName?: string;
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface DeleteImageResult {
  success: boolean;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const FILE_VALIDATION = {
  avatars: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  },
  featured: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  },
  content: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
  },
} as const;
