import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email_change' | 'email' | null
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle OAuth errors (e.g., user cancelled the flow)
  if (error) {
    console.error('OAuth error:', error, error_description)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error)
    if (error_description) {
      errorUrl.searchParams.set('description', error_description)
    }
    return NextResponse.redirect(errorUrl)
  }

  // Handle OAuth callback with code
  if (code) {
    const supabase = await createClient()

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        const errorUrl = new URL('/auth/error', origin)
        errorUrl.searchParams.set('error', 'session_exchange_failed')
        return NextResponse.redirect(errorUrl)
      }

      // Successfully authenticated with OAuth
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl)
    } catch (err) {
      console.error('Unexpected error during OAuth callback:', err)
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('error', 'unexpected_error')
      return NextResponse.redirect(errorUrl)
    }
  }

  // Handle email confirmation with token_hash
  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Email verified successfully - redirect to login with success message
      // We don't auto-login for security best practices
      if (type === 'signup' || type === 'email') {
        const loginUrl = new URL('/login', origin)
        loginUrl.searchParams.set('message', 'Email verified successfully! Please log in to continue.')
        return NextResponse.redirect(loginUrl)
      }

      // For password recovery or email change, redirect to the next URL
      if (type === 'recovery' || type === 'email_change') {
        const redirectUrl = new URL(next, origin)
        return NextResponse.redirect(redirectUrl)
      }

      // For invites, redirect to dashboard (they should already have a session)
      if (type === 'invite') {
        const redirectUrl = new URL('/dashboard', origin)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // Handle specific verification errors
      console.error('Error verifying OTP:', error)
      const errorUrl = new URL('/auth/error', origin)

      if (error.message?.includes('expired')) {
        errorUrl.searchParams.set('error', 'verification_expired')
        errorUrl.searchParams.set('description', 'This verification link has expired. Please request a new one.')
      } else if (error.message?.includes('already confirmed') || error.message?.includes('already been confirmed')) {
        // Email already verified - redirect to login
        const loginUrl = new URL('/login', origin)
        loginUrl.searchParams.set('message', 'Your email is already verified. Please log in.')
        return NextResponse.redirect(loginUrl)
      } else {
        errorUrl.searchParams.set('error', 'verification_failed')
        errorUrl.searchParams.set('description', 'Unable to verify your email. The link may be invalid or already used.')
      }

      return NextResponse.redirect(errorUrl)
    }
  }

  // If we reach here, something went wrong
  const errorUrl = new URL('/auth/error', origin)
  errorUrl.searchParams.set('error', 'invalid_request')
  return NextResponse.redirect(errorUrl)
}