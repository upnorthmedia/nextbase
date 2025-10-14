# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [cody@upnorthmedia.co](mailto:cody@upnorthmedia.co) or through GitHub's private vulnerability reporting feature.

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., SQL injection, XSS, CSRF, authentication bypass)
- **Affected component(s)** (file paths, routes, features)
- **Step-by-step reproduction** instructions
- **Proof of concept** code or screenshots (if applicable)
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days regarding acceptance/rejection and timeline
- **Resolution**: Security patches will be released as soon as possible depending on complexity

### Disclosure Policy

- Please give us reasonable time to fix the vulnerability before public disclosure
- We will credit you in our security advisory (unless you prefer to remain anonymous)
- We may request your assistance in validating the fix

## Security Best Practices for Users

### Environment Variables

- **Never commit** `.env.local` files to version control
- **Rotate credentials** if accidentally exposed
- Use **different credentials** for development, staging, and production
- Store **service role keys** securely - they grant admin access to your database

### Supabase Security

1. **Enable RLS** (Row Level Security) on all tables
2. **Test RLS policies** with different user roles
3. **Never expose** service role keys in client-side code
4. **Use anon key** only for client-side operations
5. **Enable email confirmation** in production
6. **Configure SMTP** for proper email delivery
7. **Set proper CORS** policies for your domain

### Authentication

- **Enable email verification** for all new signups
- **Use strong passwords** (minimum 6 characters, but recommend 12+)
- **Implement rate limiting** on auth endpoints
- **Enable MFA** if available for admin accounts
- **Set secure session timeouts**

### Database

- **Review RLS policies** regularly
- **Audit admin access** periodically
- **Backup database** regularly
- **Monitor for unusual activity**
- **Use prepared statements** (handled by Supabase client)

### API Security

- **Validate all inputs** on the server side
- **Sanitize user content** before rendering
- **Use HTTPS** in production
- **Implement CSRF protection** (handled by Next.js)
- **Set security headers** (CSP, HSTS, etc.)

### File Uploads

- **Validate file types** and sizes
- **Scan uploads** for malware (if handling user uploads)
- **Use unique file names** to prevent overwrites
- **Set proper storage bucket policies** in Supabase

### Dependencies

- **Run** `pnpm audit` regularly
- **Update dependencies** promptly when security patches are released
- **Review** new dependencies before adding them
- **Monitor** for known vulnerabilities in dependencies

## Known Security Considerations

### Current Implementation

1. **Service Role Key**: Only use server-side. Never expose in client code.
2. **Image Uploads**: Validate file types and implement size limits
3. **Email Verification**: Enabled by default - don't disable in production
4. **Password Requirements**: Minimum 6 characters (consider increasing to 12+)
5. **Session Management**: Handled by Supabase Auth with refresh tokens

### Recommended Enhancements

Consider implementing these additional security measures:

- **Rate Limiting**: Add rate limiting on auth endpoints
- **CAPTCHA**: Prevent automated attacks on signup/login
- **2FA/MFA**: Two-factor authentication for admin accounts
- **Audit Logging**: Track admin actions and sensitive operations
- **Content Security Policy**: Strict CSP headers
- **DDoS Protection**: Use Vercel's DDoS protection or Cloudflare
- **Secrets Management**: Use Vercel secrets or similar for sensitive configs

## Security Checklist for Deployment

Before deploying to production:

- [ ] All environment variables set correctly
- [ ] Different credentials for production vs. development
- [ ] Email verification enabled in Supabase
- [ ] SMTP configured for email delivery
- [ ] RLS policies tested with all user roles
- [ ] Service role key never exposed in client code
- [ ] HTTPS enabled (handled by Vercel)
- [ ] Proper CORS policy configured
- [ ] At least one admin user created
- [ ] Database backups configured
- [ ] Security headers configured in `next.config.ts`
- [ ] Dependencies audited (`pnpm audit`)
- [ ] Error messages don't expose sensitive information
- [ ] File upload limits configured
- [ ] Session timeouts appropriate for use case

## Updates and Notifications

We will notify users of security updates through:

- **GitHub Security Advisories**
- **Release notes** for security patches
- **Email** for critical vulnerabilities (if contact provided)

Stay informed by:
- **Watching** this repository for security advisories
- **Starring** the repo to get release notifications
- **Following** our update schedule

## Contact

For security concerns, please contact: [cody@upnorthmedia.co](mailto:cody@upnorthmedia.co)

For general questions, use GitHub Discussions or Issues.

---

Thank you for helping keep NextBase and its users safe!
