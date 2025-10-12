-- Blog Image Upload System Notes
-- This migration documents the image upload implementation
-- The actual storage bucket and RLS policies were already created in 20241210_blog_system.sql

-- Storage bucket 'blog-images' is already configured with:
-- - Public read access for all images
-- - Authenticated users can upload images
-- - Users can update/delete their own images

-- Storage path structure:
-- blog-images/
-- ├── avatars/              # Author profile images (5MB max)
-- │   └── {userId}-{timestamp}-{random}.{ext}
-- ├── featured/             # Post featured images (10MB max)
-- │   └── {userId}-{timestamp}-{random}.{ext}
-- └── content/              # In-post images (10MB max)
--     └── {userId}-{timestamp}-{random}.{ext}

-- Image upload features implemented:
-- 1. Drag-and-drop ImageUploader component with preview
-- 2. FeaturedImageUploader for post cover images (16:9 aspect)
-- 3. AvatarUploader for author profile images (1:1 aspect, circular)
-- 4. BlogEditor with image upload toolbar for content images
-- 5. Automatic image cleanup on post deletion
-- 6. File validation (type, size) on both client and server
-- 7. Server-side upload with authenticated Supabase client

-- Security features:
-- - RLS policies enforce authenticated-only uploads
-- - File type validation (image/jpeg, image/png, image/webp, image/gif)
-- - Size limits (5MB avatars, 10MB featured/content)
-- - User ID in filename for ownership tracking
-- - Server actions with proper authentication checks

-- No schema changes required - using existing storage infrastructure
