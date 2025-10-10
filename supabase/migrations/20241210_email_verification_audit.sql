-- Email Verification Audit Table
-- This migration creates an audit table for tracking email verification attempts
-- This is optional but recommended for security monitoring

-- Create email verification attempts table
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.email_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own verification attempts
CREATE POLICY "Users can view own verification attempts"
    ON public.email_verification_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create a policy for service role to insert verification attempts
-- This would be used by Edge Functions or backend services
CREATE POLICY "Service role can insert verification attempts"
    ON public.email_verification_attempts
    FOR INSERT
    WITH CHECK (true);

-- Optional: Function to log verification attempts
-- This can be called from Edge Functions or triggers
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

-- Optional: View for recent verification attempts (last 30 days)
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

-- Grant permissions for the view
GRANT SELECT ON public.recent_verification_attempts TO authenticated;

-- Optional: Function to clean up old verification attempts (older than 90 days)
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

-- Optional: Create a scheduled job to run cleanup weekly (requires pg_cron extension)
-- Uncomment if pg_cron is available in your Supabase project
-- SELECT cron.schedule(
--     'cleanup-old-verification-attempts',
--     '0 2 * * 0', -- Run at 2 AM every Sunday
--     $$SELECT public.cleanup_old_verification_attempts();$$
-- );

-- Comments for documentation
COMMENT ON TABLE public.email_verification_attempts IS 'Audit log for email verification attempts including successful and failed attempts';
COMMENT ON COLUMN public.email_verification_attempts.verification_type IS 'Type of verification: signup, email_change, or magic_link';
COMMENT ON COLUMN public.email_verification_attempts.token_hash IS 'Hash of the verification token (never store the actual token)';
COMMENT ON COLUMN public.email_verification_attempts.verified_at IS 'Timestamp when the email was successfully verified';
COMMENT ON COLUMN public.email_verification_attempts.ip_address IS 'IP address of the verification attempt for security monitoring';
COMMENT ON COLUMN public.email_verification_attempts.user_agent IS 'User agent string for device/browser identification';
COMMENT ON FUNCTION public.log_email_verification_attempt IS 'Logs an email verification attempt for audit purposes';
COMMENT ON FUNCTION public.cleanup_old_verification_attempts IS 'Removes verification attempt records older than 90 days';