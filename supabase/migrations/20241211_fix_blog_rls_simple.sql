-- Simplified RLS policies for blog system
-- Allow all authenticated users to manage blog content (admin interface)

-- Drop existing policies
DROP POLICY IF EXISTS "Authors can update their own profile" ON authors;
DROP POLICY IF EXISTS "Authors can update their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON blog_posts;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_author_id_for_user();

-- Create simpler policies that allow authenticated users to manage content
CREATE POLICY "Authenticated users can update authors" ON authors
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.uid() IS NOT NULL);
