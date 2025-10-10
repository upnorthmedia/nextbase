# Email Verification Setup Guide

## Overview
This guide explains how to configure email verification for your Supabase project following security best practices.

## Security Best Practices Implementation

### Why No Auto-Login After Email Verification?

1. **Security**: Email links can be prefetched by email clients or security scanners, potentially creating unwanted sessions
2. **Explicit Authentication**: Users should consciously log in after verification
3. **Audit Trail**: Separate events for email verification and login provide better tracking
4. **Industry Standard**: Most secure applications separate email verification from authentication

## Authentication Flow

1. User signs up with email and password
2. Confirmation email is sent
3. User clicks the verification link
4. Email is verified and user is redirected to `/login` with success message
5. User explicitly logs in with their credentials
6. User is authenticated and redirected to dashboard

## Supabase Dashboard Configuration

### 1. Email Templates

Navigate to your Supabase Dashboard → Authentication → Email Templates

#### Confirm Signup Template

Update the **Confirm signup** template with:

```html
<h2>Confirm your email address</h2>

<p>Thank you for signing up! Please confirm your email address by clicking the link below:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
    Confirm your email
  </a>
</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't create an account, you can safely ignore this email.</p>
```

#### Magic Link Template (if using passwordless)

```html
<h2>Your login link</h2>

<p>Click the link below to log in to your account:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
    Log in to your account
  </a>
</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

#### Password Reset Template

```html
<h2>Reset your password</h2>

<p>Click the link below to reset your password:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password">
    Reset password
  </a>
</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>
```

### 2. URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL**: Set to your production URL (e.g., `https://yourdomain.com`)
2. **Redirect URLs**: Add the following allowed redirect URLs:
   - `http://localhost:3000/**` (for local development)
   - `https://yourdomain.com/**` (for production)
   - Your staging URLs if applicable

### 3. Email Settings

In Supabase Dashboard → Authentication → Settings:

1. **Enable email confirmations**: Turn ON
2. **Secure email change**: Turn ON (requires users to confirm both old and new email)
3. **Email OTP expiry**: 3600 seconds (1 hour) for magic links, 86400 (24 hours) for signup confirmation

## Code Implementation Details

### `/app/auth/confirm/route.ts`
- Handles email verification links
- Verifies the OTP token
- Redirects to `/login` with success message for signup/email verification
- Handles password recovery and invites differently

### `/app/auth/actions.ts`
- `signup` function includes `emailRedirectTo` option pointing to `/auth/confirm`
- Ensures confirmation emails have the correct redirect URL

### `/app/login/page.tsx` and `/components/auth/login-client.tsx`
- Accepts and displays success/error messages from URL params
- Shows toast notification for successful email verification
- Cleans up URL after displaying the message

## Testing

1. **Local Testing**:
   - Sign up with a new email
   - Check console/email for confirmation link
   - Click the link
   - Verify redirect to login with success message
   - Log in with credentials
   - Verify redirect to dashboard

2. **Production Testing**:
   - Test with real email addresses
   - Verify email delivery
   - Test link expiry
   - Test invalid/expired tokens

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check Supabase email settings
   - Verify SMTP configuration if using custom SMTP
   - Check rate limits

2. **Redirect not working**:
   - Verify Site URL in Supabase dashboard
   - Check redirect URLs whitelist
   - Ensure `emailRedirectTo` uses correct domain

3. **Token invalid/expired**:
   - Check token expiry settings
   - Verify email template variables
   - Check for URL encoding issues

## Security Considerations

1. **Rate Limiting**: Supabase automatically rate limits email sending
2. **Token Expiry**: Tokens expire after configured time
3. **One-Time Use**: Verification tokens can only be used once
4. **HTTPS Only**: Always use HTTPS in production
5. **Session Management**: Sessions are created only after explicit login

## Migration for Existing Users

If you have existing users who expect auto-login:

1. Communicate the change via email/notification
2. Explain the security benefits
3. Ensure password reset flow works for users who forgot passwords
4. Consider a grace period with warnings

## Additional Enhancements

Consider implementing:

1. **Email verification reminders**: Send reminder emails for unverified accounts
2. **Account deletion**: Auto-delete unverified accounts after X days
3. **Audit logging**: Track verification attempts
4. **2FA**: Add two-factor authentication for additional security
5. **Session management**: Add "Remember me" option on login