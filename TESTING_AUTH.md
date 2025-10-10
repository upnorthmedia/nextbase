# Testing Authentication

## Quick Test Guide

### 1. Email Signup
1. Go to http://localhost:3000/signup
2. Enter an email address
3. Enter a password (min. 6 characters)
4. Confirm the password
5. Click "Create Account"

**What happens next depends on your Supabase settings:**

- **If email confirmation is DISABLED**: You'll be redirected to login immediately
- **If email confirmation is ENABLED**:
  - You'll see a message to check your email
  - Open the confirmation email from Supabase
  - Click the confirmation link
  - You'll be redirected back to your app

### 2. Check Your Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Users**
3. You should see your new user listed there
4. Check the user's status:
   - **Confirmed**: User can log in
   - **Waiting for verification**: User needs to confirm email

### 3. Email Confirmation Settings

To check/change email confirmation requirements:

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Email**
2. Look for "Enable email confirmations"
3. Toggle this based on your needs:
   - **Development**: Often easier with this OFF
   - **Production**: Should be ON for security

### 4. Common Issues and Solutions

#### "User already exists"
- The email is already registered
- Try logging in instead, or use a different email

#### "Passwords do not match"
- The password and confirm password fields don't match
- Re-enter both passwords carefully

#### No confirmation email received
- Check spam folder
- In Supabase Dashboard → **Settings** → **Email**, make sure SMTP is configured
- For development, you can disable email confirmation (see step 3)

#### Can't log in after signup
- If email confirmation is enabled, check if you've confirmed your email
- Check the Users tab in Supabase Dashboard to see the user's status

### 5. OAuth Testing (Google/GitHub)

To test OAuth providers:

1. You need to configure them first in Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable and configure Google or GitHub
   - Add redirect URLs:
     - `http://localhost:3000/auth/confirm` (development)
     - `https://your-domain.com/auth/confirm` (production)

2. Click "Continue with Google" or "Continue with GitHub" on the login page
3. Authorize the app
4. You'll be redirected back and logged in

### 6. Testing Protected Routes

Once logged in, test that authentication is working:

1. Visit http://localhost:3000/dashboard (should work when logged in)
2. Click "Sign out" in the user menu
3. Try visiting /dashboard again (should redirect to login)

### 7. Database Check

After a user signs up, check if the profile was created:

1. In Supabase Dashboard, go to **Table Editor**
2. Select the `profiles` table
3. You should see an entry for your user with their ID

If no profile exists, run the migration SQL again in the SQL Editor.

## Debug Information

If signup isn't working, check:

1. **Browser Console** (F12):
   - Look for any red error messages
   - Network tab → check if the signup request succeeds

2. **Server Logs**:
   - Check your terminal where `pnpm dev` is running
   - Look for any error messages

3. **Supabase Logs**:
   - Dashboard → **Logs** → **Auth**
   - Check for authentication errors

## Quick Checklist

- [ ] `.env.local` has correct Supabase URL and anon key
- [ ] App is running (`pnpm dev`)
- [ ] Database migration has been applied
- [ ] Email confirmation setting matches your needs
- [ ] For OAuth: providers are configured in Supabase
- [ ] Redirect URLs are correctly set for OAuth providers