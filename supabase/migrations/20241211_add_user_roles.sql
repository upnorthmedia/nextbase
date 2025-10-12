-- Add role column to profiles table for role-based access control
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'admin', 'editor'));

-- Create index on role column for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update the first user to be an admin (by creation date)
-- This ensures there's at least one admin user in the system
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
    UPDATE profiles
    SET role = 'admin'
    WHERE id = (
      SELECT id
      FROM profiles
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
END $$;

-- Add helpful comment
COMMENT ON COLUMN profiles.role IS 'User role for access control: user (default), admin (full access), editor (content management)';
