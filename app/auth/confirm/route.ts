import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email_change' | 'email' | null
  const next = searchParams.get('next') ?? '/dashboard'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    // Handle local development
    if (forwardedHost) {
      // Use the forwarded host if available
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const redirectUrl = new URL(next, `${protocol}://${forwardedHost}`)
      redirectUrl.searchParams.delete('token_hash')
      redirectUrl.searchParams.delete('type')

      return NextResponse.redirect(redirectUrl)
    }
  }

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect to the specified next URL or dashboard
      const redirectUrl = new URL(next, new URL(request.url).origin)
      redirectUrl.searchParams.delete('token_hash')
      redirectUrl.searchParams.delete('type')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return the user to an error page with instructions
  const errorUrl = new URL('/auth/error', new URL(request.url).origin)
  return NextResponse.redirect(errorUrl)
}