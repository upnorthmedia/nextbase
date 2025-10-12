-- Fix blog RLS policies to not reference auth.users table directly
-- This migration updates the RLS policies to use a function instead of direct auth.users reference

-- Drop existing policies
DROP POLICY IF EXISTS "Authors can update their own profile" ON authors;
DROP POLICY IF EXISTS "Authors can update their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON blog_posts;

-- Create a function to get author_id from authenticated user
CREATE OR REPLACE FUNCTION get_author_id_for_user()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM authors
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate authors update policy
CREATE POLICY "Authors can update their own profile" ON authors
  FOR UPDATE USING (
    id = get_author_id_for_user()
  );

-- Recreate blog posts update policy
CREATE POLICY "Authors can update their own posts" ON blog_posts
  FOR UPDATE USING (
    author_id = get_author_id_for_user()
  );

-- Recreate blog posts delete policy
CREATE POLICY "Authors can delete their own posts" ON blog_posts
  FOR DELETE USING (
    author_id = get_author_id_for_user()
  );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_author_id_for_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_author_id_for_user() TO anon;
