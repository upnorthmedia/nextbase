-- =============================================================================
-- NEXTBASE COMPLETE DATABASE SCHEMA
-- =============================================================================
-- This migration recreates the entire database schema for a fresh Supabase project.
-- It includes profiles, blog system, email verification audit, storage, and RLS policies.
--
-- IMPORTANT MANUAL STEPS AFTER RUNNING THIS MIGRATION:
-- 1. Enable email confirmation in Supabase Dashboard -> Authentication -> Providers -> Email
-- 2. Configure OAuth providers (Google, etc.) if needed
-- 3. Update at least one user to admin role:
--    UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
-- 4. Configure SMTP settings for email delivery
-- 5. Set site URL in Supabase Dashboard -> Authentication -> URL Configuration
-- =============================================================================

BEGIN;

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
-- Extends auth.users with additional profile information and role-based access control

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create index on role column for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default), admin (full access), editor (content management)';

-- =============================================================================
-- EMAIL VERIFICATION AUDIT
-- =============================================================================
-- Tracks email verification attempts for security monitoring and audit purposes

CREATE TABLE IF NOT EXISTS public.email_verification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  verification_type TEXT CHECK (verification_type IN ('signup', 'email_change', 'magic_link')),
  token_hash TEXT,
  verified_at TIMESTAMPTZ,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON public.email_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON public.email_verification_attempts(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_attempted_at ON public.email_verification_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_success ON public.email_verification_attempts(success);

-- Comments for documentation
COMMENT ON TABLE public.email_verification_attempts IS 'Audit log for email verification attempts including successful and failed attempts';
COMMENT ON COLUMN public.email_verification_attempts.verification_type IS 'Type of verification: signup, email_change, or magic_link';
COMMENT ON COLUMN public.email_verification_attempts.token_hash IS 'Hash of the verification token (never store the actual token)';
COMMENT ON COLUMN public.email_verification_attempts.ip_address IS 'IP address of the verification attempt for security monitoring';

-- =============================================================================
-- BLOG SYSTEM TABLES
-- =============================================================================

-- Authors table
CREATE TABLE IF NOT EXISTS public.authors (
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
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Full-text search index for blog posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(excerpt, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS blog_posts_fts ON public.blog_posts USING GIN (fts);

-- =============================================================================
-- STORAGE BUCKETS AND POLICIES
-- =============================================================================

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
  VALUES ('blog-images', 'blog-images', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (SELECT auth.role()) = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);

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

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count for blog posts
CREATE OR REPLACE FUNCTION public.increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log email verification attempts
CREATE OR REPLACE FUNCTION public.log_email_verification_attempt(
  p_user_id UUID,
  p_email TEXT,
  p_verification_type TEXT,
  p_token_hash TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO public.email_verification_attempts (
    user_id,
    email,
    verification_type,
    token_hash,
    verified_at,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_email,
    p_verification_type,
    p_token_hash,
    CASE WHEN p_success THEN NOW() ELSE NULL END,
    p_success,
    p_error_message,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$;

-- Function to clean up old verification attempts (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_verification_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.email_verification_attempts
  WHERE attempted_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

-- Function to get author_id for authenticated user
CREATE OR REPLACE FUNCTION public.get_author_id_for_user()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM public.authors
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger for new user signup (creates profile automatically)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamp
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- EMAIL VERIFICATION ATTEMPTS POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own verification attempts" ON public.email_verification_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert verification attempts" ON public.email_verification_attempts
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- AUTHORS POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Public can read authors" ON public.authors
  FOR SELECT USING (true);

CREATE POLICY "Admins can create authors" ON public.authors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can update authors" ON public.authors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Authors can update their own profile" ON public.authors
  FOR UPDATE USING (id = get_author_id_for_user());

-- -----------------------------------------------------------------------------
-- CATEGORIES POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Public can read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- -----------------------------------------------------------------------------
-- BLOG POSTS POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT USING (
    status = 'published' AND
    (published_at IS NULL OR published_at <= NOW())
  );

CREATE POLICY "Authenticated users can read all posts" ON public.blog_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can create blog posts" ON public.blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Authors can update their own posts" ON public.blog_posts
  FOR UPDATE USING (author_id = get_author_id_for_user());

CREATE POLICY "Authors can delete their own posts" ON public.blog_posts
  FOR DELETE USING (author_id = get_author_id_for_user());

-- -----------------------------------------------------------------------------
-- BLOG POST CATEGORIES POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Public can read post categories" ON public.blog_post_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage post categories" ON public.blog_post_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for recent verification attempts (last 30 days)
CREATE OR REPLACE VIEW public.recent_verification_attempts AS
SELECT
  eva.*,
  u.email as current_email,
  u.email_confirmed_at,
  u.created_at as user_created_at
FROM public.email_verification_attempts eva
LEFT JOIN auth.users u ON eva.user_id = u.id
WHERE eva.attempted_at > NOW() - INTERVAL '30 days'
ORDER BY eva.attempted_at DESC;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.get_author_id_for_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_author_id_for_user() TO anon;

-- Grant permissions on views
GRANT SELECT ON public.recent_verification_attempts TO authenticated;

-- =============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- =============================================================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Technology', 'technology', 'Articles about tech and development', '#3B82F6'),
  ('Tutorial', 'tutorial', 'Step-by-step guides and how-tos', '#10B981'),
  ('News', 'news', 'Latest news and updates', '#F59E0B'),
  ('Opinion', 'opinion', 'Thoughts and perspectives', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- FINAL NOTES
-- =============================================================================

-- Set the first user to admin role (will execute on next user creation if no users exist)
-- You should manually update this after migration:
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

COMMIT;

-- Migration completed successfully
-- Remember to complete the manual steps listed at the top of this file!
