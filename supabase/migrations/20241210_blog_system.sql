-- Blog System Migration
-- Creates tables for authors, categories, blog posts, and related structures

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog post categories junction table
CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Create full-text search index
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(excerpt, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS blog_posts_fts ON blog_posts USING GIN (fts);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Authors policies
CREATE POLICY "Public can read authors" ON authors
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create authors" ON authors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own profile" ON authors
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Categories policies
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Blog posts policies
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (
    status = 'published' AND
    (published_at IS NULL OR published_at <= NOW())
  );

CREATE POLICY "Authenticated users can read all posts" ON blog_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own posts" ON blog_posts
  FOR UPDATE USING (
    author_id IN (
      SELECT id FROM authors WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Authors can delete their own posts" ON blog_posts
  FOR DELETE USING (
    author_id IN (
      SELECT id FROM authors WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Blog post categories policies
CREATE POLICY "Public can read post categories" ON blog_post_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post categories" ON blog_post_categories
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create storage bucket for blog images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-images bucket
CREATE POLICY "Public can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' AND
    auth.uid() IS NOT NULL
  );

-- Insert sample categories (optional - remove in production)
INSERT INTO categories (name, slug, description, color) VALUES
  ('Technology', 'technology', 'Articles about tech and development', '#3B82F6'),
  ('Tutorial', 'tutorial', 'Step-by-step guides and how-tos', '#10B981'),
  ('News', 'news', 'Latest news and updates', '#F59E0B'),
  ('Opinion', 'opinion', 'Thoughts and perspectives', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

-- Create a default author for the authenticated user (if email exists)
INSERT INTO authors (name, email, bio)
SELECT
  COALESCE(raw_user_meta_data->>'full_name', email) as name,
  email,
  'Blog author'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (email) DO NOTHING;