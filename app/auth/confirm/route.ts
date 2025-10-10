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
      // Redirect to the specified next URL or dashboard
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl)
    }

    console.error('Error verifying OTP:', error)
  }

  // If we reach here, something went wrong
  const errorUrl = new URL('/auth/error', origin)
  errorUrl.searchParams.set('error', 'invalid_request')
  return NextResponse.redirect(errorUrl)
}